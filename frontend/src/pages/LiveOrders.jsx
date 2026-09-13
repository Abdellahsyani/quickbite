import Card from '../components/Card';

export default function LiveOrders() {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">

      {/* Calling the card for Order 1 */}
      <Card title="Order #104 - Table 3">
        <p className="font-semibold text-gray-800">2x Double Cheeseburger</p>
        <p className="font-semibold text-gray-800">1x Large Fries</p>
      </Card>

      {/* Calling the exact same component for Order 2 */}
      <Card title="Order #105 - Takeaway">
        <p className="font-semibold text-gray-800">1x Vegan Wrap</p>
        <p className="text-sm text-gray-500 mt-2">Notes: No mayo</p>
      </Card>

    </div>
  );
}
