import prisma from '../config/prisma.js';

export const getCart = async (req, res) => {
  try {
    const { sessionId, platform = 'RETAIL' } = req.query;
    const userId = req.user ? req.user.id : null;

    let cart = null;
    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId, platform },
        include: {
          items: {
            include: {
              product: {
                include: { images: true, pricingRules: true },
              },
              variant: true,
            },
          },
        },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({
        where: { sessionId, platform },
        include: {
          items: {
            include: {
              product: {
                include: { images: true, pricingRules: true },
              },
              variant: true,
            },
          },
        },
      });
    }

    if (!cart) {
      return res.json({ success: true, cart: { items: [], subtotal: 0 } });
    }

    // Calculate item prices and subtotal dynamically
    let subtotal = 0;
    const items = cart.items.map((item) => {
      let unitPrice = item.product.salePrice || item.product.retailPrice;

      // Handle B2B pricing and tier bulk rules
      if (platform === 'B2B' && item.product.b2bPrice) {
        unitPrice = item.product.b2bPrice;
        if (item.product.pricingRules && item.product.pricingRules.length > 0) {
          const matchingRule = item.product.pricingRules
            .filter((rule) => item.quantity >= rule.minimumQuantity)
            .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0];

          if (matchingRule) {
            unitPrice = matchingRule.price;
          }
        }
      }

      if (item.variant && item.variant.priceAdjustment) {
        unitPrice += item.variant.priceAdjustment;
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productSku: item.product.sku,
        image: item.product.images[0]?.imageUrl || '',
        variantId: item.variantId,
        variantName: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
        quantity: item.quantity,
        moq: item.product.moq,
        unitPrice,
        totalPrice: itemTotal,
      };
    });

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        platform: cart.platform,
        items,
        subtotal,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1, sessionId, platform = 'RETAIL' } = req.body;
    const userId = req.user ? req.user.id : null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricingRules: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate MOQ for B2B portal
    if (platform === 'B2B' && quantity < product.moq) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity (MOQ) for ${product.name} is ${product.moq} units.`,
      });
    }

    let cart = null;
    if (userId) {
      cart = await prisma.cart.findFirst({ where: { userId, platform } });
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({ where: { sessionId, platform } });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          sessionId: userId ? null : sessionId,
          platform,
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    let unitPrice = product.salePrice || product.retailPrice;
    if (platform === 'B2B' && product.b2bPrice) {
      unitPrice = product.b2bPrice;
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + Number(quantity);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: Number(quantity),
          unitPrice,
        },
      });
    }

    return res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Number(quantity) },
    });

    return res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating cart item', error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error removing cart item', error: error.message });
  }
};
