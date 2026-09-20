import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, ChefHat, LogOut, Store, Users, User } from 'lucide-react';

export default function Layout() {
  // Grab the user's role from their passport
  const role = localStorage.getItem('role');

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
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20">

        {/* Brand Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Store size={20} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">QuickBite</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

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
        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Logged in as</p>
            <p className="text-sm font-bold text-slate-900 capitalize">{role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

      </aside>

      {/* MAIN PAGE CONTENT (This is where your pages inject themselves!) */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        <Outlet />
      </main>

    </div>
  );
}
