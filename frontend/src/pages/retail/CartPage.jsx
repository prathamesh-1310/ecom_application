import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem, platform } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const disc = (cart.subtotal * 10) / 100;
      setCouponDiscount(disc);
      setCouponApplied(true);
      showToast('Coupon WELCOME10 applied! 10% discount added.', 'success', 'Coupon Applied');
    } else {
      showToast('Invalid coupon code. Try using WELCOME10 for 10% off.', 'error', 'Invalid Coupon');
    }
  };

  const isB2B = platform === 'B2B';
  const shippingCharge = cart.subtotal > 1500 || isB2B ? 0 : 99;
  const tax = Math.round(cart.subtotal * 0.03 * 100) / 100;
  const finalTotal = Math.max(0, cart.subtotal - couponDiscount + shippingCharge + tax);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-gold-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-onyx-900">Your Cart is Currently Empty</h2>
        <p className="text-xs text-gray-500">Explore our luxury piercing jewelry collections to add items.</p>
        <Link
          to="/catalog"
          className="inline-block bg-onyx-900 text-gold-500 font-semibold px-6 py-2.5 rounded text-xs uppercase tracking-wider hover:bg-gold-500 hover:text-onyx-900 transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-gold-500/20 pb-4">
        <h1 className="text-3xl font-serif font-bold text-onyx-900">
          Shopping Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review your piercing jewelry and wholesale quantities before checkout.</p>
      </div>

      <PolicyBadge variant="compact" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-beige-200 p-4 rounded-lg shadow-sm flex items-center justify-between gap-4"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded bg-beige-50 shrink-0"
              />

              <div className="flex-1 space-y-1">
                <Link to={`/products/${item.productSlug}`} className="font-serif font-semibold text-sm text-onyx-900 hover:text-gold-600 transition-colors line-clamp-1">
                  {item.productName}
                </Link>
                {item.variantName && (
                  <span className="text-xs text-gray-500 block">{item.variantName}</span>
                )}
                <span className="text-xs text-gray-400 font-mono block">SKU: {item.productSku}</span>
                {isB2B && item.moq > 1 && (
                  <span className="text-[10px] text-gold-600 font-semibold">MOQ: {item.moq} units</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={isB2B ? item.moq || 1 : 1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-center font-semibold focus:outline-none focus:border-gold-500"
                />

                <div className="text-right w-24">
                  <span className="text-sm font-semibold text-onyx-900 block">
                    ₹{item.totalPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400">₹{item.unitPrice.toFixed(2)}/ea</span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-onyx-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-onyx-900">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount (WELCOME10)</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (3% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-serif font-bold text-onyx-900">
                <span>Payable Amount</span>
                <span className="text-gold-600">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input Form */}
            <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Coupon Code (e.g. WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-beige-50 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                className="bg-onyx-800 text-gold-500 text-xs font-semibold px-3 py-1.5 rounded hover:bg-onyx-900 transition-colors"
              >
                Apply
              </button>
            </form>

            <button
              onClick={() => {
                if (!user) {
                  showToast('Please sign in or create an account to proceed with checkout and track your order.', 'info', 'Account Required');
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 text-xs font-bold uppercase tracking-widest py-3.5 rounded transition-all shadow flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <PolicyBadge />
        </div>
      </div>
    </div>
  );
};
