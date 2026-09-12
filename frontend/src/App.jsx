import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* This shows up when you click "Live Orders" */}
          <Route index element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Live Orders Board</h1>
            </div>
          } />
          
          {/* This shows up when you click "Menu Catalog" */}
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
