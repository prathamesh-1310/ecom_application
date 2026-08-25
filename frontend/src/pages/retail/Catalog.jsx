import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import { PolicyBadge } from '../../components/common/PolicyBadge';
import { useCart } from '../../context/CartContext';

import { useToast } from '../../context/ToastContext';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchCatalogData();
  }, [categoryParam, searchParam, sortOption]);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products', {
          params: {
            platform: 'RETAIL',
            categorySlug: categoryParam,
            search: searchParam,
            sort: sortOption,
          },
        }),
        axios.get('/api/categories'),
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Catalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId) => {
    const res = await addToCart(productId, null, 1);
    if (res?.success) {
      showToast('Added to cart!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-onyx-900">Retail Piercing Collection</h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse implant-grade titanium & solid gold piercing jewelry. Strict No Return Policy applies.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-onyx-900 focus:outline-none focus:border-gold-500"
          >
            <option value="newest">Sort by: Newest Arrivals</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <PolicyBadge variant="compact" />

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="space-y-6 bg-white p-5 rounded-lg border border-beige-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Filter className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-semibold text-sm text-onyx-900 uppercase">Categories</h3>
          </div>

          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => setSearchParams({})}
                className={`w-full text-left py-1.5 px-3 rounded transition-colors ${
                  !categoryParam ? 'bg-onyx-900 text-gold-500 font-semibold' : 'text-gray-600 hover:text-onyx-900'
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`w-full text-left py-1.5 px-3 rounded transition-colors ${
                    categoryParam === cat.slug
                      ? 'bg-onyx-900 text-gold-500 font-semibold'
                      : 'text-gray-600 hover:text-onyx-900'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-xs text-gray-500">Loading piercing catalog...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-beige-200">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-onyx-900">No products found</p>
              <p className="text-xs text-gray-500 mt-1">Try clearing your search query or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-beige-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative group overflow-hidden bg-beige-50">
                    <img
                      src={prod.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                      alt={prod.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-onyx-900 text-gold-500 text-[10px] font-bold px-2 py-1 rounded">
                      Final Sale
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gold-600 font-medium">
                        {prod.category?.name}
                      </span>
                      <Link to={`/products/${prod.slug}`}>
                        <h3 className="font-serif font-semibold text-sm text-onyx-900 hover:text-gold-600 transition-colors mt-0.5 line-clamp-1">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-gray-400 block">SKU: {prod.sku}</span>
                        <span className="text-base font-semibold text-onyx-900">
                          ₹{prod.salePrice ? prod.salePrice.toFixed(2) : prod.retailPrice.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuickAdd(prod.id)}
                        className="bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
