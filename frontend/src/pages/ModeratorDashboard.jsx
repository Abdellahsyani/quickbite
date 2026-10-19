import { useState } from 'react';
import { Link as LinkIcon, Copy, CheckCircle, TrendingUp, Store, Utensils, Activity } from 'lucide-react';
import api from '../api';

export default function ModeratorDashboard() {
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  // Mock data for the layout structure
  const mockStats = {
    totalRestaurants: 12,
    totalGMV: 45280.50,
    activeOrders: 34,
    topItems: [
      { name: "Double Smashburger", sales: 842 },
      { name: "Truffle Fries", sales: 610 },
      { name: "Spicy Chicken Wrap", sales: 495 }
    ]
  };

  const handleGenerateLink = async () => {
    try {
      const response = await api.post('/auth/generate-invite');
      setInviteLink(response.data.inviteUrl);
      setCopied(false);
    } catch (error) {
      console.error("Failed to generate link:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Monitor QuickBite network health and onboard new clients.</p>
      </div>

      {/* --- TOP METRICS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Tenants</p>
              <h2 className="text-3xl font-bold text-slate-900">{mockStats.totalRestaurants}</h2>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Store size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Network GMV</p>
              <h2 className="text-3xl font-bold text-slate-900">${mockStats.totalGMV.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Live Network Orders</p>
              <h2 className="text-3xl font-bold text-slate-900">{mockStats.activeOrders}</h2>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Onboarding Tool */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LinkIcon size={20} className="text-blue-600" />
            Client Onboarding
          </h2>
          <p className="text-sm text-slate-500 mb-6">Generate a secure, one-time registration link to email to a new restaurant owner.</p>

          <button
            onClick={handleGenerateLink}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl transition-colors shadow-sm"
          >
            Generate Setup Link
          </button>

          {inviteLink && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent outline-none text-slate-600 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
          )}
        </div>

        {/* Global Insights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Utensils size={20} className="text-purple-600" />
            Global Top Selling Items
          </h2>
          <div className="space-y-4">
            {mockStats.topItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg font-bold text-slate-400 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {item.sales} sold
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
