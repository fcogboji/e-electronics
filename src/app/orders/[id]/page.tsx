'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order } from '@/types';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(); // initial load

    const interval = setInterval(() => {
      fetchOrder(); // re-fetch every 10 seconds
    }, 10000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <h1>Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      {/* render other order details */}
    </div>
  );
};

export default OrderDetailPage;
