import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 24 Hours in milliseconds
const SCHEDULE_INTERVAL_MS = 24 * 60 * 60 * 1000;
// Keep automated backups for 30 days
const RETENTION_DAYS = 30;

let schedulerTimer = null;
let lastScheduledRun = null;

/**
 * Perform automated backup generation
 */
export const runAutomatedBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `aurelia_auto_backup_${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    console.log(`[Auto-Backup] Starting automated database backup: ${filename}...`);

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
      createdBy: 'Automated System Scheduler (24h Routine)',
      isAutomated: true,
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

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    backupPayload.checksum = crypto.createHash('sha256').update(jsonStr).digest('hex');

    fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2), 'utf8');
    lastScheduledRun = new Date();

    console.log(`[Auto-Backup] ✅ Automated backup created: ${filename} (${totalRecords} records).`);

    // Clean up backups older than RETENTION_DAYS
    cleanOldBackups();
  } catch (error) {
    console.error('[Auto-Backup Error] Failed to generate automated backup:', error);
  }
};

/**
 * Remove auto-backup files older than 30 days
 */
const cleanOldBackups = () => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      if (file.startsWith('aurelia_auto_backup_') && file.endsWith('.json')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > retentionMs) {
          fs.unlinkSync(filePath);
          console.log(`[Auto-Backup Cleanup] Deleted old backup file: ${file}`);
        }
      }
    });
  } catch (err) {
    console.error('[Auto-Backup Cleanup Error]:', err);
  }
};

/**
 * Initialize background automated backup scheduler
 */
export const initBackupScheduler = () => {
  console.log('[Auto-Backup] Initializing Automated Backup Scheduler (Runs every 24 hours)...');

  // Trigger initial automated check/backup if no backups exist or last backup was > 24h ago
  runAutomatedBackup();

  // Schedule recurring 24h timer
  schedulerTimer = setInterval(() => {
    runAutomatedBackup();
  }, SCHEDULE_INTERVAL_MS);
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = () => {
  return {
    enabled: true,
    intervalHours: 24,
    retentionDays: RETENTION_DAYS,
    lastScheduledRun,
    nextScheduledRun: lastScheduledRun
      ? new Date(lastScheduledRun.getTime() + SCHEDULE_INTERVAL_MS)
      : new Date(Date.now() + SCHEDULE_INTERVAL_MS),
  };
};
