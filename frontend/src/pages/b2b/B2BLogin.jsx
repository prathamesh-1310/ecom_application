import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const B2BLogin = () => {
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
        const user = res.data.user;
        login(res.data.token, user);
        showToast(`Welcome back, ${user.name}!`, 'success', 'B2B Partner Signed In');

        if (user.role === 'SUPER_ADMIN' || user.role === 'STAFF_ADMIN') {
          navigate('/admin');
        } else if (user.role === 'B2B_CUSTOMER' && user.b2bApprovalStatus === 'PENDING') {
          navigate('/b2b/pending');
        } else {
          navigate('/b2b/catalog');
        }
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'B2B partner authentication failed. Please check credentials.',
        'error',
        'Sign In Failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 border border-gold-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
          <Building2 className="w-4 h-4 text-gold-600" />
          <span>B2B Wholesale Portal</span>
        </div>

        <h1 className="text-3xl font-serif font-bold text-onyx-900">Partner Sign In</h1>
        <p className="text-xs text-gray-500">
          Access your verified wholesale studio account, catalog pricing, and order history.
        </p>
      </div>

      {/* 1-Click Quick Partner Demo Logins */}
      <div className="bg-onyx-900 text-beige-50 p-4 rounded-lg border border-gold-500/30 space-y-2.5 shadow-md">
        <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold block">
          ⚡ 1-Click B2B Partner Demo Logins
        </span>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleLoginSubmit(null, 'marcus@inkandpierce.com', 'user123')}
            className="w-full bg-gold-500 text-onyx-950 font-bold py-2 px-3 rounded hover:bg-gold-400 transition-colors flex items-center justify-between"
          >
            <span>Log In as Approved B2B Partner</span>
            <span className="text-[10px] font-mono opacity-80">(marcus@inkandpierce.com)</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoginSubmit(null, 'sarah@aurorapiercing.com', 'user123')}
            className="w-full bg-onyx-800 text-gray-300 font-semibold py-2 px-3 rounded hover:bg-onyx-700 transition-colors flex items-center justify-between border border-gray-700"
          >
            <span>Log In as Pending B2B Applicant</span>
            <span className="text-[10px] font-mono opacity-70">(sarah@aurorapiercing.com)</span>
          </button>
        </div>
      </div>

      {/* Partner Sign In Form */}
      <form onSubmit={handleLoginSubmit} className="bg-white border border-beige-200 p-6 rounded-lg shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Business Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="studio@example.com"
            className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Account Password *</label>
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
          className="w-full bg-onyx-900 text-gold-500 font-bold uppercase tracking-widest py-3.5 rounded hover:bg-gold-500 hover:text-onyx-950 transition-colors flex items-center justify-center gap-2 shadow"
        >
          <Lock className="w-4 h-4" />
          <span>{loading ? 'Authenticating Partner...' : 'Sign In to B2B Portal'}</span>
        </button>

        <div className="pt-3 border-t border-gray-100 text-center space-y-2">
          <p className="text-gray-500 text-[11px]">Don't have a Wholesale Partner Account yet?</p>
          <Link
            to="/register-b2b"
            className="inline-flex items-center gap-1.5 text-gold-600 font-bold hover:underline transition-colors text-xs"
          >
            <span>Apply for B2B Wholesale Access &rarr;</span>
          </Link>
        </div>
      </form>
    </div>
  );
};
