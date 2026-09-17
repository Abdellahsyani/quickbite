import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LiveOrders from './pages/LiveOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerOrder from './pages/CustomerOrder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES (Anyone can access these) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES (Must have a token to enter) */}
        <Route element={<ProtectedRoute />}> {/* <-- 2. Wrap the Layout */}

          <Route path="/" element={<Layout />}>
            <Route index element={<LiveOrders />} />
            <Route path="menu" element={<Menu />} />
            <Route path="/order" element={<CustomerOrder />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
