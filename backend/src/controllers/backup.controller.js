import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { getSchedulerStatus } from '../services/backupScheduler.js';

// Absolute directory path for storing backup files
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Format bytes into human readable string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * GET /api/admin/backups
 * List all backup files with metadata and record summaries
 */
export const listBackups = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ success: true, backups: [] });
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter((file) => file.endsWith('.json'));

    const backupsList = backupFiles.map((filename) => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stat = fs.statSync(filePath);

      let meta = {
        version: '1.0',
        createdAt: stat.birthtime,
        createdBy: 'System',
        totalRecords: 0,
        counts: {},
      };

      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawContent);

        if (parsed && parsed.counts) {
          meta.version = parsed.version || '1.0';
          meta.createdAt = parsed.createdAt || stat.birthtime;
          meta.createdBy = parsed.createdBy || 'System';
          meta.counts = parsed.counts;
          meta.totalRecords = Object.values(parsed.counts).reduce((a, b) => a + b, 0);
        }
      } catch (err) {
        console.error(`Error reading backup metadata for ${filename}:`, err);
      }

      return {
        filename,
        sizeBytes: stat.size,
        formattedSize: formatBytes(stat.size),
        createdAt: meta.createdAt,
        createdBy: meta.createdBy,
        totalRecords: meta.totalRecords,
        counts: meta.counts,
      };
    });

    // Sort descending by creation time (newest first)
    backupsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      backups: backupsList,
      backupDir: BACKUP_DIR,
      schedulerStatus: getSchedulerStatus(),
    });
  } catch (error) {
    console.error('List backups error:', error);
    return res.status(500).json({ success: false, message: 'Error listing backups', error: error.message });
  }
};

/**
 * POST /api/admin/backups/create
 * Export full system snapshot into a versioned JSON backup file
 */
