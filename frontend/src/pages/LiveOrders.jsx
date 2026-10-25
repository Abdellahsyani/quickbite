import { Pause } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api, { serverURL } from '../api';

export default function LiveOrders() {
  // Renamed to setOrders (plural) to match the array
  const [orders, setOrders] = useState([]);

  // 1. Fetch function extracted so we can reuse it
  const fetchOrders = () => {
    api.get('/orders')
      .then(response => {
        setOrders(response.data);
      }).catch(error => {
        console.log("Failed to fetch orders", error);
      });
  };

  // Refresh on each connection to recover orders missed while disconnected.
  useEffect(() => {
    const socket = io(serverURL, {
      auth: { token: localStorage.getItem('token') },
    });
    fetchOrders();
    const refreshTimer = setInterval(fetchOrders, 5000);
    socket.on('connect', fetchOrders);
    socket.on('connect_error', (error) => {
      console.error('Kitchen connection failed:', error.message);
    });
    socket.on("new_order", (newOrder) => {
      setOrders(prevOrders => prevOrders.some(order => order.id === newOrder.id)
        ? prevOrders
        : [newOrder, ...prevOrders]);
    })

    socket.on("order_updated", (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order => order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order)
      );
    });

    return () => {
      clearInterval(refreshTimer);
      socket.disconnect();
    };
  }, []);

  // 3. The function that physically moves the cards instantly
  const handleMove = async (orderId, newStatus) => {
    // Optimistic UI Update: Move it on screen immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Tell the database
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchOrders(); // Revert screen if database fails
    }
  };

  // 4. Clear completed orders from the screen
  const handleClear = async (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    try {
      await api.delete(`/orders/${orderId}`);
    } catch (error) {
      console.error("Failed to clear order:", error);
      fetchOrders();
    }
  };

  const pending = orders.filter(o => o.status === 'PENDING');
  const preparing = orders.filter(o => o.status === 'PREPARING');
  const completed = orders.filter(o => o.status === 'COMPLETED');

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* --- HEADER SECTION (Unchanged) --- */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Live Orders <span className="text-gray-400 font-normal">/ KDS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} active orders • Last refreshed just now
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">
            Accepting Orders
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Pause size={16} />
            Pause New Orders
          </button>
        </div>
      </div>

      {/* --- KANBAN BOARD SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

        {/* 1. PENDING COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Column Header */}
          <div className="flex justify-between items-center px-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <h2 className="text-sm font-bold text-gray-500 tracking-wider">PENDING</h2>
            </div>
            {/* FIXED: Dynamic counter instead of hardcoded 2 */}
            <span className="px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">
              {pending.length}
            </span>
          </div>

          {/* Mapped Pending cards with onMove props */}
          {pending.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onMove={handleMove}
              onClear={handleClear}
            />
          ))}
        </div>

        {/* 2. PREPARING COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Column Header */}
          <div className="flex justify-between items-center px-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h2 className="text-sm font-bold text-gray-500 tracking-wider">PREPARING</h2>
            </div>
            {/* FIXED: Dynamic counter */}
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
              {preparing.length}
            </span>
          </div>

          {/* Mapped Preparing cards with onMove props */}
          {preparing.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onMove={handleMove}
              onClear={handleClear}
            />
          ))}
        </div>

        {/* 3. COMPLETED COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Column Header */}
          <div className="flex justify-between items-center px-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h2 className="text-sm font-bold text-gray-500 tracking-wider">COMPLETED</h2>
            </div>
            {/* FIXED: Dynamic counter */}
            <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
              {completed.length}
            </span>
          </div>

          {/* Mapped Completed cards with onClear props */}
          {completed.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onMove={handleMove}
              onClear={handleClear}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
