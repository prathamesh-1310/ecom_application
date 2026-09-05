import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  Building2,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Truck,
  ShieldAlert,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Edit,
  Power,
  PowerOff,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, categories, products, b2b_apps, orders, support, banners
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [b2bApplications, setB2bApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [orderFilterPlatform, setOrderFilterPlatform] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & Forms
  const [showCatModal, setShowCatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [showEditSubcatModal, setShowEditSubcatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Category Edit Form State
  const [editCat, setEditCat] = useState({ id: '', name: '', description: '', image: '', status: 'ACTIVE' });
  // Subcategory Edit Form State
  const [editSubcat, setEditSubcat] = useState({ id: '', categoryId: '', name: '', description: '', status: 'ACTIVE' });

  // Delete Confirmation Modal State (for Category & Subcategory)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: 'category', // 'category' or 'subcategory'
    id: '',
    name: '',
  });

  // Status Change Confirmation Modal State
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    product: null,
    nextStatus: 'ACTIVE',
  });

  // Edit Product Form State
  const [editProd, setEditProd] = useState({
    id: '',
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    retailPrice: '',
    salePrice: '',
    b2bPrice: '',
    stock: 50,
    moq: 1,
    visibility: 'BOTH',
    status: 'ACTIVE',
    imageUrl: '',
    careInstructions: '',
    hygieneNotice: '',
  });

  // Category Form State
  const [newCat, setNewCat] = useState({ name: '', description: '', image: '' });
  // Subcategory Form State
  const [newSubcat, setNewSubcat] = useState({ categoryId: '', name: '', description: '' });
  // Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    retailPrice: '',
    salePrice: '',
    b2bPrice: '',
    stock: 50,
    moq: 1,
    visibility: 'BOTH',
    imageUrl: '',
    careInstructions: '',
    hygieneNotice: '',
  });

  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN')) {
      fetchAdminStats();
      loadCategories();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get('/api/categories?includeInactive=true');
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  // Category Edit & Delete Handlers
  const handleOpenEditCatModal = (cat) => {
    setEditCat({
      id: cat.id,
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      status: cat.status || 'ACTIVE',
    });
    setShowEditCatModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/categories/${editCat.id}`, editCat);
      if (res.data.success) {
        showToast(`Category "${editCat.name}" updated successfully!`, 'success');
        setShowEditCatModal(false);
        loadCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating category', 'error');
    }
  };

  // Subcategory Edit & Delete Handlers
  const handleOpenEditSubcatModal = (sub) => {
    setEditSubcat({
      id: sub.id,
      categoryId: sub.categoryId || '',
      name: sub.name || '',
      description: sub.description || '',
      status: sub.status || 'ACTIVE',
    });
    setShowEditSubcatModal(true);
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/subcategories/${editSubcat.id}`, editSubcat);
      if (res.data.success) {
        showToast(`Subcategory "${editSubcat.name}" updated successfully!`, 'success');
        setShowEditSubcatModal(false);
        loadCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating subcategory', 'error');
    }
  };

  // Deletion Confirmation Handlers
  const handleOpenDeleteConfirm = (type, id, name) => {
    setDeleteConfirmModal({
      isOpen: true,
      type,
      id,
      name,
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id, name } = deleteConfirmModal;
    try {
      const endpoint = type === 'category' ? `/api/categories/${id}` : `/api/subcategories/${id}`;
      const res = await axios.delete(endpoint);
      if (res.data.success) {
        showToast(`${type === 'category' ? 'Category' : 'Subcategory'} "${name}" deleted successfully!`, 'success');
        setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' });
        loadCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || `Error deleting ${type}`, 'error');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/products?includeInactive=true');
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error('Error loading admin products:', err);
    }
  };

  const handleOpenStatusConfirm = (product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusConfirmModal({
      isOpen: true,
      product,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal.product) return;
    const { product, nextStatus } = statusConfirmModal;
    try {
      const res = await axios.put(`/api/products/${product.id}`, { status: nextStatus });
      if (res.data.success) {
        showToast(
          `Product "${product.name}" status changed to ${nextStatus}.`,
          'success',
          'Status Updated'
        );
        setStatusConfirmModal({ isOpen: false, product: null, nextStatus: 'ACTIVE' });
        loadProducts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating product status', 'error');
    }
  };

  const handleOpenEditModal = (product) => {
    setEditProd({
      id: product.id,
      name: product.name || '',
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      subcategoryId: product.subcategoryId || '',
      description: product.description || '',
      retailPrice: product.retailPrice || '',
      salePrice: product.salePrice || '',
      b2bPrice: product.b2bPrice || '',
      stock: product.stock ?? 50,
      moq: product.moq ?? 1,
      visibility: product.visibility || 'BOTH',
      status: product.status || 'ACTIVE',
      imageUrl: product.images?.[0]?.imageUrl || '',
      careInstructions: product.careInstructions || '',
      hygieneNotice: product.hygieneNotice || '',
    });
    setShowEditProdModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProd.categoryId) {
      showToast('Please select a Category.', 'warning');
      return;
    }
    try {
      const res = await axios.put(`/api/products/${editProd.id}`, editProd);
      if (res.data.success) {
        showToast(`Product "${editProd.name}" updated successfully!`, 'success', 'Product Updated');
        setShowEditProdModal(false);
        loadProducts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating product', 'error');
    }
  };

  const loadB2BApplications = async () => {
    try {
      const res = await axios.get('/api/b2b/applications');
      if (res.data.success) setB2bApplications(res.data.applications);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error loading admin orders:', err);
      showToast('Failed to fetch admin orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, orderStatus, shippingStatus, trackingNumber) => {
    try {
      const res = await axios.put(`/api/admin/orders/${orderId}/status`, {
        orderStatus,
        shippingStatus,
        trackingNumber,
      });
      if (res.data.success) {
        showToast(`Order status updated to: ${res.data.order.orderStatus}`, 'success');
        loadOrders();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleExportOrdersToExcel = (ordersToExport, title = 'Orders') => {
    if (!ordersToExport || ordersToExport.length === 0) {
      showToast('No orders available to export.', 'warning');
      return;
    }

    try {
      const exportData = ordersToExport.map((ord, idx) => {
        let addressObj = {};
        try {
          addressObj = JSON.parse(ord.shippingAddressJson || '{}');
        } catch (e) {}

        const itemsSummary = (ord.items || [])
          .map((item) => `${item.productName} (Qty: ${item.quantity}, Unit Price: ₹${item.unitPrice})`)
          .join('; ');

        const totalItemCount = (ord.items || []).reduce((acc, i) => acc + (i.quantity || 0), 0);

        return {
          'S.No': idx + 1,
          'Order Number': ord.orderNumber,
          'Platform': ord.platform || 'RETAIL',
          'Date Placed': new Date(ord.createdAt).toLocaleString('en-IN'),
          'Customer Name': ord.user?.name || addressObj.fullName || 'Guest Customer',
          'Customer Email': ord.user?.email || addressObj.email || 'N/A',
          'Customer Phone': ord.user?.phone || addressObj.phone || 'N/A',
          'B2B Company': ord.user?.companyName || 'N/A',
          'GST Number': ord.user?.gstNumber || 'N/A',
          'Order Status': ord.orderStatus || 'Pending',
          'Shipping Status': ord.shippingStatus || 'Unshipped',
          'Payment Status': ord.paymentStatus || 'Pending',
          'Payment Method': ord.paymentMethod || 'Online',
          'Total Amount (₹)': ord.totalAmount,
          'Total Items': totalItemCount,
          'Ordered Products Detail': itemsSummary,
          'Shipping Address': `${addressObj.addressLine1 || ''} ${addressObj.addressLine2 || ''}, ${addressObj.city || ''}, ${addressObj.state || ''} - ${addressObj.postalCode || ''}`.trim(),
          'Tracking Number': ord.trackingNumber || 'N/A',
          'No Return Policy Accepted': ord.policyVersion ? `Accepted (v${ord.policyVersion})` : 'Yes',
          'Policy Accepted IP': ord.policyAcceptedIp || '127.0.0.1',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      worksheet['!cols'] = [
        { wch: 6 },  // S.No
        { wch: 18 }, // Order Number
        { wch: 12 }, // Platform
        { wch: 22 }, // Date Placed
        { wch: 22 }, // Customer Name
        { wch: 26 }, // Customer Email
        { wch: 16 }, // Customer Phone
        { wch: 20 }, // B2B Company
        { wch: 18 }, // GST Number
        { wch: 15 }, // Order Status
        { wch: 16 }, // Shipping Status
        { wch: 16 }, // Payment Status
        { wch: 16 }, // Payment Method
        { wch: 18 }, // Total Amount
        { wch: 12 }, // Total Items
        { wch: 50 }, // Ordered Products Detail
        { wch: 50 }, // Shipping Address
        { wch: 20 }, // Tracking Number
        { wch: 24 }, // No Return Policy Accepted
        { wch: 20 }, // Policy Accepted IP
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders_Report');

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Aurelia_${title}_Report_${dateStr}.xlsx`;

      XLSX.writeFile(workbook, filename);
      showToast(`Successfully exported ${ordersToExport.length} order(s) to ${filename}`, 'success', 'Excel Export');
    } catch (err) {
      console.error('Export Excel Error:', err);
      showToast('Failed to export orders to Excel', 'error');
    }
  };

  const loadSupportRequests = async () => {
    try {
      const res = await axios.get('/api/support/requests');
      if (res.data.success) setSupportRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'categories') loadCategories();
    if (tab === 'products') {
      loadCategories();
      loadProducts();
    }
    if (tab === 'b2b_apps') loadB2BApplications();
    if (tab === 'orders') loadOrders();
    if (tab === 'support') loadSupportRequests();
  };

  const handleAdminQuickLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', {
        email: 'admin@brandname.com',
        password: 'admin123',
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast('Authenticated as Super Admin.', 'success', 'Admin Sign In');
      }
    } catch (err) {
      showToast('Admin login failed.', 'error');
    }
  };

  // Category Creation Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/categories', newCat);
      if (res.data.success) {
        showToast('Category created successfully!', 'success');
        setShowCatModal(false);
        setNewCat({ name: '', description: '', image: '' });
        loadCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating category', 'error');
    }
  };

  // Subcategory Creation Handler
  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/subcategories', newSubcat);
      if (res.data.success) {
        showToast('Subcategory created successfully!', 'success');
        setShowSubcatModal(false);
        setNewSubcat({ categoryId: '', name: '', description: '' });
        loadCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating subcategory', 'error');
    }
  };

  // Product Creation Handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.categoryId) {
      showToast('Please select a Category for this product.', 'warning');
      return;
    }
    try {
      const res = await axios.post('/api/products', {
        ...newProd,
        images: newProd.imageUrl ? [{ imageUrl: newProd.imageUrl }] : [],
      });

      if (res.data.success) {
        showToast('Product created successfully against selected Category!', 'success');
        setShowProdModal(false);
        setNewProd({
          name: '',
          sku: '',
          description: '',
          categoryId: '',
          subcategoryId: '',
          retailPrice: '',
          salePrice: '',
          b2bPrice: '',
          stock: 50,
          moq: 1,
          visibility: 'BOTH',
          imageUrl: '',
          careInstructions: '',
          hygieneNotice: '',
        });
        loadProducts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating product', 'error');
    }
  };

  const handleB2BAppDecision = async (appId, status) => {
    try {
      const res = await axios.put(`/api/b2b/applications/${appId}`, { status });
      if (res.data.success) {
        showToast(`B2B application updated to status: ${status}`, 'success');
        loadB2BApplications();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('Error updating application status', 'error');
    }
  };

  const handleSupportDecision = async (reqId, status, approvedRemedy) => {
    try {
      const res = await axios.put(`/api/support/requests/${reqId}`, { status, approvedRemedy });
      if (res.data.success) {
        showToast(`Support request updated to: ${status}`, 'success');
        loadSupportRequests();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('Error updating support request', 'error');
    }
  };

  // Unauthenticated Admin Sign-In view
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF_ADMIN')) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6 text-center">
        <div className="bg-onyx-900 text-beige-50 p-8 rounded-lg border-2 border-gold-500/50 shadow-xl space-y-4">
          <ShieldAlert className="w-12 h-12 text-gold-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-white">Admin Authentication Required</h2>
          <p className="text-xs text-gray-300">
            Sign in as Super Admin to access platform dashboard, category hierarchy, product creation, B2B approvals, and support requests.
          </p>

          <button
            onClick={handleAdminQuickLogin}
            className="w-full bg-gold-500 text-onyx-950 font-bold uppercase tracking-widest py-3 rounded text-xs hover:bg-gold-400 transition-colors shadow-lg"
          >
            ⚡ 1-Click Login as Super Admin (admin@brandname.com)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-beige-50">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-onyx-950 text-beige-50 border-r border-gold-500/20 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="border-b border-gold-500/20 pb-4">
            <span className="font-serif text-lg font-bold text-gold-500 uppercase tracking-wider block">
              AURELIA ADMIN
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Unified Control Panel</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs">
            <button
              onClick={() => handleTabSwitch('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Metrics Overview</span>
            </button>

            <button
              onClick={() => handleTabSwitch('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories & Subcategories</span>
            </button>

            <button
              onClick={() => handleTabSwitch('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalog</span>
            </button>

            <button
              onClick={() => handleTabSwitch('b2b_apps')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'b2b_apps'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>B2B Wholesale Approvals</span>
            </button>

            <button
              onClick={() => handleTabSwitch('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Management</span>
            </button>

            <button
              onClick={() => handleTabSwitch('support')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-all ${
                activeTab === 'support'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Exceptional Support Cases</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-gold-500/20 pt-4 space-y-2 text-xs">
          <div>
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-[10px] text-gold-500 uppercase tracking-widest">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors pt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-onyx-900">Dashboard Metrics & Statistics</h2>

            {loading ? (
              <div className="text-xs text-gray-500 py-10">Loading platform statistics...</div>
            ) : stats ? (
              <div className="space-y-8">
                {/* Retail Cards */}
                <div>
                  <h3 className="font-serif font-bold text-base text-onyx-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gold-600" />
                    <span>Retail E-Commerce Overview</span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Retail Revenue</span>
                      <span className="text-2xl font-serif font-bold text-onyx-900">₹{stats.retail.revenue.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Total Orders</span>
                      <span className="text-2xl font-serif font-bold text-onyx-900">{stats.retail.ordersCount}</span>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Pending Orders</span>
                      <span className="text-2xl font-serif font-bold text-gold-600">{stats.retail.pendingOrders}</span>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Registered Customers</span>
                      <span className="text-2xl font-serif font-bold text-onyx-900">{stats.retail.customersCount}</span>
                    </div>
                  </div>
                </div>

                {/* B2B Cards */}
                <div>
                  <h3 className="font-serif font-bold text-base text-onyx-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gold-600" />
                    <span>B2B Wholesale Portal Overview</span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">B2B Revenue</span>
                      <span className="text-2xl font-serif font-bold text-onyx-900">₹{stats.b2b.revenue.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Wholesale Orders</span>
                      <span className="text-2xl font-serif font-bold text-onyx-900">{stats.b2b.ordersCount}</span>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-beige-200 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Approved B2B Accounts</span>
                      <span className="text-2xl font-serif font-bold text-green-600">{stats.b2b.approvedCustomers}</span>
                    </div>
                    <div className="bg-gold-500/10 p-5 rounded-lg border border-gold-500/40 shadow-sm space-y-1">
                      <span className="text-[10px] uppercase text-gold-600 font-bold block">Pending B2B Applications</span>
                      <span className="text-2xl font-serif font-bold text-gold-600">{stats.b2b.pendingApplications}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Categories & Subcategories</h2>
                <p className="text-xs text-gray-500">Manage catalog taxonomy and subcategory grouping.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCatModal(true)}
                  className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 font-semibold px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>

                <button
                  onClick={() => {
                    if (categories.length === 0) loadCategories();
                    setShowSubcatModal(true);
                  }}
                  className="bg-gold-500/20 text-gold-700 border border-gold-500/40 hover:bg-gold-500 hover:text-onyx-950 font-semibold px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcategory</span>
                </button>
              </div>
            </div>

            {/* Tree List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className={`bg-white border rounded-lg p-6 shadow-sm space-y-4 ${
                  cat.status === 'INACTIVE' ? 'border-gray-300 bg-gray-50/60 opacity-85' : 'border-beige-200'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'}
                        alt={cat.name}
                        className="w-12 h-12 object-cover rounded bg-beige-50 border border-beige-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-base text-onyx-900">{cat.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cat.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {cat.status}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-gray-400">Slug: /{cat.slug}</span>
                      </div>
                    </div>

                    {/* Category Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditCatModal(cat)}
                        className="p-1.5 bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm('category', cat.id, cat.name)}
                        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">{cat.description || 'No description provided.'}</p>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider block">
                      Subcategories ({cat.subcategories?.length || 0}):
                    </span>
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories.map((sub) => (
                          <span
                            key={sub.id}
                            className={`border text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              sub.status === 'INACTIVE' ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-beige-50 border-beige-200 text-onyx-900'
                            }`}
                          >
                            <ChevronRight className="w-3 h-3 text-gold-600" />
                            <span>{sub.name}</span>
                            {sub.status === 'INACTIVE' && <span className="text-[9px] text-gray-400">(Inactive)</span>}
                            
                            <button
                              onClick={() => handleOpenEditSubcatModal(sub)}
                              className="ml-1 text-gray-400 hover:text-onyx-900 transition-colors"
                              title="Edit Subcategory"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm('subcategory', sub.id, sub.name)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No subcategories created yet.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Product Catalog</h2>
                <p className="text-xs text-gray-500">Add products assigned against specific Categories & Subcategories.</p>
              </div>

              <button
                onClick={() => {
                  loadCategories();
                  setShowProdModal(true);
                }}
                className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 font-semibold px-4 py-2.5 rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product against Category</span>
              </button>
            </div>

            <div className="bg-white border border-beige-200 rounded-lg overflow-hidden shadow-sm text-xs">
              <table className="w-full text-left">
                <thead className="bg-onyx-900 text-gold-500 font-serif uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">B2B Price</th>
                    <th className="p-3">Stock & MOQ</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className={`hover:bg-beige-50 ${p.status === 'INACTIVE' ? 'bg-gray-50/70 opacity-80' : ''}`}>
                      <td className="p-3 font-semibold text-onyx-900 flex items-center gap-2.5">
                        <img
                          src={p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded border border-beige-200 shrink-0"
                        />
                        <div>
                          <span className="block font-serif font-bold text-onyx-900">{p.name}</span>
                          <span className="text-[10px] text-gray-400">Visibility: {p.visibility}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-gold-600 block">{p.category?.name}</span>
                        <span className="text-[10px] text-gray-500 block">{p.subcategory?.name || 'No Subcategory'}</span>
                      </td>
                      <td className="p-3 font-mono text-gray-400">{p.sku}</td>
                      <td className="p-3 font-semibold">₹{p.retailPrice.toFixed(2)}</td>
                      <td className="p-3 font-semibold text-gold-600">{p.b2bPrice ? `₹${p.b2bPrice.toFixed(2)}` : 'N/A'}</td>
                      <td className="p-3">
                        <span>{p.stock} in stock</span>
                        <span className="text-[10px] text-gray-400 block">(MOQ: {p.moq})</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {p.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleOpenStatusConfirm(p)}
                              className="bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 border border-amber-300"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenStatusConfirm(p)}
                              className="bg-green-100 text-green-800 hover:bg-green-600 hover:text-white font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 border border-green-300"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: B2B APPLICATIONS */}
        {activeTab === 'b2b_apps' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-onyx-900">B2B Wholesale Applications</h2>

            <div className="space-y-4">
              {b2bApplications.map((app) => (
                <div key={app.id} className="bg-white border border-beige-200 p-5 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-onyx-900">{app.companyName}</h4>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gold-500/20 text-gold-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Contact: {app.user.name} ({app.user.email}) • Phone: {app.user.phone || 'N/A'}</p>
                    <p className="text-gray-500 font-mono">Business Type: {app.businessType} | GST: {app.gstNumber || 'None'} | Volume: {app.expectedVolume}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleB2BAppDecision(app.id, 'APPROVED')}
                        className="bg-green-600 text-white hover:bg-green-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Wholesale</span>
                      </button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleB2BAppDecision(app.id, 'REJECTED')}
                        className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Application</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Order Management & Tracking</h2>
                <p className="text-xs text-gray-500">Monitor retail & B2B orders, verify policy acceptance, and manage shipment tracking.</p>
              </div>

              {/* Search, Platform Filter & Excel Export Options */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search order #, customer email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs w-64 focus:outline-none focus:border-gold-500"
                />

                <div className="flex bg-beige-200 p-0.5 rounded text-xs">
                  {['ALL', 'RETAIL', 'B2B'].map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setOrderFilterPlatform(plat)}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        orderFilterPlatform === plat ? 'bg-onyx-900 text-gold-500' : 'text-gray-700 hover:text-onyx-900'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shadow"
                  title="Export order data to Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-xs text-gray-500 py-10 text-center">Loading platform orders...</div>
            ) : (() => {
              const filteredOrders = orders.filter((ord) => {
                const matchesPlat = orderFilterPlatform === 'ALL' || ord.platform === orderFilterPlatform;
                const searchLower = orderSearch.toLowerCase();
                const matchesSearch =
                  !orderSearch ||
                  ord.orderNumber.toLowerCase().includes(searchLower) ||
                  (ord.user?.email && ord.user.email.toLowerCase().includes(searchLower)) ||
                  (ord.shippingAddressJson && ord.shippingAddressJson.toLowerCase().includes(searchLower));
                return matchesPlat && matchesSearch;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-lg border border-beige-200 text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold text-gray-700">No Orders Found</p>
                    <p className="text-xs text-gray-400">No orders match your current filter and search criteria.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {filteredOrders.map((ord) => {
                    let addressObj = {};
                    try {
                      addressObj = JSON.parse(ord.shippingAddressJson || '{}');
                    } catch (e) {}

                    return (
                      <div key={ord.id} className="bg-white border border-beige-200 rounded-lg p-6 shadow-sm space-y-4">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-serif font-bold text-base text-onyx-900 font-mono">{ord.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.platform === 'B2B' ? 'bg-gold-500/20 text-gold-700 border border-gold-500/40' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ord.platform}
                            </span>
                            <span className="text-xs text-gray-400">
                              Placed on {new Date(ord.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2.5 py-0.5 rounded font-semibold ${
                              ord.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              Payment: {ord.paymentStatus}
                            </span>
                            <span className="bg-onyx-900 text-gold-500 px-2.5 py-0.5 rounded font-semibold">
                              Status: {ord.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-beige-50/60 p-3.5 rounded border border-beige-200/80">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold-600 block mb-1">Customer Info</span>
                            <p className="font-semibold text-onyx-900">{ord.user?.name || addressObj.fullName || 'Guest Customer'}</p>
                            <p className="text-gray-600">{ord.user?.email || addressObj.email || 'No Email'}</p>
                            <p className="text-gray-600">Phone: {ord.user?.phone || addressObj.phone || 'N/A'}</p>
                            {ord.user?.companyName && (
                              <p className="text-gold-700 font-medium">B2B Company: {ord.user.companyName} (GST: {ord.user.gstNumber || 'N/A'})</p>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold-600 block mb-1">Shipping Destination</span>
                            <p className="text-gray-700">{addressObj.addressLine1} {addressObj.addressLine2 || ''}</p>
                            <p className="text-gray-700">{addressObj.city}, {addressObj.state} - {addressObj.postalCode}</p>
                            <p className="text-gray-500 font-mono text-[11px]">Tracking #: {ord.trackingNumber || 'Not assigned'}</p>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Ordered Products</span>
                          <div className="divide-y divide-gray-100 border border-gray-100 rounded bg-white">
                            {ord.items && ord.items.map((item) => (
                              <div key={item.id} className="p-2.5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {item.product?.images?.[0]?.imageUrl && (
                                    <img
                                      src={item.product.images[0].imageUrl}
                                      alt={item.productName}
                                      className="w-9 h-9 object-cover rounded border border-gray-200"
                                    />
                                  )}
                                  <div>
                                    <p className="font-semibold text-onyx-900">{item.productName}</p>
                                    <p className="text-[11px] font-mono text-gray-400">SKU: {item.sku}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-600">Qty: {item.quantity} x ₹{item.unitPrice.toFixed(2)}</p>
                                  <p className="font-bold text-onyx-900">₹{item.totalPrice.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Audit & Total Summary */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-onyx-900 text-beige-50 p-3.5 rounded border border-gold-500/30">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-gold-500 shrink-0" />
                            <span>No Return Policy Accepted (v{ord.policyVersion}) • Accepted IP: {ord.policyAcceptedIp || '127.0.0.1'}</span>
                          </div>
                          <div className="font-serif font-bold text-sm text-gold-500">
                            Total Payable: ₹{ord.totalAmount.toFixed(2)}
                          </div>
                        </div>

                        {/* Order Management Controls */}
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="font-semibold text-gray-700">Update Order Status:</label>
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value, ord.shippingStatus, ord.trackingNumber)}
                              className="bg-beige-50 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          {/* Tracking Number Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Assign Tracking #"
                              defaultValue={ord.trackingNumber || ''}
                              onBlur={(e) => {
                                if (e.target.value !== (ord.trackingNumber || '')) {
                                  handleUpdateOrderStatus(ord.id, ord.orderStatus, ord.shippingStatus, e.target.value);
                                }
                              }}
                              className="bg-beige-50 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-gold-500 font-mono w-44"
                            />
                            <span className="text-[10px] text-gray-400 italic">(Auto-saves on blur)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: EXCEPTIONAL SUPPORT CASES */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-onyx-900 text-gold-500 p-4 rounded text-xs border border-gold-500/30">
              <ShieldAlert className="w-4 h-4 inline mr-2" />
              <strong>No Return Policy Administration:</strong> Standard returns are disabled. Review submitted photos/videos for material damage before delivery or fulfillment errors. Authorized remedies: Replacement, Store Credit, or Manual Refund Exception.
            </div>

            <div className="space-y-4">
              {supportRequests.map((req) => (
                <div key={req.id} className="bg-white border border-beige-200 p-5 rounded-lg shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-serif font-bold text-sm text-onyx-900">Order: {req.order?.orderNumber}</span>
                    <span className="bg-gold-500/20 text-gold-600 px-2 py-0.5 rounded font-semibold">{req.status}</span>
                  </div>

                  <p className="text-gray-700"><strong>Customer:</strong> {req.user?.name} ({req.user?.email})</p>
                  <p className="text-gray-700"><strong>Reason:</strong> {req.reason}</p>
                  <p className="text-gray-600 italic bg-beige-50 p-3 rounded">"{req.description}"</p>

                  <div className="pt-2 flex flex-wrap gap-2 border-t border-gray-100">
                    <button
                      onClick={() => handleSupportDecision(req.id, 'Replacement Approved', 'Replacement')}
                      className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Approve Replacement
                    </button>
                    <button
                      onClick={() => handleSupportDecision(req.id, 'Store Credit Approved', 'Store Credit')}
                      className="bg-onyx-800 text-white hover:bg-onyx-900 font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Approve Store Credit
                    </button>
                    <button
                      onClick={() => handleSupportDecision(req.id, 'Refund Approved', 'Manual Refund Exception')}
                      className="bg-green-700 text-white hover:bg-green-800 font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Approve Refund Exception
                    </button>
                    <button
                      onClick={() => handleSupportDecision(req.id, 'Rejected Under Policy', 'None')}
                      className="bg-red-600 text-white hover:bg-red-700 font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Reject Under Policy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Belly Rings"
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Description of category..."
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={newCat.image}
                  onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-3 py-1.5 text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 px-4 py-1.5 rounded font-semibold">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SUBCATEGORY MODAL */}
      {showSubcatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2">Add Subcategory</h3>
            <form onSubmit={handleCreateSubcategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Parent Category *</label>
                <select
                  required
                  value={newSubcat.categoryId}
                  onChange={(e) => setNewSubcat({ ...newSubcat, categoryId: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={newSubcat.name}
                  onChange={(e) => setNewSubcat({ ...newSubcat, name: e.target.value })}
                  placeholder="e.g. Septum Clickers"
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubcat.description}
                  onChange={(e) => setNewSubcat({ ...newSubcat, description: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowSubcatModal(false)} className="px-3 py-1.5 text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 px-4 py-1.5 rounded font-semibold">
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PRODUCT AGAINST CATEGORY & SUBCATEGORY MODAL */}
      {showProdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2">
              Add Product Against Category
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Select Category *</label>
                  <select
                    required
                    value={newProd.categoryId}
                    onChange={(e) => setNewProd({ ...newProd, categoryId: e.target.value, subcategoryId: '' })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Select Subcategory</label>
                  <select
                    value={newProd.subcategoryId}
                    onChange={(e) => setNewProd({ ...newProd, subcategoryId: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- None / Select Subcategory --</option>
                    {categories
                      .find((c) => c.id === newProd.categoryId)
                      ?.subcategories?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Aurelia 14K Gold Opal Stud"
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="JW-STD-009"
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.retailPrice}
                    onChange={(e) => setNewProd({ ...newProd, retailPrice: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">B2B Price (₹)</label>
                  <input
                    type="number"
                    value={newProd.b2bPrice}
                    onChange={(e) => setNewProd({ ...newProd, b2bPrice: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Wholesale MOQ</label>
                  <input
                    type="number"
                    value={newProd.moq}
                    onChange={(e) => setNewProd({ ...newProd, moq: parseInt(e.target.value) || 1 })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Visibility</label>
                <select
                  value={newProd.visibility}
                  onChange={(e) => setNewProd({ ...newProd, visibility: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                >
                  <option value="BOTH">Show in BOTH Retail & B2B</option>
                  <option value="RETAIL">Show in RETAIL Only</option>
                  <option value="B2B">Show in B2B Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowProdModal(false)} className="px-3 py-2 text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 px-5 py-2 rounded font-semibold shadow">
                  Save Product Against Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: STATUS CHANGE CONFIRMATION MODAL */}
      {statusConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl relative border-2 border-gold-500/40">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <AlertTriangle className={`w-7 h-7 ${statusConfirmModal.nextStatus === 'INACTIVE' ? 'text-amber-500' : 'text-green-600'}`} />
              <div>
                <h3 className="text-lg font-serif font-bold text-onyx-900">Confirm Status Change</h3>
                <p className="text-xs text-gray-500">Product visibility management</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-700">
                Are you sure you want to change the status of product{' '}
                <strong className="text-onyx-900 font-serif text-sm block my-1">
                  "{statusConfirmModal.product?.name}"
                </strong>{' '}
                to <span className={`font-bold px-2 py-0.5 rounded ${
                  statusConfirmModal.nextStatus === 'INACTIVE' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>{statusConfirmModal.nextStatus}</span>?
              </p>

              {statusConfirmModal.nextStatus === 'INACTIVE' ? (
                <div className="bg-amber-50 text-amber-900 p-3 rounded text-[11px] border border-amber-200">
                  ⚠️ <strong>Notice:</strong> Inactive products will be hidden from customer shopping catalogs, category pages, and search results immediately.
                </div>
              ) : (
                <div className="bg-green-50 text-green-900 p-3 rounded text-[11px] border border-green-200">
                  ✅ <strong>Notice:</strong> Active products will be visible to retail and B2B shoppers immediately according to their assigned visibility rules.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusConfirmModal({ isOpen: false, product: null, nextStatus: 'ACTIVE' })}
                className="px-4 py-2 text-gray-600 hover:text-onyx-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`px-5 py-2 rounded text-white shadow transition-colors flex items-center gap-1.5 ${
                  statusConfirmModal.nextStatus === 'INACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm {statusConfirmModal.nextStatus === 'INACTIVE' ? 'Deactivation' : 'Activation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT PRODUCT MODAL */}
      {showEditProdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gold-600" />
              <span>Edit Product details</span>
            </h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Select Category *</label>
                  <select
                    required
                    value={editProd.categoryId}
                    onChange={(e) => setEditProd({ ...editProd, categoryId: e.target.value, subcategoryId: '' })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Select Subcategory</label>
                  <select
                    value={editProd.subcategoryId}
                    onChange={(e) => setEditProd({ ...editProd, subcategoryId: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- None / Select Subcategory --</option>
                    {categories
                      .find((c) => c.id === editProd.categoryId)
                      ?.subcategories?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editProd.name}
                  onChange={(e) => setEditProd({ ...editProd, name: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold text-onyx-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={editProd.sku}
                    onChange={(e) => setEditProd({ ...editProd, sku: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editProd.stock}
                    onChange={(e) => setEditProd({ ...editProd, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editProd.retailPrice}
                    onChange={(e) => setEditProd({ ...editProd, retailPrice: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold text-onyx-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">B2B Price (₹)</label>
                  <input
                    type="number"
                    value={editProd.b2bPrice}
                    onChange={(e) => setEditProd({ ...editProd, b2bPrice: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 text-gold-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Wholesale MOQ</label>
                  <input
                    type="number"
                    value={editProd.moq}
                    onChange={(e) => setEditProd({ ...editProd, moq: parseInt(e.target.value) || 1 })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Visibility</label>
                  <select
                    value={editProd.visibility}
                    onChange={(e) => setEditProd({ ...editProd, visibility: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                  >
                    <option value="BOTH">Show in BOTH Retail & B2B</option>
                    <option value="RETAIL">Show in RETAIL Only</option>
                    <option value="B2B">Show in B2B Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={editProd.status}
                    onChange={(e) => setEditProd({ ...editProd, status: e.target.value })}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                    <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={editProd.imageUrl}
                  onChange={(e) => setEditProd({ ...editProd, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editProd.description}
                  onChange={(e) => setEditProd({ ...editProd, description: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditProdModal(false)} className="px-3 py-2 text-gray-500 hover:text-onyx-900">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 px-5 py-2 rounded font-semibold shadow transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 6: DELETE CONFIRMATION MODAL (CATEGORY / SUBCATEGORY) */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl relative border-2 border-red-500/40">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              <div>
                <h3 className="text-lg font-serif font-bold text-onyx-900">Confirm Permanent Deletion</h3>
                <p className="text-xs text-gray-500">Destructive catalog management action</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-700">
                Are you sure you want to permanently delete {deleteConfirmModal.type}{' '}
                <strong className="text-onyx-900 font-serif text-sm block my-1">
                  "{deleteConfirmModal.name}"
                </strong>?
              </p>

              <div className="bg-red-50 text-red-900 p-3 rounded text-[11px] border border-red-200">
                ⚠️ <strong>Warning:</strong> Deleting a {deleteConfirmModal.type} is permanent and cannot be undone. Associated products or subcategories may lose their grouping.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' })}
                className="px-4 py-2 text-gray-600 hover:text-onyx-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded shadow transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT CATEGORY MODAL */}
      {showEditCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gold-600" />
              <span>Edit Category</span>
            </h3>

            <form onSubmit={handleUpdateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold text-onyx-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={editCat.status}
                  onChange={(e) => setEditCat({ ...editCat, status: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editCat.description}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={editCat.image}
                  onChange={(e) => setEditCat({ ...editCat, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditCatModal(false)} className="px-3 py-1.5 text-gray-500 hover:text-onyx-900">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 px-4 py-1.5 rounded font-semibold shadow transition-colors">
                  Save Category Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: EDIT SUBCATEGORY MODAL */}
      {showEditSubcatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gold-600" />
              <span>Edit Subcategory</span>
            </h3>

            <form onSubmit={handleUpdateSubcategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Parent Category *</label>
                <select
                  required
                  value={editSubcat.categoryId}
                  onChange={(e) => setEditSubcat({ ...editSubcat, categoryId: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={editSubcat.name}
                  onChange={(e) => setEditSubcat({ ...editSubcat, name: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold text-onyx-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={editSubcat.status}
                  onChange={(e) => setEditSubcat({ ...editSubcat, status: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editSubcat.description}
                  onChange={(e) => setEditSubcat({ ...editSubcat, description: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditSubcatModal(false)} className="px-3 py-1.5 text-gray-500 hover:text-onyx-900">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 px-4 py-1.5 rounded font-semibold shadow transition-colors">
                  Save Subcategory Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT SELECTION MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-5 shadow-2xl border border-gold-500/30">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-serif font-bold text-onyx-900">Export Orders to Excel</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Select which dataset of orders you want to export as a Microsoft Excel spreadsheet (<code className="bg-beige-100 px-1 py-0.5 rounded text-[11px]">.xlsx</code>):
            </p>

            <div className="space-y-3">
              {/* Option 1: Export Filtered Orders */}
              {(() => {
                const filtered = orders.filter((ord) => {
                  const matchesPlat = orderFilterPlatform === 'ALL' || ord.platform === orderFilterPlatform;
                  const searchLower = orderSearch.toLowerCase();
                  return (
                    matchesPlat &&
                    (!orderSearch ||
                      ord.orderNumber.toLowerCase().includes(searchLower) ||
                      (ord.user?.email && ord.user.email.toLowerCase().includes(searchLower)) ||
                      (ord.shippingAddressJson && ord.shippingAddressJson.toLowerCase().includes(searchLower)))
                  );
                });

                return (
                  <button
                    onClick={() => {
                      handleExportOrdersToExcel(
                        filtered,
                        orderFilterPlatform === 'ALL' ? 'Filtered_Orders' : `${orderFilterPlatform}_Orders`
                      );
                      setShowExportModal(false);
                    }}
                    className="w-full bg-beige-50 hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-600 p-4 rounded-lg text-left transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-onyx-900 group-hover:text-emerald-800 text-xs flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export Filtered Orders ({filtered.length})</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Active Filter: <span className="font-semibold text-onyx-900">{orderFilterPlatform}</span>
                        {orderSearch ? ` • Search: "${orderSearch}"` : ''}
                      </p>
                    </div>
                    <span className="bg-emerald-700 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded shadow">
                      {filtered.length} Orders
                    </span>
                  </button>
                );
              })()}

              {/* Option 2: Export All Orders */}
              <button
                onClick={() => {
                  handleExportOrdersToExcel(orders, 'All_Platform_Orders');
                  setShowExportModal(false);
                }}
                className="w-full bg-beige-50 hover:bg-gold-50 border border-gold-300 hover:border-gold-600 p-4 rounded-lg text-left transition-all group flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="font-bold text-onyx-900 group-hover:text-gold-700 text-xs flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-gold-600" />
                    <span>Export All System Orders ({orders.length})</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Complete order ledger across both Retail & B2B platforms.
                  </p>
                </div>
                <span className="bg-onyx-900 text-gold-500 font-bold text-[10px] uppercase px-2.5 py-1 rounded shadow">
                  {orders.length} Orders
                </span>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 text-xs text-gray-600 hover:text-onyx-900 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
