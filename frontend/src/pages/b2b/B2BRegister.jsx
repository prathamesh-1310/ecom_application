import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, CheckCircle2, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const B2BRegister = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    businessType: 'Piercing Studio',
    instagramUrl: '',
    facebookUrl: '',
    email: '',
    password: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.instagramUrl.trim()) {
      showToast('Instagram Link / Handle is compulsory for wholesale registration.', 'warning', 'Field Required');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register-b2b', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.companyName,
        businessType: formData.businessType,
        instagramUrl: formData.instagramUrl,
        facebookUrl: formData.facebookUrl,
        address: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
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
          Register your studio or business for wholesale pricing and studio supplies access.
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
              <label className="block font-semibold text-gray-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
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
                placeholder="+91 98765 43210"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Link / Handle *</span>
              </label>
              <input
                type="text"
                required
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourstudio or @yourstudio"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Link / Page</span>
              </label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourstudiopage"
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
                placeholder="studio@example.com"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Create Your Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set a secure password"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Studio Street Address, Suite / Unit #"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Landmark, Building, Floor (Optional)"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="Postal Code"
                className="w-full bg-beige-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-onyx-900 text-gold-500 hover:bg-gold-500 hover:text-onyx-900 font-bold uppercase tracking-widest py-3.5 rounded transition-all shadow-md mt-4"
          >
            {loading ? 'Submitting Application...' : 'Submit Wholesale Application'}
          </button>
        </form>
      )}
    </div>
  );
};
