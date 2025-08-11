'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const { user, isSignedIn } = useUser();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchOrders = async () => {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    };

    fetchOrders();
  }, [isSignedIn]);

  if (!isSignedIn) return <div className="p-6">Please sign in</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(orders, null, 2)}</pre>
    </div>
  );
}
