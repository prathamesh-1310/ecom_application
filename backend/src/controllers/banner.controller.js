import prisma from '../config/prisma.js';

// Public endpoint to fetch active banners for storefronts (Retail / B2B)
export const getPublicBanners = async (req, res) => {
  try {
    const { platform = 'RETAIL' } = req.query;

    const banners = await prisma.banner.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { visibility: { in: [platform, 'BOTH'] } },
          { platform: { in: [platform, 'BOTH'] } },
        ],
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return res.json({ success: true, banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching banners', error: error.message });
  }
};

// Admin endpoint to fetch all banners
export const getAdminBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return res.json({ success: true, banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching admin banners', error: error.message });
  }
};

// Admin endpoint to create a new banner
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, visibility = 'BOTH', displayOrder = 0, status = 'ACTIVE' } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Banner title and image URL are required.' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        visibility: visibility || 'BOTH',
        platform: visibility || 'BOTH',
        displayOrder: Number(displayOrder || 0),
        status: status || 'ACTIVE',
      },
    });

    return res.status(201).json({ success: true, banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating banner', error: error.message });
  }
};

// Admin endpoint to update an existing banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, link, visibility, displayOrder, status } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (subtitle !== undefined) dataToUpdate.subtitle = subtitle || null;
    if (image !== undefined) dataToUpdate.image = image;
    if (link !== undefined) dataToUpdate.link = link || null;
    if (visibility !== undefined) {
      dataToUpdate.visibility = visibility;
      dataToUpdate.platform = visibility;
    }
    if (displayOrder !== undefined) dataToUpdate.displayOrder = Number(displayOrder);
    if (status !== undefined) dataToUpdate.status = status;

    const banner = await prisma.banner.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({ success: true, banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating banner', error: error.message });
  }
};

// Admin endpoint to delete a banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    return res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting banner', error: error.message });
  }
};
