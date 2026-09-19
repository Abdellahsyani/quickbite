import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LiveOrders from './pages/LiveOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerOrder from './pages/CustomerOrder';
import AdminDashboard from './pages/AdminDashboard';
import OrderTracker from './pages/OrderTracker'; // <-- Added this import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* --- 1. PUBLIC ROUTES (Anyone can access these) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order" element={<CustomerOrder />} />
        <Route path="/track/:id" element={<OrderTracker />} />

        {/* --- 2. STAFF LAYOUT (The shared sidebar/header) --- */}
        <Route path="/" element={<Layout />}>

          {/* KITCHEN STAFF & ADMIN: Both can see the Kanban Board */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'member']} />}>
            <Route index element={<LiveOrders />} />
          </Route>

          {/* ADMIN ONLY: Only the owner can see the Dashboard and Edit the Menu */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="menu" element={<Menu />} />
            <Route path="AdminDashboard" element={<AdminDashboard />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
