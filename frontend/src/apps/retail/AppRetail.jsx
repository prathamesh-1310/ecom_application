import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

// Retail Pages
import { Home } from '../../pages/retail/Home';
import { Catalog } from '../../pages/retail/Catalog';
import { ProductDetail } from '../../pages/retail/ProductDetail';
import { CartPage } from '../../pages/retail/CartPage';
import { CheckoutPage } from '../../pages/retail/CheckoutPage';
import { CustomerAccount } from '../../pages/retail/CustomerAccount';
import { PolicyPage } from '../../pages/retail/PolicyPage';
import { Login } from '../../pages/auth/Login';

export default function AppRetail() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col justify-between bg-beige-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Retail Storefront Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/account" element={<CustomerAccount />} />
                  <Route path="/policy" element={<PolicyPage />} />
                  <Route path="/login" element={<Login />} />

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
