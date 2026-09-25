import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Clock, Utensils, ArrowUpRight } from 'lucide-react';
import api from '../api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- ANALYTICS CALCULATIONS ---
  // 1. Basic Metrics
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'ARCHIVED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING');

  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;

  // 2. Calculate Top Selling Items
  const itemCounts = {};
  completedOrders.forEach(order => {
    order.items?.forEach(item => {
      const name = item.menuItem?.name || 'Unknown Item';
      if (!itemCounts[name]) {
        itemCounts[name] = { name, quantity: 0, revenue: 0 };
      }
      itemCounts[name].quantity += item.quantity;
      itemCounts[name].revenue += item.quantity * Number(item.price || 0); // Assuming price is on the item or we just show quantity
    });
  });

  // Convert to array and sort by quantity sold
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // Top 5 items

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
        <p className="text-slate-500 mt-1">Track your restaurant's performance and sales.</p>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h2 className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Completed Orders</p>
              <h2 className="text-3xl font-bold text-slate-900">{completedOrders.length}</h2>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Order Value</p>
              <h2 className="text-3xl font-bold text-slate-900">${averageOrderValue.toFixed(2)}</h2>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Kitchen</p>
              <h2 className="text-3xl font-bold text-slate-900">{pendingOrders.length}</h2>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">Recent Transactions</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Time</th>
                  <th className="p-4 font-bold">Table</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 7).map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">#{order.id}</td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{order.table}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 text-right">
                      ${Number(order.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Utensils size={20} className="text-slate-400" /> Top Selling Items
            </h3>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-5">
            {topItems.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No completed orders yet.</p>
            ) : (
              topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                      <p className="text-sm text-slate-500">{item.quantity} orders</p>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-bold flex items-center gap-1">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
