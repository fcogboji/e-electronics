// components/admin-orders/DashboardHeader.tsx
'use client';

import { Filter, RefreshCw } from 'lucide-react';
import { FC } from 'react';

interface DashboardHeaderProps {
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  loading: boolean;
  onRefresh: () => void;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ showFilters, setShowFilters, loading, onRefresh }) => {
  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
