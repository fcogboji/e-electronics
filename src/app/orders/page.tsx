'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import OrderTimeline from '@/components/OrderTimeline';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  trackingId?: string | null;
  shippingProvider?: string | null;
  deliveryEta?: string | null;
  orderItems: {
    product: { name: string };
    quantity: number;
    price: number;
    condition?: string;
    storage?: string;
    simType?: string;
    color?: string;
  }[];
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await res.json();
      console.log('✅ Fetched orders:', data);
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      cancellation_requested: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                  <p className="text-lg font-semibold mt-2">£{order.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Track Order Button */}
              <button
                onClick={() => toggleOrderExpand(order.id)}
                className="w-full mt-4 flex items-center justify-between px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-blue-700">Track Order Status</span>
                {expandedOrders.has(order.id) ? (
                  <ChevronUp className="w-5 h-5 text-blue-700" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-700" />
                )}
              </button>

              {/* Order Timeline (Expandable) */}
              {expandedOrders.has(order.id) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <OrderTimeline
                    status={order.status}
                    trackingId={order.trackingId}
                    shippingProvider={order.shippingProvider}
                    deliveryEta={order.deliveryEta}
                  />
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || 'Unknown product'}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: £{item.price.toFixed(2)}</p>
                          {item.condition && <p>Condition: {item.condition}</p>}
                          {item.storage && <p>Storage: {item.storage}</p>}
                          {item.simType && <p>SIM: {item.simType}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
