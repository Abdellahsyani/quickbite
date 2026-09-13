import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">

      {/* 1. Brand Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🍔 QuickBite
        </h1>
      </div>

      {/* 2. Navigation Links (flex-1 pushes the footer down) */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={20} />
          Live Orders
        </NavLink>
        <NavLink to="/menu" className={navClass}>
          <UtensilsCrossed size={20} />
          Menu Catalog
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>

      {/* 3. User Profile Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            A
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-200">Abdellah Syani</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </aside>
  );
}