export const createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `aurelia_backup_${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    // Fetch all database tables
    const [
      users,
      addresses,
      categories,
      subcategories,
      products,
      productVariants,
      productImages,
      productPricingRules,
      carts,
      cartItems,
      wishlists,
      wishlistItems,
      orders,
      orderItems,
      payments,
      coupons,
      reviews,
      supportRequests,
      policyVersions,
      policyAcceptances,
      banners,
      b2bApplications,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.address.findMany(),
      prisma.category.findMany(),
      prisma.subcategory.findMany(),
      prisma.product.findMany(),
      prisma.productVariant.findMany(),
      prisma.productImage.findMany(),
      prisma.productPricingRule.findMany(),
      prisma.cart.findMany(),
      prisma.cartItem.findMany(),
      prisma.wishlist.findMany(),
      prisma.wishlistItem.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.payment.findMany(),
      prisma.coupon.findMany(),
      prisma.review.findMany(),
      prisma.supportRequest.findMany(),
      prisma.policyVersion.findMany(),
      prisma.policyAcceptance.findMany(),
      prisma.banner.findMany(),
      prisma.b2BApplication.findMany(),
    ]);

    const counts = {
      users: users.length,
      addresses: addresses.length,
      categories: categories.length,
      subcategories: subcategories.length,
      products: products.length,
      productVariants: productVariants.length,
      productImages: productImages.length,
      productPricingRules: productPricingRules.length,
      carts: carts.length,
      cartItems: cartItems.length,
      wishlists: wishlists.length,
      wishlistItems: wishlistItems.length,
      orders: orders.length,
      orderItems: orderItems.length,
      payments: payments.length,
      coupons: coupons.length,
      reviews: reviews.length,
      supportRequests: supportRequests.length,
      policyVersions: policyVersions.length,
      policyAcceptances: policyAcceptances.length,
      banners: banners.length,
      b2bApplications: b2bApplications.length,
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    const backupPayload = {
      version: '1.0',
      appName: 'AURELIA_FINE_PIERCING_JEWELRY',
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'Super Admin',
      counts,
      totalRecords,
      data: {
        users,
        addresses,
        categories,
        subcategories,
        products,
        productVariants,
        productImages,
        productPricingRules,
        carts,
        cartItems,
        wishlists,
        wishlistItems,
        orders,
        orderItems,
        payments,
        coupons,
        reviews,
        supportRequests,
        policyVersions,
        policyAcceptances,
        banners,
        b2bApplications,
      },
    };

    // Calculate checksum
    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const checksum = crypto.createHash('sha256').update(jsonStr).digest('hex');
    backupPayload.checksum = checksum;

    fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2), 'utf8');
    const stat = fs.statSync(filePath);

    return res.status(201).json({
      success: true,
      message: 'System backup created successfully!',
      backup: {
        filename,
        sizeBytes: stat.size,
        formattedSize: formatBytes(stat.size),
        createdAt: backupPayload.createdAt,
        createdBy: backupPayload.createdBy,
        totalRecords,
        counts,
        checksum,
      },
    });
  } catch (error) {
    console.error('Create backup error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create backup', error: error.message });
  }
};

/**
 * GET /api/admin/backups/download/:filename
 * Download a backup file
 */
export const downloadBackup = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    return res.download(filePath, filename);
  } catch (error) {
    console.error('Download backup error:', error);
    return res.status(500).json({ success: false, message: 'Error downloading backup file', error: error.message });
  }
};

/**
 * POST /api/admin/backups/upload
 * Upload an external JSON backup file into the server backups directory
 */
export const uploadBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No backup file uploaded' });
    }

    const tempPath = req.file.path;
    const originalName = req.file.originalname;
    const safeFilename = path.basename(originalName).endsWith('.json')
      ? path.basename(originalName)
      : `${path.basename(originalName, path.extname(originalName))}.json`;

    const targetPath = path.join(BACKUP_DIR, safeFilename);

    // Read and validate JSON format
    const rawContent = fs.readFileSync(tempPath, 'utf8');
    const parsed = JSON.parse(rawContent);

    if (!parsed || !parsed.data) {
      fs.unlinkSync(tempPath);
      return res.status(400).json({ success: false, message: 'Invalid Aurelia backup file structure' });
    }

    // Move file to backups folder
    fs.renameSync(tempPath, targetPath);
    const stat = fs.statSync(targetPath);

    return res.json({
      success: true,
      message: 'Backup file uploaded successfully!',
      backup: {
        filename: safeFilename,
        sizeBytes: stat.size,
        formattedSize: formatBytes(stat.size),
        createdAt: parsed.createdAt || stat.birthtime,
        createdBy: parsed.createdBy || 'Uploaded',
        totalRecords: parsed.totalRecords || 0,
        counts: parsed.counts || {},
      },
    });
  } catch (error) {
    console.error('Upload backup error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Error uploading backup file', error: error.message });
  }
};

/**
 * POST /api/admin/backups/restore/:filename
 * Safely restore database from a target backup file
 */
export const restoreBackup = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Selected backup file does not exist' });
    }

    const rawContent = fs.readFileSync(filePath, 'utf8');
    const backupData = JSON.parse(rawContent);

    if (!backupData || !backupData.data) {
      return res.status(400).json({ success: false, message: 'Backup file format is invalid or corrupted' });
    }

    const { data } = backupData;

    // Helper to format Date ISO strings into JS Date objects
    const mapDates = (arr, dateKeys = ['createdAt', 'updatedAt', 'effectiveDate', 'reviewedAt', 'startDate', 'endDate', 'policyAcceptedAt', 'acceptedAt']) => {
      if (!Array.isArray(arr)) return [];
      return arr.map((item) => {
        const newItem = { ...item };
        dateKeys.forEach((key) => {
          if (newItem[key]) {
            newItem[key] = new Date(newItem[key]);
          }
        });
        return newItem;
      });
    };

    // Execute Restoration inside a single database transaction or sequential safe block
    await prisma.$transaction(async (tx) => {
      // 1. CLEAR EXISTING DATA IN REVERSE DEPENDENCY ORDER
      await tx.policyAcceptance.deleteMany();
      await tx.payment.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.supportRequest.deleteMany();
      await tx.order.deleteMany();
      await tx.wishlistItem.deleteMany();
      await tx.wishlist.deleteMany();
      await tx.cartItem.deleteMany();
      await tx.cart.deleteMany();
      await tx.review.deleteMany();
      await tx.productPricingRule.deleteMany();
      await tx.productImage.deleteMany();
      await tx.productVariant.deleteMany();
      await tx.product.deleteMany();
      await tx.subcategory.deleteMany();
      await tx.category.deleteMany();
      await tx.address.deleteMany();
      await tx.b2BApplication.deleteMany();
      await tx.banner.deleteMany();
      await tx.coupon.deleteMany();
      await tx.policyVersion.deleteMany();
      await tx.user.deleteMany();

      // 2. RE-INSERT DATA IN FORWARD DEPENDENCY ORDER
      if (data.users?.length) {
        for (const u of mapDates(data.users)) {
          await tx.user.create({ data: u });
        }
      }

      if (data.policyVersions?.length) {
        for (const pv of mapDates(data.policyVersions)) {
          await tx.policyVersion.create({ data: pv });
        }
      }

      if (data.categories?.length) {
        for (const cat of mapDates(data.categories)) {
          await tx.category.create({ data: cat });
        }
      }

      if (data.subcategories?.length) {
        for (const sub of mapDates(data.subcategories)) {
          await tx.subcategory.create({ data: sub });
        }
      }

      if (data.coupons?.length) {
        for (const c of mapDates(data.coupons)) {
          await tx.coupon.create({ data: c });
        }
      }

      if (data.banners?.length) {
        for (const b of mapDates(data.banners)) {
          await tx.banner.create({ data: b });
        }
      }

      if (data.addresses?.length) {
        for (const addr of mapDates(data.addresses)) {
          await tx.address.create({ data: addr });
        }
      }

      if (data.b2bApplications?.length) {
        for (const b2b of mapDates(data.b2bApplications)) {
          await tx.b2BApplication.create({ data: b2b });
        }
      }

      if (data.products?.length) {
        for (const prod of mapDates(data.products)) {
          await tx.product.create({ data: prod });
        }
      }

      if (data.productVariants?.length) {
        for (const pv of mapDates(data.productVariants)) {
          await tx.productVariant.create({ data: pv });
        }
      }

      if (data.productImages?.length) {
        for (const img of mapDates(data.productImages)) {
          await tx.productImage.create({ data: img });
        }
      }

      if (data.productPricingRules?.length) {
        for (const pr of mapDates(data.productPricingRules)) {
          await tx.productPricingRule.create({ data: pr });
        }
      }

      if (data.carts?.length) {
        for (const cart of mapDates(data.carts)) {
          await tx.cart.create({ data: cart });
        }
      }

      if (data.cartItems?.length) {
        for (const ci of mapDates(data.cartItems)) {
          await tx.cartItem.create({ data: ci });
        }
      }

      if (data.wishlists?.length) {
        for (const w of mapDates(data.wishlists)) {
          await tx.wishlist.create({ data: w });
        }
      }

      if (data.wishlistItems?.length) {
        for (const wi of mapDates(data.wishlistItems)) {
          await tx.wishlistItem.create({ data: wi });
        }
      }

      if (data.orders?.length) {
        for (const ord of mapDates(data.orders)) {
          await tx.order.create({ data: ord });
        }
      }

      if (data.orderItems?.length) {
        for (const oi of mapDates(data.orderItems)) {
          await tx.orderItem.create({ data: oi });
        }
      }

      if (data.payments?.length) {
        for (const p of mapDates(data.payments)) {
          await tx.payment.create({ data: p });
        }
      }

      if (data.supportRequests?.length) {
        for (const sr of mapDates(data.supportRequests)) {
          await tx.supportRequest.create({ data: sr });
        }
      }

      if (data.reviews?.length) {
        for (const rev of mapDates(data.reviews)) {
          await tx.review.create({ data: rev });
        }
      }

      if (data.policyAcceptances?.length) {
        for (const pa of mapDates(data.policyAcceptances)) {
          await tx.policyAcceptance.create({ data: pa });
        }
      }
    });

    return res.json({
      success: true,
      message: `Database successfully restored from backup snapshot "${filename}"!`,
      restoredFrom: filename,
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore database from backup. Changes rolled back.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/backups/:filename
 * Delete a backup file
 */
export const deleteBackup = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      message: `Backup file "${filename}" deleted successfully!`,
      filename,
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting backup file', error: error.message });
  }
};
