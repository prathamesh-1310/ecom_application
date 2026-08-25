import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const B2BPendingApproval = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="bg-gold-500/10 text-gold-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-gold-500/30">
        <Clock className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-serif font-bold text-onyx-900">Wholesale Account Pending Approval</h1>
      <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
        Thank you for registering <strong>{user?.companyName || 'your business'}</strong>. Your application is currently being reviewed by our B2B wholesale administration team.
      </p>

      <div className="bg-onyx-900 text-beige-50 p-5 rounded-lg border border-gold-500/30 max-w-md mx-auto text-left text-xs space-y-2">
        <div className="flex items-center gap-2 text-gold-500 font-semibold uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>Restricted B2B Access</span>
        </div>
        <p className="text-gray-300 text-[11px]">
          Wholesale prices, studio equipment catalogs, and MOQ volume discounts become accessible immediately upon admin approval.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-4">
        <Link
          to="/"
          className="bg-onyx-900 text-gold-500 font-semibold px-5 py-2.5 rounded text-xs uppercase tracking-wider hover:bg-gold-500 hover:text-onyx-900 transition-colors flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          <span>Browse Retail Store</span>
        </Link>
      </div>
    </div>
  );
};
