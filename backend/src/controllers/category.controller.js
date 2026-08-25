import prisma from '../config/prisma.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      include: {
        subcategories: {
          where: { status: 'ACTIVE' },
        },
      },
    });
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        image,
      },
    });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    const { categoryId, name, slug, description } = req.body;
    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
      },
    });
    return res.status(201).json({ success: true, subcategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating subcategory', error: error.message });
  }
};
