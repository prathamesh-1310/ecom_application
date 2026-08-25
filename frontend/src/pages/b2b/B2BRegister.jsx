import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const B2BRegister = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    businessType: 'Piercing Studio',
    expectedVolume: '100-500 units/month',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register-b2b', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        businessType: formData.businessType,
        expectedVolume: formData.expectedVolume,
        address: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
        },
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        setSuccessMsg(res.data.message);
        showToast('Wholesale application submitted successfully!', 'success');
        setTimeout(() => {
          navigate('/b2b/pending');
        }, 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'B2B registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2 border-b border-gold-500/20 pb-6">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 border border-gold-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
          <Building2 className="w-4 h-4" />
          <span>B2B Wholesale Portal</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-onyx-900">Wholesale Account Application</h1>
        <p className="text-xs text-gray-500">
          Register your studio or business for wholesale pricing, MOQ access, and volume tier discounts.
        </p>
      </div>

      {successMsg ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-lg border border-green-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
          <h3 className="text-lg font-serif font-bold">Application Submitted!</h3>
          <p className="text-xs">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-beige-200 p-8 rounded-lg shadow-sm space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-onyx-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
              1. Business Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Studio Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Ink & Needle Piercing Studio"
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Business Type *</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                >
                  <option value="Piercing Studio">Piercing Studio</option>
                  <option value="Tattoo Parlor">Tattoo & Piercing Parlor</option>
                  <option value="Jewelry Retailer">Wholesale Jewelry Retailer</option>
                  <option value="Beauty Salon">Beauty Salon & Spa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expected Monthly Order Volume *</label>
                <select
                  value={formData.expectedVolume}
                  onChange={(e) => setFormData({ ...formData, expectedVolume: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                >
                  <option value="50-100 units/month">50 - 100 units / month</option>
                  <option value="100-500 units/month">100 - 500 units / month</option>
                  <option value="500+ units/month">500+ units / month</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-onyx-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
              2. Contact & Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-onyx-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
              3. Business Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-onyx-900 text-beige-50 p-4 rounded text-[11px] leading-relaxed">
            <strong>B2B Terms:</strong> B2B wholesale orders are subject to Minimum Order Quantities (MOQ) and our strict <strong>No Return and No Refund Policy</strong>.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 font-bold uppercase tracking-widest py-3.5 rounded transition-all shadow-md"
          >
            {loading ? 'Submitting Application...' : 'Submit Wholesale Application'}
          </button>
        </form>
      )}
    </div>
  );
};
