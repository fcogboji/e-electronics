// lib/orders.ts
import { Order } from '@/types';

export const fetchOrdersAPI = async (params: any): Promise<{ orders: Order[]; pagination: any }> => {
  const query = new URLSearchParams(params).toString();

  // ✅ Changed from `/api/orders` to `/api/admin/orders`
  const res = await fetch(`/api/admin/orders?${query}`);

  if (!res.ok) throw new Error('Failed to fetch admin orders');
  return res.json();
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Order update failed:', data);
    throw new Error(data.error || 'Failed to update order status');
  }

  return data;
};
