// app/(admin)/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/orders/DashboardHeader';
import FiltersPanel from '@/components/orders/FiltersPanel';
import StatsCards from '@/components/orders/StatsCards';
import OrdersTable from '@/components/orders/OrdersTable';
import PaginationControls from '@/components/orders/PaginationControls';
import OrderModal from '@/components/orders/OrderModal';

import { fetchOrdersAPI, updateOrderStatus } from '@/lib/orders';
import { Order, PaginationData } from '@/types';

const AdminOrdersDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [pagination, setPagination] = useState<PaginationData>({ total: 0, totalPages: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (params?: any) => {
    setLoading(true);
    try {
      const { orders, pagination } = await fetchOrdersAPI({
        page: currentPage,
        status: statusFilter,
        search: searchTerm,
        ...dateRange,
        ...params,
      });
      setOrders(orders);
      setPagination(pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm, dateRange]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    fetchOrders();
  };

  const handleOrderUpdate = () => fetchOrders();

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        loading={loading}
        onRefresh={() => fetchOrders()}
      />
      <div className="p-6">
        <FiltersPanel
          showFilters={showFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          clearFilters={clearFilters}
        />
        <StatsCards orders={orders} pagination={pagination} />
        <OrdersTable
          orders={orders}
          loading={loading}
          setSelectedOrder={setSelectedOrder}
          handleStatusUpdate={handleStatusUpdate}
        />
        <PaginationControls
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagination={pagination}
        />
      </div>
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleOrderUpdate} />
      )}
    </div>
  );
};

export default AdminOrdersDashboard;
