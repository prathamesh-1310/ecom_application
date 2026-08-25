import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, UserCheck, Building2, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPass,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success', 'Sign In Successful');
        if (res.data.user.role === 'SUPER_ADMIN' || res.data.user.role === 'STAFF_ADMIN') {
          navigate('/admin');
        } else if (res.data.user.role === 'B2B_CUSTOMER') {
          navigate('/b2b/catalog');
        } else {
          navigate('/account');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your email and password.', 'error', 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-onyx-900">Sign In to Aurelia</h1>
        <p className="text-xs text-gray-500">Access your account, wholesale catalog, or admin panel.</p>
      </div>

      {/* 1-Click Demo Accounts Quick Login Buttons */}
      <div className="bg-onyx-900 text-beige-50 p-4 rounded-lg border border-gold-500/30 space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold block">
          ⚡ 1-Click Demo Quick Logins
        </span>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleLoginSubmit(null, 'admin@brandname.com', 'admin123')}
            className="w-full bg-gold-500 text-onyx-950 font-bold py-2 px-3 rounded hover:bg-gold-400 transition-colors flex items-center justify-between"
          >
            <span>Log In as Super Admin</span>
            <span className="text-[10px] font-mono opacity-80">(admin@brandname.com)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoginSubmit(null, 'marcus@inkandpierce.com', 'user123')}
            className="w-full bg-onyx-800 text-gold-400 font-semibold py-2 px-3 rounded hover:bg-onyx-700 transition-colors flex items-center justify-between border border-gold-500/20"
          >
            <span>Log In as Approved B2B Customer</span>
            <span className="text-[10px] font-mono opacity-70">(marcus@...)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoginSubmit(null, 'elena@example.com', 'user123')}
            className="w-full bg-onyx-800 text-gray-300 font-semibold py-2 px-3 rounded hover:bg-onyx-700 transition-colors flex items-center justify-between border border-gray-700"
          >
            <span>Log In as Retail Customer</span>
            <span className="text-[10px] font-mono opacity-70">(elena@...)</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleLoginSubmit} className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@brandname.com"
            className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-onyx-900 text-gold-500 font-bold uppercase tracking-widest py-3 rounded hover:bg-gold-500 hover:text-onyx-950 transition-colors flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        <div className="pt-2 flex justify-between text-gray-500 text-[11px]">
          <span>Need a wholesale account?</span>
          <Link to="/register-b2b" className="text-gold-600 font-semibold hover:underline">
            Apply for B2B Registration
          </Link>
        </div>
      </form>
    </div>
  );
};
