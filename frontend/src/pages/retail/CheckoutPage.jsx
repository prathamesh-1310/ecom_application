import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { PolicyCheckbox } from '../../components/common/PolicyCheckbox';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CheckoutPage = () => {
  const { cart, platform, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '101 Jewelry Lane, Marine Drive',
    addressLine2: 'Apt 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400020',
  });

  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const isB2B = platform === 'B2B';
  const shippingCharge = cart.subtotal > 1500 || isB2B ? 0 : 99;
  const tax = Math.round(cart.subtotal * 0.03 * 100) / 100;
  const finalTotal = Math.max(0, cart.subtotal + shippingCharge + tax);

  const { showToast } = useToast();

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!policyAccepted) {
      showToast('You must actively accept the No Return and No Refund Policy before proceeding with checkout.', 'warning', 'Policy Agreement Required');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create order on backend
      const res = await axios.post('/api/orders/checkout', {
        cartId: cart.id,
        shippingAddress: address,
        billingAddress: address,
        platform,
        policyAccepted: true,
        policyVersion: '1.0',
      });

      if (!res.data.success) {
        showToast(res.data.message || 'Checkout failed', 'error');
        setSubmitting(false);
        return;
      }

      const { order, razorpayOrder } = res.data;

      // 2. Trigger Razorpay Payment (or test payment verification)
      const verifyRes = await axios.post('/api/orders/verify-payment', {
        orderId: order.id,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpayOrderId: razorpayOrder?.id || `rzp_mock_order_${Date.now()}`,
        razorpaySignature: 'mock_signature',
      });

      if (verifyRes.data.success) {
        setOrderComplete(verifyRes.data.order);
        fetchCart();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(err.response?.data?.message || 'Error processing checkout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-onyx-900">Order Confirmed!</h1>
        <p className="text-sm text-gray-600">
          Thank you for your order, <strong>{orderComplete.orderNumber}</strong>.
        </p>

        <div className="bg-onyx-900 text-beige-50 p-6 rounded-lg border border-gold-500/30 max-w-md mx-auto text-left text-xs space-y-2">
          <h4 className="font-serif font-semibold text-gold-500 text-sm uppercase">Order Details</h4>
          <p><strong>Order ID:</strong> {orderComplete.orderNumber}</p>
          <p><strong>Total Paid:</strong> ₹{orderComplete.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> {orderComplete.paymentStatus}</p>
          <p><strong>Policy Acceptance Record:</strong> Accepted v1.0 at {new Date(orderComplete.policyAcceptedAt).toLocaleString()}</p>
        </div>

        <PolicyBadge />

        <button
          onClick={() => navigate('/account')}
          className="bg-onyx-900 text-gold-500 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-500 hover:text-onyx-900 transition-colors"
        >
          View Order Status in My Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-gold-500/20 pb-4">
        <h1 className="text-3xl font-serif font-bold text-onyx-900">Secure Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">Complete your delivery address and policy acknowledgment to place order.</p>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Address Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-onyx-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              1. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value={address.country}
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* MANDATORY POLICY CHECKBOX */}
          <div className="bg-white p-6 rounded-lg border border-gold-500/30 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-onyx-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              2. Strict No Return & No Refund Policy Agreement
            </h3>
            <PolicyCheckbox checked={policyAccepted} onChange={setPolicyAccepted} required />
          </div>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="space-y-6">
          <div className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-onyx-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              Order Total
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (3% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-serif font-bold text-onyx-900">
                <span>Total Amount</span>
                <span className="text-gold-600">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!policyAccepted || submitting}
              className="w-full bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 disabled:opacity-40 text-xs font-bold uppercase tracking-widest py-4 rounded transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Processing Payment...' : 'Pay via Razorpay'}</span>
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Encrypted 256-bit SSL transaction via Razorpay Gateway.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
