import { useState, useEffect } from 'react';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import api from '../api';

export default function CustomerOrder() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  // Order Details State
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' or 'takeout'
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    // Fetch only available items for the customer
    api.get('/menu').then(res => {
      setMenuItems(res.data.filter(item => item.isAvailable !== false));
    });
  }, []);

  // --- CART LOGIC ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        // Increase qty if already in cart
        return prev.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }
      // Add new item to cart with qty 1
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

  // --- SUBMIT ORDER ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (orderType === 'dine_in' && !tableNumber) return alert("Please enter a table number!");

    const finalTableString = orderType === 'dine_in' ? `Table ${tableNumber}` : 'Takeout';

    // Format the cart exactly how your backend expects it!
    const formattedItems = cart.map(item => ({
      menuItemId: item.id,
      quantity: item.qty
    }));

    try {
      // Send the request to your existing endpoint
      await api.post('/orders', {
        table: finalTableString,
        items: formattedItems
      });

      alert("Order sent to the kitchen!");
      setCart([]);
      setTableNumber('');
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.response?.data?.message || "Failed to send order.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* LEFT: Menu Browsing */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Place Order</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors flex gap-4">
              {item.imageUrl && (
                <img src={`http://localhost:3000${item.imageUrl}`} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              )}
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                <span className="text-gray-500 text-sm mt-1">${item.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart / Bucket Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag /> Current Order
          </h2>
        </div>

        {/* Dining Options */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${orderType === 'dine_in' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType('takeout')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${orderType === 'takeout' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
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
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">Your bucket is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center gap-2">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">${(item.price * item.qty).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded text-gray-600"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded text-gray-600"><Plus size={14} /></button>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between mb-4 text-lg font-bold">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Send to Kitchen
          </button>
        </div>
      </div>

    </div>
  );
}
