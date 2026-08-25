import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, Lock, AlertOctagon } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-onyx-950 text-gray-400 text-xs border-t border-gold-500/20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-gray-800 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-7 h-7 text-gold-500 mb-2" />
            <h4 className="font-semibold text-white uppercase tracking-wider">Implant Grade Metals</h4>
            <p className="text-[11px] text-gray-400 mt-1">14K Solid Gold & ASTM F136 Titanium</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-7 h-7 text-gold-500 mb-2" />
            <h4 className="font-semibold text-white uppercase tracking-wider">Insured Shipping</h4>
            <p className="text-[11px] text-gray-400 mt-1">Dispatched in tamper-proof sealed packaging</p>
          </div>
          <div className="flex flex-col items-center">
            <Lock className="w-7 h-7 text-gold-500 mb-2" />
            <h4 className="font-semibold text-white uppercase tracking-wider">Secure Razorpay Payments</h4>
            <p className="text-[11px] text-gray-400 mt-1">UPI, Cards, NetBanking encrypted checkout</p>
          </div>
          <div className="flex flex-col items-center">
            <Headphones className="w-7 h-7 text-gold-500 mb-2" />
            <h4 className="font-semibold text-white uppercase tracking-wider">Dedicated Support</h4>
            <p className="text-[11px] text-gray-400 mt-1">Exceptional case review within 48h</p>
          </div>
        </div>

        {/* Strict No Return Policy Highlight Box */}
        <div className="my-8 p-5 bg-onyx-900 border border-gold-500/30 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-gold-500 shrink-0" />
            <div>
              <h5 className="font-serif font-semibold text-gold-500 text-sm">NO RETURN AND NO REFUND POLICY</h5>
              <p className="text-gray-300 text-xs mt-0.5">
                All purchases are final. Products cannot be returned, exchanged, or refunded after order placement due to hygiene and health standards.
              </p>
            </div>
          </div>
          <Link
            to="/policy"
            className="shrink-0 bg-gold-500 text-onyx-950 font-semibold px-4 py-2 rounded hover:bg-gold-400 transition-colors"
          >
            Read Policy Terms
          </Link>
        </div>

        {/* Footer Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          <div>
            <span className="font-serif text-xl font-bold tracking-widest text-gold-500 uppercase block mb-3">
              AURELIA
            </span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Aurelia is a premier piercing jewelry house committed to luxurious aesthetics, medical-grade body safety, and seamless B2B wholesale supply.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Retail Store</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="hover:text-gold-500 transition-colors">Catalog Overview</Link></li>
              <li><Link to="/catalog?category=nose-rings" className="hover:text-gold-500 transition-colors">Nose Rings & Septum</Link></li>
              <li><Link to="/catalog?category=ear-piercing" className="hover:text-gold-500 transition-colors">Ear Piercing Studs</Link></li>
              <li><Link to="/cart" className="hover:text-gold-500 transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">B2B Wholesale</h4>
            <ul className="space-y-2">
              <li><Link to="/register-b2b" className="hover:text-gold-500 transition-colors">Apply for Wholesale Account</Link></li>
              <li><Link to="/b2b/catalog" className="hover:text-gold-500 transition-colors">Wholesale Tools & Needles</Link></li>
              <li><Link to="/policy" className="hover:text-gold-500 transition-colors">B2B Terms & MOQ Rules</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Policy & Support</h4>
            <ul className="space-y-2">
              <li><Link to="/policy" className="text-gold-500 font-medium hover:underline">No Return & Refund Policy</Link></li>
              <li><Link to="/account" className="hover:text-gold-500 transition-colors">Order Tracking</Link></li>
              <li><Link to="/account" className="hover:text-gold-500 transition-colors">Contact Support (Exceptional Issue)</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} AURELIA Piercing Jewelry. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0">Strict No Return Policy Active • All Sales Final</p>
        </div>
      </div>
    </footer>
  );
};
