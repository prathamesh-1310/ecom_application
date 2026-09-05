import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
      accountPassword,
    } = req.body;

    let userId = req.user ? req.user.id : null;
    let newAuthToken = null;
    let authUserObj = null;

    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026');
          if (decoded && decoded.userId) {
            userId = decoded.userId;
          }
        }
      } catch (e) {
        // ignore token error
      }
    }

    // Auto-Account Registration / Sign-In handling if not logged in
    if (!userId) {
      const email = shippingAddress?.email;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Valid email address is required to place an order.' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        if (accountPassword) {
          const isMatch = await bcrypt.compare(accountPassword, existingUser.passwordHash);
          if (!isMatch) {
            return res.status(400).json({
              success: false,
              message: 'An account with this email already exists. Please enter your correct account password to proceed.',
            });
          }
          userId = existingUser.id;
          newAuthToken = jwt.sign(
            { userId: existingUser.id, role: existingUser.role },
            process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026',
            { expiresIn: '7d' }
          );
          authUserObj = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          };
        } else {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please sign in or enter your account password.',
          });
        }
      } else {
        if (!accountPassword || accountPassword.length < 4) {
          return res.status(400).json({
            success: false,
            message: 'Please set an account password (at least 4 characters) to create your account and track this order.',
          });
        }

        const passwordHash = await bcrypt.hash(accountPassword, 10);
        const newUser = await prisma.user.create({
          data: {
            name: shippingAddress.fullName || 'Retail Customer',
            email,
            passwordHash,
            phone: shippingAddress.phone || '',
            role: 'RETAIL_CUSTOMER',
          },
        });

        userId = newUser.id;
        newAuthToken = jwt.sign(
          { userId: newUser.id, role: newUser.role },
          process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026',
          { expiresIn: '7d' }
        );
        authUserObj = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        };
      }
    }

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
      token: newAuthToken,
      user: authUserObj,
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
    const userEmail = req.user.email;
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { shippingAddressJson: { contains: userEmail } },
        ],
      },
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

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true, companyName: true, gstNumber: true },
        },
        payments: true,
        supportRequests: true,
        policyAcceptances: true,
      },
    });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching all admin orders', error: error.message });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, shippingStatus, trackingNumber } = req.body;

    const dataToUpdate = {};
    if (orderStatus) dataToUpdate.orderStatus = orderStatus;
    if (shippingStatus) dataToUpdate.shippingStatus = shippingStatus;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: dataToUpdate,
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    return res.json({ success: true, message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
  }
};
