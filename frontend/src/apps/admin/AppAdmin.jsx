import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ToastProvider, useToast } from '../../context/ToastContext';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

function AdminAuthGuard() {
  const { user, login, logout, loading } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx-950 flex items-center justify-center text-gold-500 font-serif">
        Verifying Security Credentials...
      </div>
    );
  }

  // If user is logged in AND has admin permissions
  if (user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN')) {
    return <AdminDashboard />;
  }

  const handleAdminLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      setSubmitting(true);
      const res = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPass,
      });

      if (res.data.success) {
        const loggedUser = res.data.user;
        if (loggedUser.role === 'SUPER_ADMIN' || loggedUser.role === 'STAFF_ADMIN') {
          login(res.data.token, loggedUser);
          showToast(`Welcome to Aurelia Command Center, ${loggedUser.name}!`, 'success');
        } else {
          showToast('Access Denied: Admin authorization required.', 'error', 'Unauthorized Account');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid admin credentials.', 'error', 'Authentication Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-onyx-950 text-beige-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-onyx-900 border border-gold-500/30 p-8 rounded-xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/30 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gold-500 uppercase tracking-wider">
            Admin Subdomain Portal
          </h1>
          <p className="text-xs text-gray-400">
            Restricted access. Authorized administrator & management staff only.
          </p>
        </div>

        {user && (user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF_ADMIN') && (
          <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 p-3 rounded text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Signed in as customer ({user.email}). Admin privileges required.</span>
            <button onClick={logout} className="underline font-bold text-white ml-auto">
              Logout
            </button>
          </div>
        )}

        {/* Quick Demo Admin Login */}
        <div className="bg-onyx-950 p-3.5 rounded border border-gold-500/20 space-y-2">
          <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest block">
            ⚡ Quick Admin Access
          </span>
          <button
            type="button"
            onClick={() => handleAdminLogin(null, 'admin@brandname.com', 'admin123')}
            className="w-full bg-gold-500 text-onyx-950 font-bold py-2 rounded text-xs hover:bg-gold-400 transition-colors flex items-center justify-between px-3"
          >
            <span>Log In as Super Admin</span>
            <span className="font-mono text-[10px] opacity-75">(admin@brandname.com)</span>
          </button>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Admin Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brandname.com"
              className="w-full bg-onyx-950 border border-gray-700 text-white rounded px-3 py-2.5 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-onyx-950 border border-gray-700 text-white rounded px-3 py-2.5 focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold-500 text-onyx-950 font-bold uppercase tracking-widest py-3 rounded hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AppAdmin() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AdminAuthGuard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
