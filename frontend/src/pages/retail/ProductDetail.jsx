import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Info, ShoppingBag } from 'lucide-react';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, platform } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/${slug}`);
      if (res.data.success) {
        const prod = res.data.product;
        setProduct(prod);
        if (prod.images && prod.images.length > 0) {
          setActiveImage(prod.images[0].imageUrl);
        }
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
        if (platform === 'B2B' && prod.moq) {
          setQuantity(prod.moq);
        }
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product.id, selectedVariant?.id || null, quantity);
    if (res?.success) {
      showToast(`Added ${quantity} units of ${product.name} to cart!`, 'success', 'Cart Updated');
    } else if (res?.message) {
      showToast(res.message, 'warning');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-xs text-gray-500">Product not found.</div>;
  }

  const isB2B = platform === 'B2B';
  const unitPrice = isB2B && product.b2bPrice ? product.b2bPrice : (product.salePrice || product.retailPrice);
  const finalPrice = unitPrice + (selectedVariant?.priceAdjustment || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">


      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-onyx-900">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-onyx-900">Catalog</Link>
        <span>/</span>
        <span className="text-onyx-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-beige-50 rounded-lg overflow-hidden border border-beige-200 shadow-sm">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`w-20 h-20 rounded border overflow-hidden shrink-0 transition-all ${
                    activeImage === img.imageUrl ? 'border-gold-500 ring-2 ring-gold-500/20' : 'border-gray-200'
                  }`}
                >
                  <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold block mb-1">
              {product.category?.name}
            </span>
            <h1 className="text-3xl font-serif font-bold text-onyx-900">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
              <span>•</span>
              <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-beige-50 border border-beige-200 p-4 rounded-lg flex items-baseline gap-3">
            <span className="text-2xl font-serif font-bold text-onyx-900">₹{finalPrice.toFixed(2)}</span>
            {product.salePrice && !isB2B && (
              <span className="text-sm text-gray-400 line-through">₹{product.retailPrice.toFixed(2)}</span>
            )}
            {isB2B && product.moq > 1 && (
              <span className="ml-auto text-xs bg-gold-500/20 text-gold-600 font-semibold px-2.5 py-1 rounded">
                Wholesale MOQ: {product.moq} units
              </span>
            )}
          </div>

          {/* B2B Pricing Tier Table if applicable */}
          {isB2B && product.pricingRules && product.pricingRules.length > 0 && (
            <div className="bg-white border border-gold-500/30 p-4 rounded-lg space-y-2">
              <h4 className="text-xs font-semibold text-onyx-900 uppercase tracking-wider">Wholesale Quantity Tier Pricing</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.pricingRules.map((rule) => (
                  <div key={rule.id} className="bg-beige-50 p-2 rounded flex justify-between">
                    <span>{rule.minimumQuantity}+ units</span>
                    <span className="font-bold text-gold-600">₹{rule.price.toFixed(2)}/ea</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-onyx-900 uppercase tracking-wider block">
                Select Variant (Size / Material):
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-xs rounded border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-onyx-900 text-gold-500 border-gold-500 font-semibold shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gold-500'
                    }`}
                  >
                    {v.name}: {v.value}
                    {v.priceAdjustment > 0 && ` (+₹${v.priceAdjustment})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-onyx-900 uppercase tracking-wider block">Quantity:</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={isB2B ? product.moq || 1 : 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-white border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-onyx-900 focus:outline-none focus:border-gold-500"
              />
              {isB2B && (
                <span className="text-xs text-gray-500">
                  (Minimum order: {product.moq} units)
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 text-xs font-bold uppercase tracking-widest py-3.5 rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Shopping Cart</span>
          </button>

          {/* Mandatory Strict Policy Warning Box */}
          <PolicyBadge />

          {/* Product Hygiene & Care */}
          <div className="border-t border-gray-200 pt-4 space-y-3 text-xs text-gray-600">
            {product.hygieneNotice && (
              <div className="flex items-start gap-2 text-onyx-900">
                <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <span><strong>Hygiene Notice:</strong> {product.hygieneNotice}</span>
              </div>
            )}
            {product.careInstructions && (
              <div className="flex items-start gap-2 text-gray-600">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span><strong>Product Care:</strong> {product.careInstructions}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
