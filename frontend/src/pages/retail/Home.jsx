import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';

import { useToast } from '../../context/ToastContext';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products?platform=RETAIL'),
        axios.get('/api/categories'),
      ]);
      if (prodRes.data.success) setFeaturedProducts(prodRes.data.products.slice(0, 6));
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Home data load error:', err);
    }
  };

  const handleQuickAdd = async (productId) => {
    const res = await addToCart(productId, null, 1);
    if (res?.success) {
      showToast('Added to cart!', 'success');
    }
  };

  return (
    <div className="space-y-16 pb-16">

      {/* Hero Section */}
      <section className="relative bg-onyx-950 text-white min-h-[500px] flex items-center overflow-hidden border-b border-gold-500/30">
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/80 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-500 border border-gold-500/30 px-3 py-1 rounded-full text-xs tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solid 14K Gold & ASTM F136 Titanium</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight">
              Elegance In Every <span className="text-gold-500 italic">Piercing</span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Discover biocompatible luxury body jewelry crafted for nostrils, septums, helices, and tragus piercings. Designed with precision clasping and sealed sterile packaging.
            </p>

            {/* Strict Policy Banner Notice */}
            <PolicyBadge variant="compact" />

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/catalog"
                className="bg-gold-500 text-onyx-950 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Shop Jewelry Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif text-onyx-900">Curated Collections</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Browse by piercing placement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative h-72 rounded-lg overflow-hidden border border-gold-500/20 shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-gold-500 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-1 font-light">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-xs text-gold-500 font-semibold mt-3">
                  Explore Category &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gold-500/20 pb-4">
          <div>
            <h2 className="text-2xl font-serif text-onyx-900">Featured Piercing Jewelry</h2>
            <p className="text-xs text-gray-500">Handcrafted solid gold & implant grade titanium</p>
          </div>
          <Link to="/catalog" className="text-xs text-gold-600 font-semibold hover:underline flex items-center gap-1">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-beige-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative group overflow-hidden bg-beige-50">
                <img
                  src={prod.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                  alt={prod.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-onyx-900 text-gold-500 text-[10px] font-bold px-2 py-1 rounded">
                  No Returns
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold-600 font-medium">
                    {prod.category?.name}
                  </span>
                  <Link to={`/products/${prod.slug}`}>
                    <h3 className="font-serif font-semibold text-base text-onyx-900 hover:text-gold-600 transition-colors mt-1 line-clamp-1">
                      {prod.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-mono block">SKU: {prod.sku}</span>
                    <span className="text-base font-semibold text-onyx-900">
                      ₹{prod.salePrice ? prod.salePrice.toFixed(2) : prod.retailPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(prod.id)}
                    className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 text-xs font-semibold px-4 py-2 rounded transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strict Policy Banner Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PolicyBadge />
      </section>
    </div>
  );
};
