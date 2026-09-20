import { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, ChefHat } from 'lucide-react';
import api from '../api';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch the list of current chefs
  const fetchStaff = async () => {
    try {
      // NOTE: Ensure this matches how you mounted your userRoute in Express
      // e.g., if you used app.use('/api/users', userRoute), this should be '/users/staff'
      const response = await api.get('/users/staff');
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // Load the staff list immediately when the page opens
  useEffect(() => {
    fetchStaff();
  }, []);

  // 2. Submit the form to create a new chef
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    try {
      await api.post('/users/staff', formData);

      setMessage({ type: 'success', text: `Account for ${formData.name} created successfully!` });
      setFormData({ name: '', email: '', password: '' }); // Clear the form
      fetchStaff(); // Refresh the table

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create account.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
        <p className="text-slate-500 mt-1">Create and manage accounts for your kitchen team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: CREATE STAFF FORM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-[#2563eb]" />
            Add New Chef
          </h2>

          {/* Success/Error Message Box */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all font-medium text-slate-900"
                  placeholder="e.g. Gordon Ramsay"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all font-medium text-slate-900"
                  placeholder="chef@restaurant.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all font-medium text-slate-900"
                  placeholder="kitchen123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 mt-2 disabled:opacity-70"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE STAFF LIST */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ChefHat size={20} className="text-slate-400" />
              Active Kitchen Staff
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold text-right">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                      No kitchen staff added yet.
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{member.name}</td>
                      <td className="p-4 text-slate-500">{member.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm text-right">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
