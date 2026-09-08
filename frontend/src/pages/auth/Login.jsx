import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = (token, user, isNewRegistration = false) => {
    login(token, user);
    showToast(
      isNewRegistration
        ? `Account created successfully! Welcome to Aurelia, ${user.name}.`
        : `Welcome back, ${user.name}!`,
      'success'
    );

    if (redirectTarget) {
      navigate(redirectTarget);
    } else if (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN') {
      navigate('/admin');
    } else if (user.role === 'B2B_CUSTOMER') {
      navigate('/b2b/catalog');
    } else {
      navigate('/account');
    }
  };

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
        handleAuthSuccess(res.data.token, res.data.user, false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Check email & password.', 'error', 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
      });

      if (res.data.success) {
        handleAuthSuccess(res.data.token, res.data.user, true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-onyx-900">
          {mode === 'login' ? 'Sign In to Aurelia' : 'Create Retail Account'}
        </h1>
        <p className="text-xs text-gray-500">
          {redirectTarget === '/checkout'
            ? 'Sign in or create an account to proceed with checkout and track your order.'
            : 'Access your account history, saved addresses, and status tracking.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-beige-200 p-1 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-md transition-all ${
            mode === 'login' ? 'bg-onyx-900 text-gold-500 shadow' : 'text-gray-700 hover:text-onyx-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-md transition-all ${
            mode === 'register' ? 'bg-onyx-900 text-gold-500 shadow' : 'text-gray-700 hover:text-onyx-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* 1-Click Demo Accounts Quick Login Buttons (Shown in Login mode) */}
      {mode === 'login' && (
        <div className="bg-onyx-900 text-beige-50 p-4 rounded-lg border border-gold-500/30 space-y-2.5">
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
              onClick={() => handleLoginSubmit(null, 'elena@example.com', 'user123')}
              className="w-full bg-onyx-800 text-gray-300 font-semibold py-2 px-3 rounded hover:bg-onyx-700 transition-colors flex items-center justify-between border border-gray-700"
            >
              <span>Log In as Retail Customer</span>
              <span className="text-[10px] font-mono opacity-70">(elena@...)</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign In Form */}
      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@example.com"
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


        </form>
      ) : (
        /* Registration Form */
        <form onSubmit={handleRegisterSubmit} className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Rostova"
              className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@example.com"
              className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9812345678"
              className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={4}
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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Create Account & Continue'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
