import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems, platform } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isB2B = platform === 'B2B';
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN');
  const isCurrentAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-onyx-900 text-beige-50 shadow-lg border-b border-gold-500/20">
      {/* Top Banner Notice */}
      <div className="bg-gold-500/10 text-gold-500 border-b border-gold-500/20 py-1.5 px-4 text-center text-xs tracking-wider flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Strict No Return & No Refund Policy Enforced • All Purchases Final</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? "/admin" : "/"} className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-gold-500 uppercase">
                AURELIA
              </span>
              <span className="text-[9px] tracking-[0.25em] text-gray-400 uppercase -mt-1">
                {isAdmin ? 'Admin Control Center' : isB2B ? 'B2B Wholesale Portal' : 'Fine Piercing Jewelry'}
              </span>
            </Link>
          </div>

          {/* Search Bar - Hidden for Admin */}
          {!isAdmin && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
              <input
                type="text"
                placeholder={isB2B ? "Search wholesale products, SKU, MOQ..." : "Search piercing jewelry, materials..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-onyx-800 text-xs text-beige-50 placeholder-gray-400 pl-10 pr-4 py-2 rounded-full border border-gold-500/30 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            </form>
          )}

          {/* Actions & Links */}
          <div className="flex items-center gap-5">
            {/* Back to Admin Dashboard Button: Shown ONLY when Super Admin is outside /admin (e.g. on Policy page) */}
            {isAdmin && !isCurrentAdminPage && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-xs text-gold-500 bg-gold-500/10 px-4 py-2 rounded-md border border-gold-500/30 hover:bg-gold-500 hover:text-onyx-950 font-bold transition-all shadow"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>&larr; Back to Admin Panel</span>
              </Link>
            )}

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-xs text-gray-300 hover:text-gold-500 transition-colors py-2">
                  <User className="w-5 h-5 text-gold-500" />
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-onyx-900 border border-gold-500/30 rounded-lg shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-gold-500 uppercase tracking-wider">{user.role}</p>
                    {user.role === 'B2B_CUSTOMER' && (
                      <p className="text-[10px] text-gray-400">Status: {user.b2bApprovalStatus}</p>
                    )}
                  </div>

                  {isAdmin && !isCurrentAdminPage && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-onyx-800 text-gold-500 font-semibold transition-colors">
                      Admin Dashboard
                    </Link>
                  )}

                  <Link to="/policy" className="block px-4 py-2 hover:bg-onyx-800 hover:text-gold-500 transition-colors">
                    No Return Policy
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-onyx-800 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <Link to="/login" className="text-gray-300 hover:text-gold-500 font-medium transition-colors">
                  Sign In
                </Link>
              </div>
            )}

            {/* Cart Icon - Hidden for Super Admin */}
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-gray-300 hover:text-gold-500 transition-colors">
                <ShoppingBag className="w-5 h-5 text-gold-500" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-onyx-900 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Navigation Row */}
        <nav className="flex items-center gap-6 py-2 border-t border-gold-500/10 text-xs tracking-wider uppercase">
          {isAdmin ? (
            <>
              <Link to="/admin" className={`font-bold transition-colors ${isCurrentAdminPage ? 'text-gold-500' : 'text-gray-300 hover:text-gold-500'}`}>
                Admin Control Center
              </Link>
              <Link to="/catalog" className="text-gray-300 hover:text-gold-500 transition-colors">
                Preview Retail Store
              </Link>
              <Link to="/b2b/catalog" className="text-gray-300 hover:text-gold-500 transition-colors">
                Preview B2B Portal
              </Link>
              <Link to="/policy" className="ml-auto text-gold-500/80 hover:text-gold-500 transition-colors">
                No Return Policy Document
              </Link>
            </>
          ) : (
            <>
              <Link to="/catalog" className="text-gray-300 hover:text-gold-500 transition-colors">
                All Jewelry
              </Link>
              <Link to="/catalog?category=nose-rings" className="text-gray-300 hover:text-gold-500 transition-colors">
                Nose Rings & Septum
              </Link>
              <Link to="/catalog?category=ear-piercing" className="text-gray-300 hover:text-gold-500 transition-colors">
                Ear Piercing
              </Link>
              {isB2B && (
                <Link to="/b2b/catalog" className="text-gold-500 font-semibold hover:underline">
                  Studio Needles & Tools (B2B Only)
                </Link>
              )}
              <Link to="/policy" className="ml-auto text-gold-500/80 hover:text-gold-500 transition-colors">
                No Return Policy
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
