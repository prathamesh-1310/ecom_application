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
  FileText,
  User,
  ChevronDown,
  ExternalLink,
  X,
  Calendar,
  Database,
  HardDrive,
  RotateCcw,
  Upload,
  RefreshCw,
  FileJson,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, categories, products, b2b_apps, orders, support, banners
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Top Header User Profile Dropdown & Modal States
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [b2bApplications, setB2bApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [orderFilterPlatform, setOrderFilterPlatform] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  // Banner Management States
  const [banners, setBanners] = useState([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    visibility: 'BOTH',
    displayOrder: 0,
    status: 'ACTIVE',
  });

  const [editBanner, setEditBanner] = useState({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    link: '',
    visibility: 'BOTH',
    displayOrder: 0,
    status: 'ACTIVE',
  });

  // Database Backup & Restore Management States
  const [backups, setBackups] = useState([]);
  const [backupDir, setBackupDir] = useState('');
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [uploadingBackup, setUploadingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [confirmRestoreText, setConfirmRestoreText] = useState('');

  // Date Range Filter States
  const [datePreset, setDatePreset] = useState('ALL'); // 'ALL', 'TODAY', '7DAYS', '30DAYS', 'THIS_MONTH', 'CUSTOM'
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const handleApplyDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'ALL') {
      setFilterStartDate('');
      setFilterEndDate('');
    } else if (preset === 'TODAY') {
      const todayStr = formatDate(today);
      setFilterStartDate(todayStr);
      setFilterEndDate(todayStr);
    } else if (preset === '7DAYS') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      setFilterStartDate(formatDate(past));
      setFilterEndDate(formatDate(today));
    } else if (preset === '30DAYS') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setFilterStartDate(formatDate(past));
      setFilterEndDate(formatDate(today));
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilterStartDate(formatDate(firstDay));
      setFilterEndDate(formatDate(today));
    }
  };

  // Modals & Forms
  const [showCatModal, setShowCatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [showEditSubcatModal, setShowEditSubcatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Category Edit Form State
  const [editCat, setEditCat] = useState({ id: '', name: '', description: '', image: '', visibility: 'BOTH', status: 'ACTIVE' });
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

  // Multi-Image & Upload State for Product Forms
  const [newProdInputUrl, setNewProdInputUrl] = useState('');
  const [editProdInputUrl, setEditProdInputUrl] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleLocalFilesUpload = async (e, targetForm) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingFiles(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await axios.post('/api/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.urls) {
        if (targetForm === 'new') {
          setNewProd((prev) => ({ ...prev, images: [...(prev.images || []), ...res.data.urls] }));
        } else if (targetForm === 'edit') {
          setEditProd((prev) => ({ ...prev, images: [...(prev.images || []), ...res.data.urls] }));
        }
        showToast(`Uploaded ${res.data.urls.length} image(s) successfully!`, 'success');
      }
    } catch (err) {
      console.error('File Upload Error:', err);
      showToast(err.response?.data?.message || 'Error uploading file(s)', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = (targetForm) => {
    if (targetForm === 'new') {
      if (!newProdInputUrl.trim()) return;
      setNewProd((prev) => ({ ...prev, images: [...(prev.images || []), newProdInputUrl.trim()] }));
      setNewProdInputUrl('');
    } else if (targetForm === 'edit') {
      if (!editProdInputUrl.trim()) return;
      setEditProd((prev) => ({ ...prev, images: [...(prev.images || []), editProdInputUrl.trim()] }));
      setEditProdInputUrl('');
    }
  };

  const handleRemoveProductImage = (indexToRemove, targetForm) => {
    if (targetForm === 'new') {
      setNewProd((prev) => ({
        ...prev,
        images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
      }));
    } else if (targetForm === 'edit') {
      setEditProd((prev) => ({
        ...prev,
        images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
      }));
    }
  };

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
    visibility: 'BOTH',
    status: 'ACTIVE',
    images: [],
    careInstructions: '',
    hygieneNotice: '',
  });

  // Category Form State
  const [newCat, setNewCat] = useState({ name: '', description: '', image: '', visibility: 'BOTH' });
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
    visibility: 'BOTH',
    images: [],
    careInstructions: '',
    hygieneNotice: '',
  });

  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN')) {
      if (activeTab === 'overview') fetchAdminStats(filterStartDate, filterEndDate);
      if (activeTab === 'orders') loadOrders(filterStartDate, filterEndDate);
      loadCategories();
    }
  }, [user, filterStartDate, filterEndDate, activeTab]);

  const fetchAdminStats = async (start = filterStartDate, end = filterEndDate) => {
    try {
      setLoading(true);
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      const res = await axios.get('/api/admin/stats', { params });
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
      visibility: cat.visibility || 'BOTH',
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
      visibility: product.visibility || 'BOTH',
      status: product.status || 'ACTIVE',
      images: product.images ? product.images.map((img) => img.imageUrl) : [],
      careInstructions: product.careInstructions || '',
      hygieneNotice: product.hygieneNotice || '',
    });
    setEditProdInputUrl('');
    setShowEditProdModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProd.categoryId) {
      showToast('Please select a Category.', 'warning');
      return;
    }
    try {
      const res = await axios.put(`/api/products/${editProd.id}`, {
        ...editProd,
        images: (editProd.images || []).map((url, idx) => ({ imageUrl: url, displayOrder: idx })),
      });
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

  const loadOrders = async (start = filterStartDate, end = filterEndDate) => {
    try {
      setLoading(true);
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      const res = await axios.get('/api/admin/orders', { params });
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

  // Database Backup & Restore Handlers
  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const res = await axios.get('/api/admin/backups');
      if (res.data.success) {
        setBackups(res.data.backups || []);
        if (res.data.backupDir) setBackupDir(res.data.backupDir);
        if (res.data.schedulerStatus) setSchedulerStatus(res.data.schedulerStatus);
      }
    } catch (err) {
      console.error('Error loading backups:', err);
      showToast('Failed to fetch database backups', 'error');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const res = await axios.post('/api/admin/backups/create');
      if (res.data.success) {
        showToast(
          `System backup snapshot generated successfully! (${res.data.backup.formattedSize}, ${res.data.backup.totalRecords} total records)`,
          'success',
          'Backup Completed'
        );
        loadBackups();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create database backup', 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleUploadBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showToast('Please upload a valid .json backup file', 'warning');
      return;
    }

    try {
      setUploadingBackup(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('/api/admin/backups/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast(`Backup file "${res.data.backup.filename}" uploaded successfully!`, 'success');
        loadBackups();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error uploading backup file', 'error');
    } finally {
      setUploadingBackup(false);
      e.target.value = '';
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const res = await axios.get(`/api/admin/backups/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`Downloaded backup file: ${filename}`, 'success');
    } catch (err) {
      showToast('Failed to download backup file', 'error');
    }
  };

  const handleOpenRestoreModal = (backup) => {
    setSelectedBackupForRestore(backup);
    setConfirmRestoreText('');
    setShowRestoreModal(true);
  };

  const handleExecuteRestore = async () => {
    if (confirmRestoreText !== 'RESTORE') {
      showToast('Please type RESTORE in capital letters to confirm restoration', 'warning');
      return;
    }

    if (!selectedBackupForRestore) return;

    try {
      setRestoringBackup(true);
      const res = await axios.post(`/api/admin/backups/restore/${selectedBackupForRestore.filename}`);
      if (res.data.success) {
        showToast(res.data.message, 'success', 'Database Restored');
        setShowRestoreModal(false);
        setSelectedBackupForRestore(null);
        setConfirmRestoreText('');
        loadBackups();
        fetchAdminStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error restoring database snapshot', 'error', 'Restore Failed');
    } finally {
      setRestoringBackup(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    try {
      const res = await axios.delete(`/api/admin/backups/${filename}`);
      if (res.data.success) {
        showToast(`Deleted backup file: ${filename}`, 'success');
        loadBackups();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting backup file', 'error');
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
    if (tab === 'banners') loadBanners();
    if (tab === 'backups') loadBackups();
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
        setNewCat({ name: '', description: '', image: '', visibility: 'BOTH' });
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
        images: (newProd.images || []).map((url, idx) => ({ imageUrl: url, displayOrder: idx })),
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
          visibility: 'BOTH',
          images: [],
          careInstructions: '',
          hygieneNotice: '',
        });
        setNewProdInputUrl('');
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

  // Banner Management Handlers
  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/banners');
      if (res.data.success) setBanners(res.data.banners);
    } catch (err) {
      console.error('Error loading banners:', err);
      showToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) {
      showToast('Banner title and image are required.', 'warning');
      return;
    }
    try {
      const res = await axios.post('/api/admin/banners', newBanner);
      if (res.data.success) {
        showToast('Banner created successfully!', 'success');
        setShowBannerModal(false);
        setNewBanner({
          title: '',
          subtitle: '',
          image: '',
          link: '',
          visibility: 'BOTH',
          displayOrder: 0,
          status: 'ACTIVE',
        });
        loadBanners();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating banner', 'error');
    }
  };

  const handleOpenEditBannerModal = (banner) => {
    setEditBanner({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      visibility: banner.visibility || 'BOTH',
      displayOrder: banner.displayOrder ?? 0,
      status: banner.status || 'ACTIVE',
    });
    setShowEditBannerModal(true);
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/admin/banners/${editBanner.id}`, editBanner);
      if (res.data.success) {
        showToast(`Banner "${editBanner.title}" updated successfully!`, 'success');
        setShowEditBannerModal(false);
        loadBanners();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating banner', 'error');
    }
  };

  const handleDeleteBanner = async (id, title) => {
    try {
      const res = await axios.delete(`/api/admin/banners/${id}`);
      if (res.data.success) {
        showToast(`Banner "${title}" deleted successfully!`, 'success');
        loadBanners();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting banner', 'error');
    }
  };

  const handleToggleBannerStatus = async (banner) => {
    const nextStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await axios.put(`/api/admin/banners/${banner.id}`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Banner status changed to ${nextStatus}`, 'success');
        loadBanners();
      }
    } catch (err) {
      showToast('Error updating banner status', 'error');
    }
  };

  const handleBannerFileUpload = async (e, targetForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBannerImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.url) {
        if (targetForm === 'new') {
          setNewBanner((prev) => ({ ...prev, image: res.data.url }));
        } else if (targetForm === 'edit') {
          setEditBanner((prev) => ({ ...prev, image: res.data.url }));
        }
        showToast('Banner image uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      showToast('Failed to upload banner image', 'error');
    } finally {
      setUploadingBannerImage(false);
      e.target.value = '';
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
    <div className="flex min-h-screen bg-beige-50 text-onyx-900">
      {/* CONSTANT FIXED SIDEBAR */}
      <aside className="w-64 h-screen sticky top-0 bg-onyx-950 text-beige-50 border-r border-gold-500/20 p-4 flex flex-col justify-between shrink-0 z-40 overflow-y-auto">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="border-b border-gold-500/20 pb-4">
            <span className="font-serif text-xl font-bold text-gold-500 uppercase tracking-wider block">
              AURELIA ADMIN
            </span>
            <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-mono">
              UNIFIED CONTROL PANEL
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs">
            <button
              onClick={() => handleTabSwitch('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Metrics Overview</span>
            </button>

            <button
              onClick={() => handleTabSwitch('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories & Subcategories</span>
            </button>

            <button
              onClick={() => handleTabSwitch('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalog</span>
            </button>

            <button
              onClick={() => handleTabSwitch('b2b_apps')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'b2b_apps'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>B2B Wholesale Approvals</span>
            </button>

            <button
              onClick={() => handleTabSwitch('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Management</span>
            </button>

            <button
              onClick={() => handleTabSwitch('support')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'support'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Exceptional Support Cases</span>
            </button>

            <button
              onClick={() => handleTabSwitch('banners')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'banners'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Banner Management</span>
            </button>

            <button
              onClick={() => handleTabSwitch('backups')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'backups'
                  ? 'bg-gold-500 text-onyx-950 font-bold shadow-md'
                  : 'text-gray-300 hover:bg-onyx-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Backup & Restore</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="border-t border-gold-500/20 pt-4 space-y-2 text-xs">
          <div className="bg-onyx-900 border border-gold-500/20 rounded-lg p-3 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-gray-400 font-mono text-[10px]">
              <span>SYSTEM STATUS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="font-semibold text-white">Aurelia Core v1.0</p>
            <p className="text-[10px] text-gold-500/80">SQLite / Prisma DB Active</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-beige-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left: Active Tab Title / Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold uppercase tracking-wider">Control Panel</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-onyx-900 font-bold uppercase tracking-wider">
              {activeTab === 'overview' && 'Metrics Overview'}
              {activeTab === 'categories' && 'Categories & Subcategories'}
              {activeTab === 'products' && 'Product Catalog'}
              {activeTab === 'b2b_apps' && 'B2B Wholesale Approvals'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'support' && 'Exceptional Support Cases'}
              {activeTab === 'banners' && 'Banner Management'}
              {activeTab === 'backups' && 'Database Backup & Restore'}
            </span>
          </div>

          {/* Right: User Profile Dropdown & Quick Actions */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gold-600 font-medium bg-beige-100 hover:bg-beige-200 px-3 py-1.5 rounded transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </a>

            {/* USER PROFILE DROPDOWN MENU */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-beige-100 transition-colors border border-transparent hover:border-beige-300"
              >
                <div className="w-9 h-9 rounded-full bg-onyx-950 text-gold-500 border border-gold-500/40 flex items-center justify-center font-bold text-sm shadow">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-onyx-900 leading-tight">{user?.name || 'Super Admin'}</p>
                  <p className="text-[10px] text-gold-600 font-semibold uppercase tracking-wider">
                    {user?.role || 'SUPER_ADMIN'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {/* DROPDOWN CONTAINER */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-onyx-950 text-white rounded-xl shadow-2xl border border-gold-500/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-gray-800 space-y-1">
                      <p className="font-serif font-bold text-sm text-gold-500">{user?.name}</p>
                      <p className="text-xs text-gray-300 font-mono truncate">{user?.email || 'admin@brandname.com'}</p>
                      <div className="inline-block bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                        Role: {user?.role || 'SUPER_ADMIN'}
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowProfileModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-onyx-800 text-gray-200 hover:text-gold-500 transition-colors"
                      >
                        <User className="w-4 h-4 text-gold-500" />
                        <span>View Administrator Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleTabSwitch('overview');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-onyx-800 text-gray-200 hover:text-gold-500 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gold-500" />
                        <span>System Metrics & Overview</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors font-medium text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Command Center</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Dashboard Metrics & Statistics</h2>
                <p className="text-xs text-gray-500">Real-time performance analytics across retail and B2B wholesale portals.</p>
              </div>

              {/* DATE RANGE FILTER TOOLBAR */}
              <div className="bg-white p-3 rounded-xl border border-beige-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-onyx-900 font-bold uppercase tracking-wider text-[11px]">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>Date Scope:</span>
                </div>

                <div className="flex bg-beige-100 p-0.5 rounded-lg gap-0.5 flex-wrap">
                  {[
                    { id: 'ALL', label: 'All Time' },
                    { id: 'TODAY', label: 'Today' },
                    { id: '7DAYS', label: 'Last 7 Days' },
                    { id: '30DAYS', label: 'Last 30 Days' },
                    { id: 'THIS_MONTH', label: 'This Month' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyDatePreset(preset.id)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        datePreset === preset.id
                          ? 'bg-onyx-950 text-gold-500 shadow-sm'
                          : 'text-gray-600 hover:text-onyx-900 hover:bg-beige-200/60'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-beige-50 border border-beige-300 rounded px-2 py-1">
                    <span className="text-[10px] font-bold text-gray-400">FROM:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => {
                        setDatePreset('CUSTOM');
                        setFilterStartDate(e.target.value);
                      }}
                      className="bg-transparent text-onyx-900 font-semibold text-xs focus:outline-none"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">-</span>
                  <div className="flex items-center gap-1 bg-beige-50 border border-beige-300 rounded px-2 py-1">
                    <span className="text-[10px] font-bold text-gray-400">TO:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => {
                        setDatePreset('CUSTOM');
                        setFilterEndDate(e.target.value);
                      }}
                      className="bg-transparent text-onyx-900 font-semibold text-xs focus:outline-none"
                    />
                  </div>

                  {(filterStartDate || filterEndDate || datePreset !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => handleApplyDatePreset('ALL')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            cat.visibility === 'RETAIL'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : cat.visibility === 'B2B'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-gold-100 text-onyx-950 border border-gold-300'
                          }`}>
                            Visibility: {cat.visibility || 'BOTH'}
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
                  className="bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-1.5 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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

            {/* DATE RANGE FILTER TOOLBAR IN ORDER MANAGEMENT */}
            <div className="bg-white p-3.5 rounded-xl border border-beige-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-onyx-900 flex items-center gap-1 uppercase tracking-wider text-[11px]">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>Order Date Range Filter:</span>
                </span>

                <div className="flex bg-beige-100 p-0.5 rounded-lg gap-0.5 flex-wrap">
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'TODAY', label: 'Today' },
                    { id: '7DAYS', label: 'Last 7 Days' },
                    { id: '30DAYS', label: 'Last 30 Days' },
                    { id: 'THIS_MONTH', label: 'This Month' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyDatePreset(preset.id)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        datePreset === preset.id
                          ? 'bg-onyx-950 text-gold-500 shadow-sm'
                          : 'text-gray-600 hover:text-onyx-900 hover:bg-beige-200/60'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-beige-50 border border-beige-300 rounded px-2.5 py-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">From Date:</span>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => {
                      setDatePreset('CUSTOM');
                      setFilterStartDate(e.target.value);
                    }}
                    className="bg-transparent text-onyx-900 font-semibold text-xs focus:outline-none"
                  />
                </div>

                <span className="text-gray-400 font-bold">-</span>

                <div className="flex items-center gap-1 bg-beige-50 border border-beige-300 rounded px-2.5 py-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">To Date:</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => {
                      setDatePreset('CUSTOM');
                      setFilterEndDate(e.target.value);
                    }}
                    className="bg-transparent text-onyx-900 font-semibold text-xs focus:outline-none"
                  />
                </div>

                {(filterStartDate || filterEndDate || datePreset !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => handleApplyDatePreset('ALL')}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                  >
                    Reset Dates
                  </button>
                )}
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

                let matchesDate = true;
                if (filterStartDate) {
                  const orderDate = new Date(ord.createdAt);
                  const startDateObj = new Date(filterStartDate);
                  startDateObj.setHours(0, 0, 0, 0);
                  matchesDate = matchesDate && orderDate >= startDateObj;
                }
                if (filterEndDate) {
                  const orderDate = new Date(ord.createdAt);
                  const endDateObj = new Date(filterEndDate);
                  endDateObj.setHours(23, 59, 59, 999);
                  matchesDate = matchesDate && orderDate <= endDateObj;
                }

                return matchesPlat && matchesSearch && matchesDate;
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
                              className="bg-white text-onyx-900 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
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
                              className="bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/50 font-mono w-44"
                            />
                            <span className="text-[10px] text-gray-400 italic">(Auto-saves on blur)</span>
                          </div>

                          {/* PDF Invoice Button */}
                          <a
                            href={`/api/orders/${ord.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gold-500 text-onyx-950 hover:bg-gold-400 font-bold px-3 py-1.5 rounded transition-all shadow flex items-center gap-1.5 text-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download PDF Invoice</span>
                          </a>
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

        {/* TAB 7: BANNER MANAGEMENT */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Banner & Promotion Management</h2>
                <p className="text-xs text-gray-500">Configure promotional banners for Retail storefront, B2B wholesale portal, or Both.</p>
              </div>

              <button
                onClick={() => setShowBannerModal(true)}
                className="bg-gold-500 hover:bg-gold-400 text-onyx-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* REQUIRED DIMENSION SPECIFICATIONS NOTICE BOX */}
            <div className="bg-onyx-950 text-beige-50 border border-gold-500/40 p-4 rounded-xl shadow-sm text-xs space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-gold-500 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Recommended Banner Dimensions & Upload Specifications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-300">
                <div className="bg-onyx-900/80 p-2.5 rounded border border-gold-500/20">
                  <span className="font-bold text-white block mb-0.5">🖥️ Desktop Hero Banner</span>
                  <span>Recommended Size: <strong>1920 × 600 px</strong> (Aspect ratio 16:5). Min width: 1400 px.</span>
                </div>
                <div className="bg-onyx-900/80 p-2.5 rounded border border-gold-500/20">
                  <span className="font-bold text-white block mb-0.5">📱 Mobile Responsive Banner</span>
                  <span>Recommended Size: <strong>1080 × 600 px</strong> (Aspect ratio 9:5 or 16:9).</span>
                </div>
                <div className="bg-onyx-900/80 p-2.5 rounded border border-gold-500/20">
                  <span className="font-bold text-white block mb-0.5">🖼️ File Guidelines</span>
                  <span>Formats: <strong>JPG, PNG, WebP</strong>. Max File Size: <strong>5 MB</strong>. Crisp 72-150 DPI.</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-xs text-gray-500 py-10 text-center">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border border-beige-200 text-center space-y-3">
                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No Banners Found</p>
                <p className="text-xs text-gray-400">Click "Add New Banner" above to publish hero promotions for Retail and B2B portals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white border border-beige-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative aspect-[16/6] bg-gray-900 overflow-hidden group">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest font-bold">
                          Display Order: #{b.displayOrder}
                        </span>
                        <h4 className="font-serif font-bold text-lg text-white leading-tight">{b.title}</h4>
                        {b.subtitle && <p className="text-xs text-gray-200 line-clamp-1">{b.subtitle}</p>}
                      </div>

                      {/* Visibility & Status Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider shadow ${
                          b.visibility === 'RETAIL'
                            ? 'bg-blue-600 text-white'
                            : b.visibility === 'B2B'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gold-500 text-onyx-950'
                        }`}>
                          Visibility: {b.visibility}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow ${
                          b.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-beige-50/50 flex items-center justify-between gap-3 text-xs border-t border-beige-200">
                      <div className="text-gray-600 truncate font-mono text-[11px]">
                        Target Link: {b.link || 'None (Header Banner)'}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleBannerStatus(b)}
                          className={`p-1.5 rounded transition-colors ${
                            b.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title={`Click to set status to ${b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`}
                        >
                          {b.status === 'ACTIVE' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditBannerModal(b)}
                          className="p-1.5 bg-beige-200 text-onyx-900 hover:bg-gold-500 hover:text-onyx-950 rounded transition-colors font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBanner(b.id, b.title)}
                          className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: DATABASE BACKUP & RESTORE */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-onyx-900">Database Backup & Disaster Recovery</h2>
                <p className="text-xs text-gray-500">Generate full database snapshots, upload external JSON backups, and safely restore live server data.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Upload Offline Backup Button */}
                <label className="cursor-pointer bg-white hover:bg-beige-100 border border-gold-500/60 text-onyx-900 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                  <Upload className="w-4 h-4 text-gold-600" />
                  <span>{uploadingBackup ? 'Uploading File...' : 'Upload Backup File'}</span>
                  <input
                    type="file"
                    accept=".json"
                    disabled={uploadingBackup}
                    onChange={handleUploadBackup}
                    className="hidden"
                  />
                </label>

                {/* Create Instant Backup Button */}
                <button
                  type="button"
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="bg-gold-500 hover:bg-gold-400 text-onyx-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Database className="w-4 h-4" />
                  <span>{creatingBackup ? 'Generating Snapshot...' : 'Create Instant Backup'}</span>
                </button>
              </div>
            </div>

            {/* HOW IT WORKS: AUTOMATED VS MANUAL BACKUP MODES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-beige-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-gold-600 font-bold font-serif text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>⏰ 1. Automated Scheduled Backups (Hands-Free)</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  The system automatically runs a background cron task every <strong>24 hours</strong> on the backend server. It exports full snapshots with timestamped filenames (`aurelia_auto_backup_...json`) and automatically purges backups older than <strong>30 days</strong>.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated 24h Scheduler: Active</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-beige-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-onyx-900 font-bold font-serif text-sm">
                  <Database className="w-4 h-4 text-gold-600" />
                  <span>⚡ 2. Manual On-Demand Backups (Instant)</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Administrators can generate instant snapshots anytime before major catalog updates or live deployments by clicking <strong>"Create Instant Backup"</strong> above. You can also upload external `.json` backup files for offline server migration.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[10px] bg-gold-50 text-onyx-950 border border-gold-300 px-2.5 py-1 rounded font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>On-Demand Creation: Enabled</span>
                </div>
              </div>
            </div>

            {/* SYSTEM SAFETY SUMMARY BANNER */}
            <div className="bg-onyx-950 text-beige-50 border border-gold-500/30 p-5 rounded-xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-gold-500 font-serif font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  <span>Standard Live Server Backup & Recovery Practices</span>
                </div>
                <span className="text-[10px] font-mono bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2.5 py-1 rounded">
                  STORAGE DIRECTORY: {backupDir || 'backend/backups'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-onyx-900 p-3.5 rounded-lg border border-gold-500/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Backups</span>
                  <p className="text-xl font-bold text-white font-mono">{backups.length}</p>
                  <span className="text-[10px] text-emerald-400">Available Snapshots</span>
                </div>

                <div className="bg-onyx-900 p-3.5 rounded-lg border border-gold-500/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Latest Backup</span>
                  <p className="text-sm font-bold text-gold-400 truncate">
                    {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleString('en-IN') : 'No Backups Yet'}
                  </p>
                  <span className="text-[10px] text-gray-400">Creation Timestamp</span>
                </div>

                <div className="bg-onyx-900 p-3.5 rounded-lg border border-gold-500/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Latest Snapshot Size</span>
                  <p className="text-xl font-bold text-white font-mono">
                    {backups.length > 0 ? backups[0].formattedSize : '0 Bytes'}
                  </p>
                  <span className="text-[10px] text-gray-400">Compressed Payload</span>
                </div>

                <div className="bg-onyx-900 p-3.5 rounded-lg border border-gold-500/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Restoration Safety</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Transaction Protected</span>
                  </p>
                  <span className="text-[10px] text-gray-400">Foreign Key Validated</span>
                </div>
              </div>
            </div>

            {/* BACKUPS DATA TABLE */}
            {loadingBackups ? (
              <div className="text-xs text-gray-500 py-12 text-center flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-gold-600" />
                <span>Loading backup snapshot catalog...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-beige-200 text-center space-y-3">
                <FileJson className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No Backup Snapshots Available</p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Click "Create Instant Backup" above to generate a full JSON export of all platform tables (Users, Products, Orders, Categories, B2B Apps).
                </p>
              </div>
            ) : (
              <div className="bg-white border border-beige-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-beige-50 border-b border-beige-200 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-onyx-900 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gold-600" />
                    <span>Available Database Backup Snapshots ({backups.length})</span>
                  </h3>
                  <button
                    onClick={loadBackups}
                    className="text-xs text-gray-600 hover:text-onyx-900 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-onyx-950 text-gold-500 uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Backup Filename</th>
                        <th className="py-3 px-4">Date Created</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Total Records</th>
                        <th className="py-3 px-4">Entity Snapshot Breakdown</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {backups.map((b) => (
                        <tr key={b.filename} className="hover:bg-beige-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-onyx-900 flex items-center gap-2">
                            <FileJson className="w-4 h-4 text-gold-600 shrink-0" />
                            <span>{b.filename}</span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-700 whitespace-nowrap">
                            {b.formattedSize}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-onyx-900 whitespace-nowrap">
                            <span className="bg-beige-100 px-2 py-0.5 rounded border border-beige-300">
                              {b.totalRecords} records
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              {b.counts && (
                                <>
                                  <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                                    Users: {b.counts.users || 0}
                                  </span>
                                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                                    Products: {b.counts.products || 0}
                                  </span>
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    Orders: {b.counts.orders || 0}
                                  </span>
                                  <span className="bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">
                                    B2B: {b.counts.b2bApplications || 0}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadBackup(b.filename)}
                                className="bg-beige-100 hover:bg-beige-200 text-onyx-900 px-2.5 py-1.5 rounded font-semibold flex items-center gap-1 border border-beige-300 transition-colors"
                                title="Download JSON Backup"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-700" />
                                <span>Download</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRestoreModal(b)}
                                className="bg-onyx-900 hover:bg-gold-500 text-gold-500 hover:text-onyx-950 px-3 py-1.5 rounded font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="Restore Database from Snapshot"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteBackup(b.filename)}
                                className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white p-1.5 rounded border border-rose-200 transition-colors"
                                title="Delete Backup"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Belly Rings"
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Description of category..."
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newCat.image}
                  onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Visibility Scope *</label>
                <select
                  value={newCat.visibility}
                  onChange={(e) => setNewCat({ ...newCat, visibility: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="BOTH">Show on BOTH (Retail & B2B Wholesale)</option>
                  <option value="RETAIL">Show on RETAIL Storefront Only</option>
                  <option value="B2B">Show on B2B Wholesale Portal Only</option>
                </select>
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
                <label className="block font-semibold text-gray-700 mb-1">Select Parent Category *</label>
                <select
                  required
                  value={newSubcat.categoryId}
                  onChange={(e) => setNewSubcat({ ...newSubcat, categoryId: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={newSubcat.name}
                  onChange={(e) => setNewSubcat({ ...newSubcat, name: e.target.value })}
                  placeholder="e.g. Septum Clickers"
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubcat.description}
                  onChange={(e) => setNewSubcat({ ...newSubcat, description: e.target.value })}
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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
                  <label className="block font-semibold text-gray-700 mb-1">Select Category *</label>
                  <select
                    required
                    value={newProd.categoryId}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const selCat = categories.find((c) => c.id === catId);
                      const catVis = selCat?.visibility || 'BOTH';
                      setNewProd({
                        ...newProd,
                        categoryId: catId,
                        subcategoryId: '',
                        visibility: catVis === 'BOTH' ? 'BOTH' : catVis,
                      });
                    }}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.visibility || 'BOTH'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Select Subcategory</label>
                  <select
                    value={newProd.subcategoryId}
                    onChange={(e) => setNewProd({ ...newProd, subcategoryId: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Aurelia 14K Gold Opal Stud"
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="JW-STD-009"
                    className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.retailPrice}
                    onChange={(e) => setNewProd({ ...newProd, retailPrice: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">B2B Price (₹)</label>
                  <input
                    type="number"
                    value={newProd.b2bPrice}
                    onChange={(e) => setNewProd({ ...newProd, b2bPrice: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              {(() => {
                const selectedCat = categories.find((c) => c.id === newProd.categoryId);
                const catVis = selectedCat?.visibility || 'BOTH';

                return (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Visibility Scope *
                      {catVis !== 'BOTH' && (
                        <span className="text-amber-700 font-bold ml-1 text-[11px]">
                          (Auto-set by Category: {catVis})
                        </span>
                      )}
                    </label>
                    <select
                      value={newProd.visibility}
                      onChange={(e) => setNewProd({ ...newProd, visibility: e.target.value })}
                      disabled={catVis !== 'BOTH'}
                      className={`w-full text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50 ${
                        catVis !== 'BOTH' ? 'bg-amber-50 cursor-not-allowed text-amber-900 border-amber-300' : 'bg-white'
                      }`}
                    >
                      {catVis === 'BOTH' ? (
                        <>
                          <option value="BOTH">Show in BOTH Retail & B2B</option>
                          <option value="RETAIL">Show in RETAIL Only</option>
                          <option value="B2B">Show in B2B Only</option>
                        </>
                      ) : catVis === 'RETAIL' ? (
                        <option value="RETAIL">Show in RETAIL Only (Fixed by Category)</option>
                      ) : (
                        <option value="B2B">Show in B2B Only (Fixed by Category)</option>
                      )}
                    </select>
                  </div>
                );
              })()}

              {/* Multi-Image Upload Section (URL & Local File Upload) */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  Product Images (Add via Web URL or Local Files)
                </label>

                <div className="bg-beige-50/70 p-3 rounded-lg border border-beige-200 space-y-2.5">
                  {/* Option 1: URL Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newProdInputUrl}
                      onChange={(e) => setNewProdInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlImage('new');
                        }
                      }}
                      placeholder="Paste Image URL (https://...)"
                      className="flex-1 bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddUrlImage('new')}
                      className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>OR UPLOAD LOCAL FILES</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Option 2: Local File Upload Input */}
                  <label className="cursor-pointer bg-white hover:bg-beige-100 border border-dashed border-gold-500/60 hover:border-gold-500 rounded-lg p-2 text-center transition-colors flex items-center justify-center gap-2 text-xs text-onyx-900 font-semibold shadow-sm">
                    <ImageIcon className="w-4 h-4 text-gold-600" />
                    <span>{uploadingFiles ? 'Uploading image file(s)...' : '📁 Select & Upload Image Files from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingFiles}
                      onChange={(e) => handleLocalFilesUpload(e, 'new')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attached Images Grid */}
                {newProd.images && newProd.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gold-600 block">
                      Attached Images ({newProd.images.length}):
                    </span>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-gray-200 rounded-lg bg-white">
                      {newProd.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group aspect-square rounded overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                          <img src={imgUrl} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-0.5 left-0.5 bg-gold-500 text-onyx-950 font-extrabold text-[8px] px-1 rounded shadow">
                              MAIN
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx, 'new')}
                            className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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
                  <label className="block font-semibold text-gray-700 mb-1">Select Category *</label>
                  <select
                    required
                    value={editProd.categoryId}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const selCat = categories.find((c) => c.id === catId);
                      const catVis = selCat?.visibility || 'BOTH';
                      setEditProd({
                        ...editProd,
                        categoryId: catId,
                        subcategoryId: '',
                        visibility: catVis === 'BOTH' ? editProd.visibility : catVis,
                      });
                    }}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50 font-semibold"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.visibility || 'BOTH'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Select Subcategory</label>
                  <select
                    value={editProd.subcategoryId}
                    onChange={(e) => setEditProd({ ...editProd, subcategoryId: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50 font-semibold"
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
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editProd.name}
                  onChange={(e) => setEditProd({ ...editProd, name: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={editProd.sku}
                    onChange={(e) => setEditProd({ ...editProd, sku: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editProd.stock}
                    onChange={(e) => setEditProd({ ...editProd, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editProd.retailPrice}
                    onChange={(e) => setEditProd({ ...editProd, retailPrice: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">B2B Price (₹)</label>
                  <input
                    type="number"
                    value={editProd.b2bPrice}
                    onChange={(e) => setEditProd({ ...editProd, b2bPrice: e.target.value })}
                    className="w-full bg-white text-gold-700 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const selectedCat = categories.find((c) => c.id === editProd.categoryId);
                  const catVis = selectedCat?.visibility || 'BOTH';

                  return (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Visibility *
                        {catVis !== 'BOTH' && (
                          <span className="text-amber-700 font-bold ml-1 text-[10px]">
                            (Fixed by Cat: {catVis})
                          </span>
                        )}
                      </label>
                      <select
                        value={editProd.visibility}
                        onChange={(e) => setEditProd({ ...editProd, visibility: e.target.value })}
                        disabled={catVis !== 'BOTH'}
                        className={`w-full text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50 ${
                          catVis !== 'BOTH' ? 'bg-amber-50 cursor-not-allowed text-amber-900 border-amber-300' : 'bg-white'
                        }`}
                      >
                        {catVis === 'BOTH' ? (
                          <>
                            <option value="BOTH">Show in BOTH Retail & B2B</option>
                            <option value="RETAIL">Show in RETAIL Only</option>
                            <option value="B2B">Show in B2B Only</option>
                          </>
                        ) : catVis === 'RETAIL' ? (
                          <option value="RETAIL">Show in RETAIL Only (Fixed by Category)</option>
                        ) : (
                          <option value="B2B">Show in B2B Only (Fixed by Category)</option>
                        )}
                      </select>
                    </div>
                  );
                })()}

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editProd.status}
                    onChange={(e) => setEditProd({ ...editProd, status: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  >
                    <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                    <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Image Upload Section for Edit Product */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  Product Images (Add via Web URL or Local Files)
                </label>

                <div className="bg-beige-50/70 p-3 rounded-lg border border-beige-200 space-y-2.5">
                  {/* Option 1: URL Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editProdInputUrl}
                      onChange={(e) => setEditProdInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlImage('edit');
                        }
                      }}
                      placeholder="Paste Image URL (https://...)"
                      className="flex-1 bg-white text-onyx-900 placeholder:text-gray-400 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddUrlImage('edit')}
                      className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>OR UPLOAD LOCAL FILES</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Option 2: Local File Upload Input */}
                  <label className="cursor-pointer bg-white hover:bg-beige-100 border border-dashed border-gold-500/60 hover:border-gold-500 rounded-lg p-2 text-center transition-colors flex items-center justify-center gap-2 text-xs text-onyx-900 font-semibold shadow-sm">
                    <ImageIcon className="w-4 h-4 text-gold-600" />
                    <span>{uploadingFiles ? 'Uploading image file(s)...' : '📁 Select & Upload Image Files from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingFiles}
                      onChange={(e) => handleLocalFilesUpload(e, 'edit')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attached Images Grid */}
                {editProd.images && editProd.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gold-600 block">
                      Attached Images ({editProd.images.length}):
                    </span>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-gray-200 rounded-lg bg-white">
                      {editProd.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group aspect-square rounded overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                          <img src={imgUrl} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-0.5 left-0.5 bg-gold-500 text-onyx-950 font-extrabold text-[8px] px-1 rounded shadow">
                              MAIN
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx, 'edit')}
                            className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editProd.description}
                  onChange={(e) => setEditProd({ ...editProd, description: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Visibility Scope *</label>
                <select
                  value={editCat.visibility}
                  onChange={(e) => setEditCat({ ...editCat, visibility: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="BOTH">Show on BOTH (Retail & B2B Wholesale)</option>
                  <option value="RETAIL">Show on RETAIL Storefront Only</option>
                  <option value="B2B">Show on B2B Wholesale Portal Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editCat.status}
                  onChange={(e) => setEditCat({ ...editCat, status: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editCat.description}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editCat.image}
                  onChange={(e) => setEditCat({ ...editCat, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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
                <label className="block font-semibold text-gray-700 mb-1">Select Parent Category *</label>
                <select
                  required
                  value={editSubcat.categoryId}
                  onChange={(e) => setEditSubcat({ ...editSubcat, categoryId: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={editSubcat.name}
                  onChange={(e) => setEditSubcat({ ...editSubcat, name: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editSubcat.status}
                  onChange={(e) => setEditSubcat({ ...editSubcat, status: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="ACTIVE">ACTIVE (Visible on storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from storefront)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editSubcat.description}
                  onChange={(e) => setEditSubcat({ ...editSubcat, description: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
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

      {/* BANNER CREATE MODAL */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold-600" />
              <span>Add Promotional Banner</span>
            </h3>

            {/* DIMENSION GUIDELINE NOTICE */}
            <div className="bg-amber-50 text-amber-900 p-3 rounded text-[11px] border border-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Required Banner Dimensions:</span>
              </div>
              <p>• Desktop: <strong>1920 × 600 px</strong> (16:5 ratio)</p>
              <p>• Mobile: <strong>1080 × 600 px</strong> • Formats: JPG, PNG, WebP (&lt; 5 MB)</p>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="e.g. Summer Luxury Piercing Festival"
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  placeholder="e.g. Up to 30% Off Wholesale & Retail Orders"
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Visibility Scope *</label>
                  <select
                    value={newBanner.visibility}
                    onChange={(e) => setNewBanner({ ...newBanner, visibility: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  >
                    <option value="BOTH">Show on BOTH (Retail & B2B)</option>
                    <option value="RETAIL">Show on RETAIL Homepage Only</option>
                    <option value="B2B">Show on B2B Wholesale Portal Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newBanner.displayOrder}
                    onChange={(e) => setNewBanner({ ...newBanner, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Target Link URL</label>
                <input
                  type="text"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  placeholder="e.g. /catalog or /b2b/catalog"
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              {/* Banner Image Upload / URL Input */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Banner Image Source *</label>
                
                <div className="bg-beige-50 p-3 rounded-lg border border-beige-200 space-y-2">
                  <input
                    type="url"
                    value={newBanner.image}
                    onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    placeholder="Enter Image URL (https://...)"
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>OR UPLOAD LOCAL IMAGE</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <label className="cursor-pointer bg-white hover:bg-beige-100 border border-dashed border-gold-500/60 hover:border-gold-500 rounded-lg p-2 text-center transition-colors flex items-center justify-center gap-2 text-xs text-onyx-900 font-semibold shadow-sm">
                    <ImageIcon className="w-4 h-4 text-gold-600" />
                    <span>{uploadingBannerImage ? 'Uploading image...' : '📁 Select Banner File from Computer (1920x600 px)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBannerImage}
                      onChange={(e) => handleBannerFileUpload(e, 'new')}
                      className="hidden"
                    />
                  </label>
                </div>

                {newBanner.image && (
                  <div className="relative aspect-[16/6] rounded border border-gray-300 overflow-hidden bg-gray-900 mt-2">
                    <img src={newBanner.image} alt="Banner Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-gold-500 text-onyx-950 font-bold text-[8px] px-1 rounded">
                      PREVIEW
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowBannerModal(false)} className="px-3 py-2 text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 px-5 py-2 rounded font-semibold shadow">
                  Save & Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANNER EDIT MODAL */}
      {showEditBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-serif font-bold text-onyx-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gold-600" />
              <span>Edit Banner Details</span>
            </h3>

            {/* DIMENSION GUIDELINE NOTICE */}
            <div className="bg-amber-50 text-amber-900 p-3 rounded text-[11px] border border-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Required Banner Dimensions:</span>
              </div>
              <p>• Desktop: <strong>1920 × 600 px</strong> (16:5 ratio)</p>
              <p>• Mobile: <strong>1080 × 600 px</strong> • Formats: JPG, PNG, WebP (&lt; 5 MB)</p>
            </div>

            <form onSubmit={handleUpdateBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={editBanner.title}
                  onChange={(e) => setEditBanner({ ...editBanner, title: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editBanner.subtitle}
                  onChange={(e) => setEditBanner({ ...editBanner, subtitle: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Visibility Scope *</label>
                  <select
                    value={editBanner.visibility}
                    onChange={(e) => setEditBanner({ ...editBanner, visibility: e.target.value })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  >
                    <option value="BOTH">Show on BOTH (Retail & B2B)</option>
                    <option value="RETAIL">Show on RETAIL Homepage Only</option>
                    <option value="B2B">Show on B2B Wholesale Portal Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editBanner.displayOrder}
                    onChange={(e) => setEditBanner({ ...editBanner, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Target Link URL</label>
                <input
                  type="text"
                  value={editBanner.link}
                  onChange={(e) => setEditBanner({ ...editBanner, link: e.target.value })}
                  className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              {/* Banner Image Upload / URL Input */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Banner Image Source *</label>
                
                <div className="bg-beige-50 p-3 rounded-lg border border-beige-200 space-y-2">
                  <input
                    type="url"
                    value={editBanner.image}
                    onChange={(e) => setEditBanner({ ...editBanner, image: e.target.value })}
                    placeholder="Enter Image URL (https://...)"
                    className="w-full bg-white text-onyx-900 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>OR UPLOAD LOCAL IMAGE</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <label className="cursor-pointer bg-white hover:bg-beige-100 border border-dashed border-gold-500/60 hover:border-gold-500 rounded-lg p-2 text-center transition-colors flex items-center justify-center gap-2 text-xs text-onyx-900 font-semibold shadow-sm">
                    <ImageIcon className="w-4 h-4 text-gold-600" />
                    <span>{uploadingBannerImage ? 'Uploading image...' : '📁 Select Banner File from Computer (1920x600 px)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBannerImage}
                      onChange={(e) => handleBannerFileUpload(e, 'edit')}
                      className="hidden"
                    />
                  </label>
                </div>

                {editBanner.image && (
                  <div className="relative aspect-[16/6] rounded border border-gray-300 overflow-hidden bg-gray-900 mt-2">
                    <img src={editBanner.image} alt="Banner Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-gold-500 text-onyx-950 font-bold text-[8px] px-1 rounded">
                      PREVIEW
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditBannerModal(false)} className="px-3 py-2 text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-onyx-900 text-gold-500 px-5 py-2 rounded font-semibold shadow">
                  Update Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-onyx-950 border border-gold-500/40 text-beige-50 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/10 text-gold-500 border border-gold-500/30 rounded-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Administrator Profile</h3>
                  <p className="text-[10px] text-gold-500 uppercase tracking-wider">System Command Credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-onyx-900 border border-gray-800 p-4 rounded-lg space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400">Account Name:</span>
                  <span className="font-bold text-white text-sm">{user?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400">Email Address:</span>
                  <span className="font-mono text-gold-400">{user?.email || 'admin@brandname.com'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400">Access Role Level:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded uppercase text-[10px]">
                    {user?.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Token Security:</span>
                  <span className="text-gray-300 font-mono">JWT Bearer Encrypted</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  logout();
                }}
                className="bg-rose-950/60 border border-rose-500/40 text-rose-300 font-semibold px-4 py-2 rounded text-xs hover:bg-rose-900 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="bg-gold-500 text-onyx-950 font-bold px-5 py-2 rounded text-xs hover:bg-gold-400 transition-colors shadow"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DATABASE RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-2 border-rose-500/50 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-onyx-900">⚠️ CRITICAL: RESTORE DATABASE SNAPSHOT</h3>
                  <p className="text-xs text-gray-500">Live database overwrite action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-lg text-xs space-y-2">
              <p className="font-bold text-rose-950 flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>PLEASE READ CAREFULLY BEFORE PROCEEDING</span>
              </p>
              <p>
                Restoring database from <strong>"{selectedBackupForRestore.filename}"</strong> will replace all current tables in your live database with data from this snapshot created on{' '}
                <strong>{new Date(selectedBackupForRestore.createdAt).toLocaleString('en-IN')}</strong> ({selectedBackupForRestore.totalRecords} total records).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-gray-700">
                To confirm database restoration, please type <strong className="text-rose-600 font-mono">RESTORE</strong> below:
              </label>
              <input
                type="text"
                value={confirmRestoreText}
                onChange={(e) => setConfirmRestoreText(e.target.value)}
                placeholder="Type RESTORE to authorize"
                className="w-full bg-white text-onyx-900 border border-gray-300 rounded-lg px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/50 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                disabled={restoringBackup}
                className="px-4 py-2 text-xs text-gray-600 hover:text-onyx-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={confirmRestoreText !== 'RESTORE' || restoringBackup}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{restoringBackup ? 'Restoring Database...' : 'Confirm & Execute Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
