import express from 'express';
import {
  registerRetail,
  registerB2B,
  login,
  getProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/auth.controller.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/category.controller.js';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cart.controller.js';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  downloadOrderPdf,
} from '../controllers/order.controller.js';
import { getB2BApplications, updateB2BStatus } from '../controllers/b2b.controller.js';
import {
  createSupportRequest,
  getSupportRequests,
  updateSupportRequestStatus,
} from '../controllers/support.controller.js';
import { getActivePolicy } from '../controllers/policy.controller.js';
import { getDashboardStats } from '../controllers/admin.controller.js';
import {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js';
import {
  listBackups,
  createBackup,
  downloadBackup,
  uploadBackup,
  restoreBackup,
  deleteBackup,
} from '../controllers/backup.controller.js';
import { authenticateToken, requireRole, requireApprovedB2B } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

import {
  validate,
  registerSchema,
  registerB2BSchema,
  loginSchema,
  addressSchema,
  createOrderSchema,
  supportRequestSchema,
} from '../middlewares/validate.middleware.js';

import {
  authLimiter,
  otpLimiter,
  paidApiLimiter,
} from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Auth Routes (Strict Rate Limiting: 5 attempts / 15 min)
router.post('/auth/register', authLimiter, validate(registerSchema), registerRetail);
router.post('/auth/register-b2b', authLimiter, validate(registerB2BSchema), registerB2B);
router.post('/auth/login', authLimiter, validate(loginSchema), login);
router.get('/auth/profile', authenticateToken, getProfile);

// Address Routes
router.get('/addresses', authenticateToken, getAddresses);
router.post('/addresses', authenticateToken, validate(addressSchema), addAddress);
router.delete('/addresses/:addressId', authenticateToken, deleteAddress);

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), createCategory);
router.put('/categories/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateCategory);
router.delete('/categories/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), deleteCategory);

router.post('/subcategories', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), createSubcategory);
router.put('/subcategories/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateSubcategory);
router.delete('/subcategories/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), deleteSubcategory);

// Product Routes
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/products', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), createProduct);
router.put('/products/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateProduct);
router.delete('/products/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), deleteProduct);

// Cart Routes
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/items/:itemId', updateCartItem);
router.delete('/cart/items/:itemId', removeCartItem);

// Order & Checkout Routes (Paid API / Gateway Protection: 10 attempts / 15 min)
router.post('/orders/checkout', paidApiLimiter, validate(createOrderSchema), createOrder);
router.post('/orders/verify-payment', paidApiLimiter, verifyPayment);
router.get('/orders/my-orders', authenticateToken, getMyOrders);
router.get('/orders/:id/pdf', paidApiLimiter, authenticateToken, downloadOrderPdf);
router.get('/orders/:orderId', authenticateToken, getOrderById);
router.post('/orders/:orderId/cancel', authenticateToken, cancelOrder);

// Admin Order Management Routes
router.get('/admin/orders', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getAllOrdersAdmin);
router.put('/admin/orders/:orderId/status', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateOrderStatusAdmin);

// B2B Wholesale Management Routes
router.get('/b2b/applications', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getB2BApplications);
router.put('/b2b/applications/:applicationId', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateB2BStatus);

// Exceptional Support Request Routes (Protected by OTP / Verification Limiter)
router.post('/support/requests', otpLimiter, authenticateToken, validate(supportRequestSchema), createSupportRequest);
router.get('/support/requests', authenticateToken, getSupportRequests);
router.put('/support/requests/:requestId', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateSupportRequestStatus);

// Policy Routes
router.get('/policy/active', getActivePolicy);

// Banner Routes (Public & Admin)
router.get('/banners', getPublicBanners);
router.get('/admin/banners', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getAdminBanners);
router.post('/admin/banners', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), createBanner);
router.put('/admin/banners/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateBanner);
router.delete('/admin/banners/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), deleteBanner);

// Admin Dashboard Route
router.get('/admin/stats', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getDashboardStats);

// Database Backup & Restore Routes (Admin Only)
router.get('/admin/backups', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), listBackups);
router.post('/admin/backups/create', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), createBackup);
router.get('/admin/backups/download/:filename', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), downloadBackup);
router.post('/admin/backups/upload', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), upload.single('file'), uploadBackup);
router.post('/admin/backups/restore/:filename', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), restoreBackup);
router.delete('/admin/backups/:filename', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), deleteBackup);

// File Upload Routes (Protected by Paid / Storage Limiter)
router.post('/upload', paidApiLimiter, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.json({ success: true, url: fileUrl });
});

router.post('/upload/multiple', paidApiLimiter, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const fileUrls = req.files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
  return res.json({ success: true, urls: fileUrls });
});

export default router;
