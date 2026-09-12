import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* Left: The fixed Sidebar */}
      <Sidebar />
      
      {/* Right: The dynamic page content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet /> 
      </main>
    </div>
  );
}
