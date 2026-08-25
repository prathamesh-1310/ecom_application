import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PolicyBadge = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs bg-onyx-900 text-gold-500 px-3 py-1.5 rounded border border-gold-500/30">
        <ShieldAlert className="w-4 h-4 shrink-0 text-gold-500" />
        <span>Strict No Return & No Refund Policy Applies</span>
      </div>
    );
  }

  return (
    <div className="bg-onyx-900 text-beige-50 border border-gold-500/40 p-4 rounded-lg shadow-md my-4">
      <div className="flex items-start gap-3">
        <div className="bg-gold-500/20 p-2 rounded-full text-gold-500 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif font-semibold text-gold-500 text-sm tracking-wide uppercase">
            Strict No Return & No Refund Policy
          </h4>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            All purchases are final. Piercing jewelry and equipment cannot be returned, exchanged, or refunded after order placement due to strict hygiene and health standards, except for approved exceptional cases.
          </p>
          <Link
            to="/policy"
            className="inline-block text-xs text-gold-400 hover:text-white underline mt-2 transition-colors"
          >
            Read Full Policy Terms & Exceptional Case Rules &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
