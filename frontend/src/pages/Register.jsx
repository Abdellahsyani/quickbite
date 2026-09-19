import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, ArrowRight, User } from 'lucide-react';
import api from '../api'; // Your axios setup

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // 1. IF NO TOKEN: Hide the form, show the SaaS sales landing page
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-lg text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">QuickBite POS</h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            QuickBite is an invite-only restaurant management platform.
            If you are a restaurant owner looking to upgrade your operations, contact our sales team to purchase a license.
          </p>
          <a href="mailto:syaniabdos@gmail.com" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
            Contact Sales Team
          </a>
        </div>
      </div>
    );
  }

  // 2. Handle form submission (Send data + token to Express)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', { ...formData, token });
      alert("Account created! You can now log in.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    }
  };

  // 3. IF TOKEN IS PRESENT: Show the registration form
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Setup Account</h2>
        <p className="text-slate-500 font-medium mb-8">Welcome to QuickBite. Enter your details to claim your admin account.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Restaurant / Owner Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            Create Admin Account <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
