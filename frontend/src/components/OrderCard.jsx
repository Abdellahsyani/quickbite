import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function OrderCard({ order, onMove, onClear }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Timer logic for the "X min" badge
  useEffect(() => {
    if (order.status === 'COMPLETED') return;

    const orderTime = new Date(order.createdAt).getTime();
    const calculateTime = () => {
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - orderTime) / 1000);
      setElapsedMinutes(Math.floor(diffInSeconds / 60));
    };

    calculateTime();
    const intervalId = setInterval(calculateTime, 10000); // Update every 10s
    return () => clearInterval(intervalId);
  }, [order.createdAt, order.status]);

  const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isLate = order.status !== 'COMPLETED' && elapsedMinutes >= 10;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex flex-col">

      {/* 1. Header (Exactly matching the image) */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 text-base">#{order.id}</span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 font-medium text-xs rounded-full">
            {order.table}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
            <Clock size={14} /> {timeStr}
          </span>
          <span className={`px-2.5 py-1 rounded-full font-bold text-xs transition-colors ${order.status === 'COMPLETED'
            ? 'text-emerald-700 bg-emerald-50'
            : isLate
              ? 'text-red-600 bg-red-50 animate-pulse'
              : 'text-orange-500 bg-orange-50'
            }`}>
            {order.status === 'COMPLETED' ? 'Done' : `${elapsedMinutes} min`}
          </span>
        </div>
      </div>

      {/* 2. Checklist Items (Matches image styling + functional strikethrough) */}
      <div className="flex flex-col gap-3 py-4">
        {order.items.map((item) => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
            {/* The 'peer' class allows the text to react when this is checked! */}
            <input
              type="checkbox"
              className="peer mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
            />
            <div className="flex flex-col">
              {/* peer-checked styles apply the line-through when the box is clicked */}
              <span className="text-[15px] font-medium text-slate-700 peer-checked:line-through peer-checked:text-slate-300 transition-all">
                {item.quantity}&times; {item.menuItem?.name || 'Unknown Item'}
              </span>
              {item.notes && (
                <span className="text-xs text-red-400 font-medium mt-0.5 peer-checked:opacity-40 transition-opacity">
                  Note: {item.notes}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* 3. Total Price */}
      <div className="flex justify-between items-center mt-1 mb-4">
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Total</span>
        <span className="font-bold text-gray-900 text-base">${Number(order.totalPrice).toFixed(2)}</span>
      </div>

      {/* 4. Action Buttons (Styled explicitly like the image) */}
      <div className="flex gap-3 w-full mt-auto">
        {order.status === 'PENDING' && (
          <>
            <button
              onClick={() => onMove(order.id, 'PREPARING')}
              className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors active:scale-[0.98]"
            >
              Start Preparing
            </button>
          </>
        )}

        {order.status === 'PREPARING' && (
          <button
            onClick={() => onMove(order.id, 'COMPLETED')}
            className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors active:scale-[0.98]"
          >
            Mark Ready
          </button>
        )}

        {order.status === 'COMPLETED' && (
          <button
            onClick={() => onClear(order.id)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm transition-colors active:scale-[0.98]"
          >
            Clear from Screen
          </button>
        )}
      </div>

    </div>
  );
}
