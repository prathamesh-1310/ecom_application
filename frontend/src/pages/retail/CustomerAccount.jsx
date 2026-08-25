import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShieldAlert, FileText, AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CustomerAccount = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exceptional Support Modal State
  const [supportModalOrder, setSupportModalOrder] = useState(null);
  const [reason, setReason] = useState('Product damaged before delivery');
  const [description, setDescription] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportModalOrder) return;

    try {
      setSupportSubmitting(true);
      const res = await axios.post('/api/support/requests', {
        orderId: supportModalOrder.id,
        requestType: 'EXCEPTIONAL_ISSUE',
        reason,
        description,
        attachmentUrls: proofUrl ? [proofUrl] : [],
      });

      if (res.data.success) {
        setSupportSuccess('Support request submitted. Admin will review within 48 hours.');
        showToast('Exceptional issue support request submitted successfully.', 'success');
        setTimeout(() => {
          setSupportModalOrder(null);
          setSupportSuccess('');
          setDescription('');
          setProofUrl('');
          fetchOrders();
        }, 3000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit support request', 'error');
    } finally {
      setSupportSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-xs text-gray-500">Please sign in to view your account.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="bg-onyx-900 text-beige-50 p-6 rounded-lg border border-gold-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-gold-500 uppercase tracking-widest block font-semibold">{user.role}</span>
          <h1 className="text-2xl font-serif font-bold text-white">{user.name}</h1>
          <p className="text-xs text-gray-400 mt-1">{user.email} • {user.phone || 'No phone'}</p>
        </div>

        {user.role === 'B2B_CUSTOMER' && (
          <div className="bg-onyx-800 p-3 rounded border border-gold-500/30 text-xs">
            <p className="font-semibold text-gold-500">{user.companyName}</p>
            <p className="text-gray-300">GST: {user.gstNumber || 'N/A'}</p>
            <p className="text-gray-400">Approval Status: <strong className="text-gold-400">{user.b2bApprovalStatus}</strong></p>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-onyx-900 flex items-center gap-2 border-b border-gold-500/20 pb-3">
          <Package className="w-5 h-5 text-gold-600" />
          <span>My Orders & Status Tracking</span>
        </h2>

        {loading ? (
          <div className="text-xs text-gray-500 py-10 text-center">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-beige-200 text-center text-xs text-gray-500">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white border border-beige-200 rounded-lg p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-onyx-900 font-mono">{ord.orderNumber}</span>
                    <span className="text-xs text-gray-400 ml-3">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded font-semibold">
                      Payment: {ord.paymentStatus}
                    </span>
                    <span className="bg-onyx-900 text-gold-500 px-2.5 py-0.5 rounded font-semibold">
                      Status: {ord.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2 text-xs">
                  {ord.items && ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-700 py-1 border-b border-gray-50">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span className="font-semibold text-onyx-900">₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Policy Audit Record */}
                <div className="bg-beige-50 p-3 rounded text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-2 border border-beige-200">
                  <div className="flex items-center gap-1.5 text-onyx-900 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-gold-600" />
                    <span>No Return Policy Accepted (v{ord.policyVersion})</span>
                  </div>
                  <span>Timestamp: {new Date(ord.policyAcceptedAt).toLocaleString()}</span>
                </div>

                {/* Actions: Exceptional Support */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-onyx-900">Total: ₹{ord.totalAmount.toFixed(2)}</span>

                  <button
                    onClick={() => setSupportModalOrder(ord)}
                    className="text-xs bg-gold-500/10 text-gold-600 border border-gold-500/30 hover:bg-gold-500 hover:text-onyx-950 font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Contact Support for Exceptional Issue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exceptional Issue Support Modal */}
      {supportModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-serif font-bold text-onyx-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-gold-600" />
              <span>Report Exceptional Issue - Order {supportModalOrder.orderNumber}</span>
            </h3>

            {supportSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <p>{supportSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
                <div className="bg-onyx-900 text-gold-500 p-3 rounded text-[11px]">
                  <strong>Policy Reminder:</strong> Standard returns or change-of-mind refunds are not supported under our strict No Return Policy. Submitting an exceptional case requires photo proof of damaged or wrong item.
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Issue Category *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="Product damaged before delivery">Product damaged before delivery</option>
                    <option value="Product defective upon arrival">Product defective upon arrival</option>
                    <option value="Wrong product shipped in error">Wrong product shipped in error</option>
                    <option value="Package lost in transit">Package lost in transit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description of Issue *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Photo / Video Proof Image URL (Optional)</label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://example.com/damaged-photo.jpg"
                    className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSupportModalOrder(null)}
                    className="px-4 py-2 text-gray-600 hover:text-onyx-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={supportSubmitting}
                    className="bg-onyx-900 text-gold-500 font-semibold px-4 py-2 rounded hover:bg-gold-500 hover:text-onyx-900 transition-colors"
                  >
                    {supportSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
