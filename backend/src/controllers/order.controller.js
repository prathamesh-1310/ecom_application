import prisma from '../config/prisma.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/payment.service.js';
import { sendOrderConfirmationEmail } from '../services/email.service.js';

export const createOrder = async (req, res) => {
  try {
    const {
      cartId,
      shippingAddress,
      billingAddress,
      couponCode,
      platform = 'RETAIL',
      policyAccepted,
      policyVersion = '1.0',
    } = req.body;

    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : shippingAddress.email;

    // MANDATORY POLICY ACCEPTANCE CHECK
    if (!policyAccepted) {
      return res.status(400).json({
        success: false,
        message:
          'You must acknowledge and accept the No Return and No Refund Policy before placing an order. All sales are final.',
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: { include: { pricingRules: true } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate Subtotal & Validate B2B MOQ
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      if (platform === 'B2B' && item.quantity < item.product.moq) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} requires a minimum order quantity (MOQ) of ${item.product.moq}`,
        });
      }

      let unitPrice = item.product.salePrice || item.product.retailPrice;
      if (platform === 'B2B' && item.product.b2bPrice) {
        unitPrice = item.product.b2bPrice;
        if (item.product.pricingRules && item.product.pricingRules.length > 0) {
          const matchingRule = item.product.pricingRules
            .filter((rule) => item.quantity >= rule.minimumQuantity)
            .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0];
          if (matchingRule) unitPrice = matchingRule.price;
        }
      }

      if (item.variant && item.variant.priceAdjustment) {
        unitPrice += item.variant.priceAdjustment;
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        sku: item.variant ? item.variant.sku : item.product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    // Coupon discount logic
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.status === 'ACTIVE') {
        if (subtotal >= coupon.minimumOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const shippingCharge = subtotal > 1500 || platform === 'B2B' ? 0 : 99;
    const tax = Math.round(subtotal * 0.03 * 100) / 100; // 3% GST on jewelry
    const totalAmount = Math.max(0, subtotal - discount + shippingCharge + tax);

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    // Create Order with nested items and policy acceptance record
    const order = await prisma.order.create({
      data: {
        userId,
        platform,
        orderNumber,
        subtotal,
        discount,
        shippingCharge,
        tax,
        totalAmount,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        shippingStatus: 'Not Shipped',
        shippingAddressJson: JSON.stringify(shippingAddress),
        billingAddressJson: JSON.stringify(billingAddress || shippingAddress),
        policyVersion,
        policyAccepted: true,
        policyAcceptedAt: new Date(),
        policyAcceptedIp: String(clientIp),
        items: {
          create: orderItemsData,
        },
        policyAcceptances: {
          create: {
            userId,
            policyVersionId: null,
            acceptedAt: new Date(),
            ipAddress: String(clientIp),
            userAgent,
          },
        },
      },
      include: { items: true },
    });

    // Create Razorpay Order
    const rzpResult = await createRazorpayOrder(totalAmount, order.id);

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: 'Razorpay',
        transactionId: rzpResult.order ? rzpResult.order.id : `mock_tx_${Date.now()}`,
        amount: totalAmount,
        status: 'Created',
      },
    });

    // Clear cart after order creation
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        policyAccepted: true,
      },
      razorpayOrder: rzpResult.order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Order creation failed', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'Failed' },
      });
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
      },
      include: { items: true, user: true },
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: 'Captured',
        transactionId: razorpayPaymentId,
        paymentMethod: 'Razorpay / Online',
      },
    });

    // Send order confirmation email with strict No Return policy notice
    const emailTo = order.user?.email || JSON.parse(order.shippingAddressJson).email;
    if (emailTo) {
      sendOrderConfirmationEmail(order, emailTo);
    }

    return res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Payment verification error', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        supportRequests: true,
      },
    });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payments: true,
        supportRequests: true,
        policyAcceptances: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching order details', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Cancellation rule: Only allowed if order is still Pending or Confirmed (before Processing / Shipped)
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}. Under our No Return and No Refund Policy, shipped or processed orders are final.`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'Cancelled',
      },
    });

    return res.json({ success: true, message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error cancelling order', error: error.message });
  }
};
