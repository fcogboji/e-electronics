import React from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const FiltersPanel = ({
  showFilters,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  clearFilters,
}: {
  showFilters: boolean;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (value: { start: string; end: string }) => void;
  clearFilters: () => void;
}) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by customer or order ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg p-2 w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg p-2 w-full md:w-1/4"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="border rounded-lg p-2 w-full md:w-1/6"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="border rounded-lg p-2 w-full md:w-1/6"
        />
        <button
          onClick={clearFilters}
          className="ml-auto bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel;