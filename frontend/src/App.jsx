import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LiveOrders from './pages/LiveOrders'; // <-- 1. Imported here

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* 2. Linked here! */}
          <Route index element={<LiveOrders />} />

          {/* We will leave this one alone until we build the Menu page later */}
          <Route path="menu" element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Menu Manager</h1>
            </div>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
