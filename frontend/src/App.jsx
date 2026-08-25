import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Home } from './pages/retail/Home';
import { Catalog } from './pages/retail/Catalog';
import { ProductDetail } from './pages/retail/ProductDetail';
import { CartPage } from './pages/retail/CartPage';
import { CheckoutPage } from './pages/retail/CheckoutPage';
import { CustomerAccount } from './pages/retail/CustomerAccount';
import { PolicyPage } from './pages/retail/PolicyPage';

import { Login } from './pages/auth/Login';
import { B2BRegister } from './pages/b2b/B2BRegister';
import { B2BPendingApproval } from './pages/b2b/B2BPendingApproval';
import { B2BCatalog } from './pages/b2b/B2BCatalog';

import { AdminDashboard } from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col justify-between bg-beige-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Retail Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/account" element={<CustomerAccount />} />
                  <Route path="/policy" element={<PolicyPage />} />

                  {/* B2B Routes */}
                  <Route path="/register-b2b" element={<B2BRegister />} />
                  <Route path="/b2b/pending" element={<B2BPendingApproval />} />
                  <Route path="/b2b/catalog" element={<B2BCatalog />} />

                  {/* Admin Route */}
                  <Route path="/admin" element={<AdminDashboard />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
