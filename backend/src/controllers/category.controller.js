import prisma from '../config/prisma.js';

export const getCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = {};
    if (includeInactive !== 'true') {
      where.status = 'ACTIVE';
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: includeInactive === 'true' ? true : { where: { status: 'ACTIVE' } },
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
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        image,
        status: 'ACTIVE',
      },
    });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, status } = req.body;

    const data = {};
    if (name) {
      data.name = name;
      data.slug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (status) data.status = status;

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return res.json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    const { categoryId, name, slug, description } = req.body;
    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        status: 'ACTIVE',
      },
    });
    return res.status(201).json({ success: true, subcategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating subcategory', error: error.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, description, status } = req.body;

    const data = {};
    if (categoryId) data.categoryId = categoryId;
    if (name) {
      data.name = name;
      data.slug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) data.description = description;
    if (status) data.status = status;

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data,
    });
    return res.json({ success: true, subcategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating subcategory', error: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subcategory.delete({ where: { id } });
    return res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting subcategory', error: error.message });
  }
};
