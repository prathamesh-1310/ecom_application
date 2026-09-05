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
} from '../controllers/order.controller.js';
import { getB2BApplications, updateB2BStatus } from '../controllers/b2b.controller.js';
import {
  createSupportRequest,
  getSupportRequests,
  updateSupportRequestStatus,
} from '../controllers/support.controller.js';
import { getActivePolicy } from '../controllers/policy.controller.js';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { authenticateToken, requireRole, requireApprovedB2B } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Auth Routes
router.post('/auth/register', registerRetail);
router.post('/auth/register-b2b', registerB2B);
router.post('/auth/login', login);
router.get('/auth/profile', authenticateToken, getProfile);

// Address Routes
router.get('/addresses', authenticateToken, getAddresses);
router.post('/addresses', authenticateToken, addAddress);
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

// Order & Checkout Routes
router.post('/orders/checkout', createOrder);
router.post('/orders/verify-payment', verifyPayment);
router.get('/orders/my-orders', authenticateToken, getMyOrders);
router.get('/orders/:orderId', getOrderById);
router.post('/orders/:orderId/cancel', authenticateToken, cancelOrder);

// Admin Order Management Routes
router.get('/admin/orders', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getAllOrdersAdmin);
router.put('/admin/orders/:orderId/status', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateOrderStatusAdmin);

// B2B Wholesale Management Routes
router.get('/b2b/applications', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getB2BApplications);
router.put('/b2b/applications/:applicationId', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateB2BStatus);

// Exceptional Support Request Routes
router.post('/support/requests', authenticateToken, createSupportRequest);
router.get('/support/requests', authenticateToken, getSupportRequests);
router.put('/support/requests/:requestId', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), updateSupportRequestStatus);

// Policy Routes
router.get('/policy/active', getActivePolicy);

// Admin Dashboard Route
router.get('/admin/stats', authenticateToken, requireRole(['SUPER_ADMIN', 'STAFF_ADMIN']), getDashboardStats);

// File Upload Route
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.json({ success: true, url: fileUrl });
});

export default router;
