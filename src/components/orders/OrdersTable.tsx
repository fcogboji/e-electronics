'use client';

import { Order } from '@/types';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  setSelectedOrder: (order: Order | null) => void;
  handleStatusUpdate: (orderId: string, newStatus: string) => void;
}

const statusOptions = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'cancellation_requested',
  'returned',
];

const OrdersTable = ({
  orders,
  loading,
  setSelectedOrder,
  handleStatusUpdate,
}: OrdersTableProps) => {
  if (loading) return <div className="p-4">Loading orders...</div>;
  if (!orders.length) return <div className="p-4">No orders found.</div>;

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div className="grid grid-cols-6 font-semibold text-sm text-gray-600 border-b py-2 px-4 bg-gray-100">
        <div className="truncate">Order ID</div>
        <div className="truncate">Customer</div>
        <div className="truncate">Amount</div>
        <div className="truncate">Status</div>
        <div className="truncate">Date</div>
        <div className="truncate">Actions</div>
      </div>

      {/* Rows */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="grid grid-cols-6 items-center border-b py-3 px-4 text-sm hover:bg-gray-50 transition"
        >
          <div className="truncate text-xs text-gray-700">{order.id}</div>
          <div className="truncate">{order.customerName || order.email || 'N/A'}</div>
          <div className="truncate font-medium text-gray-800">
            £{Number(order.amount).toFixed(2)}
          </div>
          <div>
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-gray-600">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div>
            <button
              onClick={() => setSelectedOrder(order)}
              className="text-blue-600 hover:underline text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersTable;
