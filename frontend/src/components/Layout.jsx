import { useEffect, useState } from 'react';
import api from '../api';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, ChefHat, LogOut, Store, Users } from 'lucide-react';

export default function Layout() {
  // Grab the user's role from their passport
  const role = localStorage.getItem('role');
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    if (!['admin', 'staff'].includes(role)) return;
    const controller = new AbortController();
    api.get('/auth/restaurant', { signal: controller.signal })
      .then(({ data }) => setRestaurantName(data.name))
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') console.error('Unable to load restaurant name', error);
      });
    return () => controller.abort();
  }, [role]);

  const brandName = ['admin', 'staff'].includes(role)
    ? restaurantName || 'Restaurant'
    : 'QuickBite';

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Shred the passport and kick them to the login screen
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Helper function to highlight the active tab
  const isActive = (path) => location.pathname === path;
  const linkStyles = (active) =>
    `flex shrink-0 items-center gap-3 whitespace-nowrap px-4 py-3 rounded-xl font-bold transition-all ${active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 lg:h-dvh lg:flex-row lg:overflow-hidden">

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full shrink-0 bg-white border-b border-slate-200 flex flex-col z-20 lg:w-64 lg:border-b-0 lg:border-r">

        {/* Brand Logo */}
        <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Store size={20} />
          </div>
          <span className="min-w-0 break-words text-xl font-black text-slate-900 tracking-tight">{brandName}</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:flex-1 lg:space-y-2 lg:overflow-y-auto lg:py-6">

          {/* 1. EVERYONE sees the Kitchen Board */}
          <Link to="/" className={linkStyles(isActive('/'))}>
            <ChefHat size={20} />
            Live Orders
          </Link>

          {/* 2. ONLY ADMINS see the Dashboard and Menu */}
          {role === 'admin' && (
            <>
              <Link to="/AdminDashboard" className={linkStyles(isActive('/AdminDashboard'))}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>

              <Link to="/menu" className={linkStyles(isActive('/menu'))}>
                <Utensils size={20} />
                Menu Management
              </Link>
              <Link to="/staff" className={linkStyles(isActive('/staff'))}>
                <Users size={20} />
                Manage staff
              </Link>
            </>
          )}

        </nav>

        {/* User Profile & Logout */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-100 lg:block lg:p-4">
          <div className="px-2 lg:mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Logged in as</p>
            <p className="text-sm font-bold text-slate-900 capitalize">{role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 lg:w-full text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

      </aside>

      {/* MAIN PAGE CONTENT (This is where your pages inject themselves!) */}
      <main className="min-w-0 flex-1 relative lg:min-h-0 lg:overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
