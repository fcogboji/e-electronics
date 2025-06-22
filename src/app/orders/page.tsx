'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  orderItems: {
    product: { name: string };
    quantity: number;
    price: number;
  }[];
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await res.json();
      console.log('✅ Fetched orders:', data);
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.warn('⚠️ Response is not an array:', data);
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) fetchOrders();
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && user) {
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, user]);

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4">
              <p><strong>ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Total:</strong> £{order.amount.toLocaleString()}</p>

              <ul className="mt-2 pl-4 list-disc text-sm">
              {order.orderItems.map((item, index) => (
                <li key={index}>
                  {item.product?.name || 'Unknown product'} × {item.quantity} — £{item.price.toLocaleString()}
                </li>
              ))}
            </ul>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
