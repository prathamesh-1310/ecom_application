import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';
import { Building2, User, LogOut, ShoppingBag } from 'lucide-react';

// B2B Pages
import { B2BCatalog } from '../../pages/b2b/B2BCatalog';
import { B2BRegister } from '../../pages/b2b/B2BRegister';
import { B2BPendingApproval } from '../../pages/b2b/B2BPendingApproval';
import { Login } from '../../pages/auth/Login';
import { CartPage } from '../../pages/retail/CartPage';
import { CheckoutPage } from '../../pages/retail/CheckoutPage';

function B2BHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-onyx-950 text-beige-50 border-b border-gold-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center text-onyx-950 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-gold-500 tracking-wider">AURELIA</span>
            <span className="text-[10px] block uppercase tracking-widest text-gray-400 font-sans">B2B Wholesale Portal</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-xs font-semibold">
          <Link to="/" className="hover:text-gold-500 transition-colors">Catalog & Pricing</Link>
          <Link to="/cart" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-gold-500" />
            <span>Wholesale Cart</span>
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="hover:text-gold-500 transition-colors">Partner Sign In</Link>
              <Link to="/register" className="bg-gold-500 text-onyx-950 px-3.5 py-1.5 rounded font-bold hover:bg-gold-400 transition-colors">
                Apply for Wholesale
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 border-l border-gray-800 pl-4">
              <span className="text-gray-300 font-normal">
                {user.companyName || user.name} ({user.b2bApprovalStatus || user.role})
              </span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function B2BFooter() {
  return (
    <footer className="bg-onyx-950 text-gray-400 border-t border-gold-500/20 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="text-gold-500 font-serif font-semibold">AURELIA B2B WHOLESALE STUDIO PORTAL</p>
        <p className="text-gray-500 text-[11px]">
          Strictly for verified professional body piercing studios, clinics, and wholesale distribution partners.
        </p>
        <p className="text-gray-600 text-[10px] pt-4">© 2026 Aurelia Fine Jewelry. All B2B Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default function AppB2B() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col justify-between bg-beige-50">
              <B2BHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<B2BCatalog />} />
                  <Route path="/register" element={<B2BRegister />} />
                  <Route path="/register-b2b" element={<Navigate to="/register" replace />} />
                  <Route path="/pending" element={<B2BPendingApproval />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <B2BFooter />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
