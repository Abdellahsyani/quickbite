import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../api'; // Your axios setup

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    // 1. STOPS THE PAGE FROM REFRESHING!
    e.preventDefault();
    setError('');

    try {
      // 2. Call actual Express backend
      const response = await api.post('/auth/login', { email, password });

      // 3. Save the token and role EXACTLY as ProtectedRoute expects them
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role); // Make sure your backend sends the role here!

      // 4. Send them to the correct page based on their job title
      if (user.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        navigate('/'); // The Kitchen board
      }

    } catch (err) {
      console.error("Login failed:", err);
      // Show the error message from the backend, or a generic one
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Lock size={32} className="text-blue-600" />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Staff Portal</h2>
        <p className="text-slate-500 font-medium mb-8">Sign in to access your dashboard.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* The onSubmit MUST point to handleLogin */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900"
                placeholder="admin@restaurant.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            Sign In <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
