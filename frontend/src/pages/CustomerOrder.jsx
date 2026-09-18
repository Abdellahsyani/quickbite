import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, Star, Flame, Leaf, Search, CheckCircle } from 'lucide-react';
import api from '../api';

export default function CustomerOrder() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  useEffect(() => {
    api.get('/menu').then(res => {
      setMenuItems(res.data.filter(item => item.isAvailable !== false));
    });
  }, []);

  const categories = ['All', 'Burgers', 'Sides', 'Drinks', 'Salads', 'Wraps', 'Desserts'];
  const filteredItems = menuItems.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }
      return [...prev, { ...item, qty: 1, notes: '' }];
    });
  };

  const updateQty = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + amount;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (orderType === 'dine_in' && !tableNumber) return alert("Please enter a table number!");

    const finalTableString = orderType === 'dine_in' ? `Table ${tableNumber}` : 'Takeout';
    const formattedItems = cart.map(item => ({
      menuItemId: item.id,
      quantity: item.qty
    }));

    try {
      const response = await api.post('/orders', {
        table: finalTableString,
        items: formattedItems
      });

      // Save the new order's ID so we can track it
      setPlacedOrderId(response.data.id);

      // Show popup, clear cart
      setShowSuccess(true);
      setCart([]);
      setTableNumber('');

    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.response?.data?.message || "Failed to send order.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa]">

      {/* LEFT: Premium Menu Browsing */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Place Order</h1>

          <div className="flex items-center justify-between gap-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No items found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart / Bucket Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag /> Current Order
          </h2>
        </div>

        <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
          <div className="flex bg-gray-200/60 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${orderType === 'dine_in' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType('takeout')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${orderType === 'takeout' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Takeout
            </button>
          </div>

          {orderType === 'dine_in' && (
            <input
              type="text"
              placeholder="Enter Table Number (e.g. 12)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-shadow"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ShoppingBag size={48} className="opacity-20 mb-2" />
              <p>Your bucket is empty</p>
              <p className="text-xs">Click "Add to Order" to add items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs font-mono text-gray-500">${(item.price * item.qty).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 shrink-0">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-600 transition-colors"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-600 transition-colors"><Plus size={14} /></button>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between mb-4 text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span className="font-mono">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-3.5 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-md shadow-blue-600/20"
          >
            Send Order to Kitchen
          </button>
        </div>
      </div>

      {/* SUCCESS POPUP CARD */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
          <div className="bg-white px-10 py-8 rounded-3xl shadow-2xl flex flex-col items-center transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-5 shadow-inner">
              <CheckCircle size={40} className="text-green-600" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Order Sent!</h2>
            <p className="text-gray-500 text-center font-medium mb-8">The kitchen is preparing your food.</p>

            {/* NEW TRACKING BUTTON */}
            <button
              onClick={() => navigate(`/track/${placedOrderId}`)}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Track Order Progress
            </button>

            {/* Start New Order Button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full mt-3 text-gray-500 font-medium hover:text-gray-800 transition-colors"
            >
              Start New Order
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

// --- MenuCard Component ---
function MenuCard({ item, onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[14px] border border-gray-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col group hover:shadow-md hover:border-blue-300 transition-all h-full">

      <div className="relative h-[200px] w-full bg-gray-100 shrink-0 border-b border-gray-100 rounded-t-[14px] overflow-hidden">
        {item.imageUrl ? (
          <img src={`http://localhost:3000${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-t-[14px]">No Image</div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-full shadow-sm border border-gray-100/50">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-[17px] font-bold leading-tight text-gray-900">{item.name}</h3>
          <span className="font-mono text-[17px] font-bold whitespace-nowrap text-gray-900">${Number(item.price).toFixed(2)}</span>
        </div>

        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 cursor-pointer group/desc relative"
        >
          <p className={`text-[14px] text-gray-500 leading-relaxed transition-all ${!isExpanded ? 'line-clamp-1' : ''}`}>
            {item.description || "No description available."}
          </p>
          {item.description && item.description.length > 35 && (
            <span className="text-[11px] text-blue-500 font-medium opacity-0 group-hover/desc:opacity-100 transition-opacity mt-1 inline-block">
              {isExpanded ? "Show less" : "Click to read more"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {item.category === 'Burgers' && (
            <span className="px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium bg-orange-50 text-orange-600 border-orange-200">
              <Star size={10} className="text-orange-500" /> popular
            </span>
          )}
          {item.name.toLowerCase().includes('bbq') && (
            <span className="px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium bg-red-50 text-red-600 border-red-200">
              <Flame size={10} className="text-red-500" /> spicy
            </span>
          )}
          {(item.category === 'Wraps' || item.category === 'Salads') && (
            <span className="px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium bg-green-50 text-green-700 border-green-200">
              <Leaf size={10} className="text-green-600" /> veg
            </span>
          )}
        </div>

        <div className="flex-1"></div>

        <button
          onClick={() => onAdd(item)}
          className="w-full py-2.5 mt-auto bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add to Order
        </button>
      </div>
    </div>
  );
}
