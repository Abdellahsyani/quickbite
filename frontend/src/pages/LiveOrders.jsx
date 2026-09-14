import { Pause } from 'lucide-react';
import Card from '../components/Card';
import OrderCard from '../components/OrderCard';


const mockOrders = [
  {
    id: "104", table: "Table 7", time: "12:41 PM", elapsed: "3 min", status: "PENDING", total: "$28.50",
    items: [
      { name: "2x Double Cheeseburger", checked: false },
      { name: "1x Large Fries", checked: false },
      { name: "2x Coke Zero", checked: false }
    ]
  },
  {
    id: "102", table: "Table 11", time: "12:33 PM", elapsed: "11 min", status: "PREPARING", total: "$34.20",
    items: [
      { name: "3x Chicken Tenders", checked: true },
      { name: "2x Sweet Potato Fries", checked: false }
    ]
  },
  {
    id: "100", table: "Table 2", time: "12:18 PM", elapsed: "26 min", status: "COMPLETED", total: "$41.00",
    items: [
      { name: "2x Fish & Chips", checked: true },
      { name: "2x Lemonade", checked: true }
    ]
  }
];

// Filter our mock array into three separate lists
const pending = mockOrders.filter(o => o.status === 'PENDING');
const preparing = mockOrders.filter(o => o.status === 'PREPARING');
const completed = mockOrders.filter(o => o.status === 'COMPLETED');

export default function LiveOrders() {
  return (
    <div className="p-8">

      {/* --- HEADER SECTION (Unchanged) --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Live Orders <span className="text-gray-400 font-normal">/ KDS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            6 active orders • Last refreshed just now
          </p>
        </div>
        <div className="flex items-center gap-4">
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
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* 1. PENDING COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Column Header */}
          <div className="flex justify-between items-center px-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <h2 className="text-sm font-bold text-gray-500 tracking-wider">PENDING</h2>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">2</span>
          </div>

          {/* We will map Pending cards here */}
          {pending.map(order => (
            <OrderCard key={order.id} order={order} />
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
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">2</span>
          </div>


          {/* We will map Preparing cards here */}

          {preparing.map(order => (
            <OrderCard key={order.id} order={order} />
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
            <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">2</span>
          </div>

          {/* We will map Completed cards here */}

          {completed.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

      </div>
    </div>
  );
}
