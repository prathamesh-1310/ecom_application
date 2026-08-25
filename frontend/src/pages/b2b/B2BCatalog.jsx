import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, Package, Tag, AlertCircle } from 'lucide-react';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const B2BCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setPlatform } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setPlatform('B2B');
    fetchB2BProducts();
  }, []);

  const fetchB2BProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products?platform=B2B');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching B2B products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleB2BAdd = async (product) => {
    if (!user) {
      showToast('Please log in or register for a B2B Wholesale Account to place wholesale orders.', 'warning', 'B2B Wholesale Access Required');
      return;
    }
    if (user.role === 'B2B_CUSTOMER' && user.b2bApprovalStatus !== 'APPROVED') {
      showToast('Your B2B Wholesale account is pending admin approval. You will be able to order once approved by our team.', 'warning', 'Account Pending Approval');
      return;
    }

    const res = await addToCart(product.id, null, product.moq || 1);
    if (res?.success) {
      showToast(`Added ${product.moq || 1} units of ${product.name} to cart!`, 'success', 'Cart Updated');
    } else if (res?.message) {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* B2B Header */}
      <div className="bg-onyx-900 text-beige-50 p-8 rounded-lg border border-gold-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-500 border border-gold-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>B2B Wholesale Portal</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">Wholesale Catalog & Studio Supplies</h1>
          <p className="text-xs text-gray-300">
            Exclusive pricing, minimum order quantity rules (MOQ), and volume tier pricing for verified piercing studios.
          </p>
        </div>

        {!user && (
          <Link
            to="/register-b2b"
            className="shrink-0 bg-gold-500 text-onyx-950 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-colors shadow"
          >
            Apply for Wholesale Account
          </Link>
        )}
      </div>

      <PolicyBadge variant="compact" />

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading wholesale catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-beige-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative group overflow-hidden bg-beige-50">
                <img
                  src={prod.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'}
                  alt={prod.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-gold-500 text-onyx-950 text-[10px] font-bold px-2.5 py-1 rounded">
                  MOQ: {prod.moq} Units
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold-600 font-semibold">
                    {prod.category?.name}
                  </span>
                  <h3 className="font-serif font-semibold text-base text-onyx-900 mt-1 line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.description}</p>
                </div>

                {/* Tier pricing preview */}
                {prod.pricingRules && prod.pricingRules.length > 0 && (
                  <div className="bg-beige-50 p-2.5 rounded text-[11px] space-y-1">
                    <span className="font-semibold text-onyx-900 uppercase tracking-wider block text-[10px]">
                      Volume Tier Rates:
                    </span>
                    {prod.pricingRules.map((rule) => (
                      <div key={rule.id} className="flex justify-between text-gray-600">
                        <span>{rule.minimumQuantity}+ units</span>
                        <span className="font-bold text-gold-600">₹{rule.price.toFixed(2)}/ea</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-mono">SKU: {prod.sku}</span>
                    <span className="text-base font-serif font-bold text-onyx-900">
                      ₹{prod.b2bPrice ? prod.b2bPrice.toFixed(2) : prod.retailPrice.toFixed(2)}
                      <span className="text-xs font-normal text-gray-500"> / unit</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleB2BAdd(prod)}
                    className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 text-xs font-semibold px-4 py-2 rounded transition-colors"
                  >
                    Add {prod.moq} Units
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
