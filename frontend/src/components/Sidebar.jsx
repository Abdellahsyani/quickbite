import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Updated to include the blue dot for the active state
  const navClass = ({ isActive }) =>
    `flex items-center justify-between p-3 rounded-lg transition-colors group ${isActive ? 'bg-[#1e3a8a] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-[#111827] text-white h-screen flex flex-col">

      {/* 1. Brand Header (Updated with Burger and Subtitle) */}
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🍔</span> QuickBite
        </h1>
        <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">KITCHEN DISPLAY</p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/" className={navClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} />
                <span className="font-medium">Live Orders</span>
              </div>
              {/* The little blue active dot */}
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
            </>
          )}
        </NavLink>
        <NavLink to="/menu" className={navClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <UtensilsCrossed size={20} />
                <span className="font-medium">Menu Catalog</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
            </>
          )}
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
            </>
          )}
        </NavLink>
      </nav>

      {/* 3. Footer Area */}
      <div className="p-4 flex flex-col gap-4">

        {/* The "System Live" Pill */}
        <div className="flex items-center gap-2 bg-[#064e3b] text-[#34d399] px-3 py-1.5 rounded-lg w-fit">
          <div className="w-2 h-2 rounded-full bg-[#34d399]"></div>
          <span className="text-xs font-bold tracking-wide">System Live</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
            AS
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-200">Abdellah Syani</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
        </div>

        {/* Sign out (Updated styling to match design) */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:text-white transition-colors text-sm w-fit"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
