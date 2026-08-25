import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  // Modals & Forms
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);

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
      const res = await axios.get('/api/categories');
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error(err);
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
      const res = await axios.get('/api/orders/my-orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
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
                <div key={cat.id} className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'}
                      alt={cat.name}
                      className="w-12 h-12 object-cover rounded bg-beige-50 border border-beige-200"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-onyx-900">{cat.name}</h3>
                      <span className="text-xs font-mono text-gray-400">Slug: /{cat.slug}</span>
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
                            className="bg-beige-50 border border-beige-200 text-onyx-900 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3 text-gold-600" />
                            <span>{sub.name}</span>
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
                    <th className="p-3">Subcategory</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">B2B Price</th>
                    <th className="p-3">MOQ</th>
                    <th className="p-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-beige-50">
                      <td className="p-3 font-semibold text-onyx-900">{p.name}</td>
                      <td className="p-3 font-medium text-gold-600">{p.category?.name}</td>
                      <td className="p-3 text-gray-500">{p.subcategory?.name || '-'}</td>
                      <td className="p-3 font-mono text-gray-400">{p.sku}</td>
                      <td className="p-3 font-semibold">₹{p.retailPrice.toFixed(2)}</td>
                      <td className="p-3 font-semibold text-gold-600">{p.b2bPrice ? `₹${p.b2bPrice.toFixed(2)}` : 'N/A'}</td>
                      <td className="p-3">{p.moq} units</td>
                      <td className="p-3">{p.stock}</td>
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
            <h2 className="text-2xl font-serif font-bold text-onyx-900">Order Management & Tracking</h2>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white border border-beige-200 p-5 rounded-lg shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-serif font-bold text-sm text-onyx-900 font-mono">{ord.orderNumber}</span>
                      <span className="text-gray-400 ml-3">Platform: {ord.platform}</span>
                    </div>
                    <span className="bg-onyx-900 text-gold-500 px-2.5 py-0.5 rounded font-semibold">Status: {ord.orderStatus}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Payable Total: <strong>₹{ord.totalAmount.toFixed(2)}</strong></span>
                    <span>Policy Accepted v{ord.policyVersion} at {new Date(ord.policyAcceptedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
};
