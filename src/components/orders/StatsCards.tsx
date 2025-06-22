import React from 'react';
import type { Order } from '@/types';

interface StatsCardsProps {
  orders: Order[];
  pagination: {
    total: number;
    totalPages: number;
    limit: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ orders, pagination }) => {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const processing = orders.filter((o) => o.status === 'processing').length;
  const shipped = orders.filter((o) => o.status === 'shipped').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;
  const returned = orders.filter((o) => o.status === 'returned').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Total Orders</h4>
        <p className="text-xl font-semibold text-gray-900">
          {pagination?.total || 0}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Pending</h4>
        <p className="text-xl font-semibold text-yellow-600">{pending}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Processing</h4>
        <p className="text-xl font-semibold text-orange-500">{processing}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Shipped</h4>
        <p className="text-xl font-semibold text-blue-600">{shipped}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Delivered</h4>
        <p className="text-xl font-semibold text-green-600">{delivered}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Cancelled</h4>
        <p className="text-xl font-semibold text-red-600">{cancelled}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h4 className="text-sm text-gray-500">Returned</h4>
        <p className="text-xl font-semibold text-purple-600">{returned}</p>
      </div>
    </div>
  );
};

export default StatsCards;
