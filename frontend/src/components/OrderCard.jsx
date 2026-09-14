import { Clock } from 'lucide-react';

export default function OrderCard({ order }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4">

      {/* 1. Header (ID, Table, Time) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">#{order.id}</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-200">
            {order.table}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400 flex items-center gap-1"><Clock size={12} /> {order.time}</span>
          <span className={`px-2 py-1 rounded-md font-bold ${order.status === 'COMPLETED' ? 'text-green-700 bg-green-50' : 'text-orange-500 bg-orange-50'
            }`}>
            {order.elapsed}
          </span>
        </div>
      </div>

      {/* 2. Checklist Items */}
      <div className="flex flex-col gap-3 py-2">
        {order.items.map((item, index) => (
          <label key={index} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked={item.checked}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.name}
            </span>
          </label>
        ))}
      </div>

      {/* 3. Total Price */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-400 tracking-wider">TOTAL</span>
        <span className="font-bold text-gray-900">{order.total}</span>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex gap-2">
        {order.status === 'PENDING' && (
          <>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Start Preparing</button>
            <button className="px-4 py-2 text-red-500 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">Cancel</button>
          </>
        )}
        {order.status === 'PREPARING' && (
          <>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Mark Completed</button>
            <button className="px-4 py-2 text-red-500 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">Cancel</button>
          </>
        )}
        {order.status === 'COMPLETED' && (
          <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-medium py-2 rounded-lg text-sm transition-colors">Archive</button>
        )}
      </div>

    </div>
  );
}
