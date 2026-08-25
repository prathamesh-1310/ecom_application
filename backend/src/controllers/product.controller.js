import prisma from '../config/prisma.js';

export const getProducts = async (req, res) => {
  try {
    const { platform = 'RETAIL', categorySlug, subcategorySlug, search, minPrice, maxPrice, sort } = req.query;

    const where = {
      status: 'ACTIVE',
    };

    if (platform === 'RETAIL') {
      where.visibility = { in: ['RETAIL', 'BOTH'] };
    } else if (platform === 'B2B') {
      where.visibility = { in: ['B2B', 'BOTH'] };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_low_high') {
      orderBy = { retailPrice: 'asc' };
    } else if (sort === 'price_high_low') {
      orderBy = { retailPrice: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        pricingRules: true,
      },
    });

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        pricingRules: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching product detail', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      name,
      slug,
      sku,
      description,
      retailPrice,
      salePrice,
      b2bPrice,
      stock,
      moq,
      visibility,
      careInstructions,
      hygieneNotice,
      images,
      variants,
      pricingRules,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        categoryId,
        subcategoryId: subcategoryId || null,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku,
        description,
        retailPrice: Number(retailPrice),
        salePrice: salePrice ? Number(salePrice) : null,
        b2bPrice: b2bPrice ? Number(b2bPrice) : null,
        stock: Number(stock || 0),
        moq: Number(moq || 1),
        visibility: visibility || 'BOTH',
        returnable: false,
        refundable: false,
        careInstructions,
        hygieneNotice,
        images: images && images.length > 0 ? {
          create: images.map((img, idx) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            displayOrder: idx,
          })),
        } : undefined,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            name: v.name,
            value: v.value,
            priceAdjustment: Number(v.priceAdjustment || 0),
            stock: Number(v.stock || 0),
            sku: v.sku || `${sku}-${v.value}`,
            returnable: false,
            refundable: false,
          })),
        } : undefined,
        pricingRules: pricingRules && pricingRules.length > 0 ? {
          create: pricingRules.map((rule) => ({
            customerType: rule.customerType || 'B2B',
            minimumQuantity: Number(rule.minimumQuantity),
            price: Number(rule.price),
            discountPercentage: rule.discountPercentage ? Number(rule.discountPercentage) : null,
          })),
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
        pricingRules: true,
      },
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.images;
    delete updateData.variants;
    delete updateData.pricingRules;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
};
