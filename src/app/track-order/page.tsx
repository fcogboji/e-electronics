"use client";

import { useState } from "react";
import { Package, Truck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  customerName?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  shippingProvider?: string;
  trackingId?: string;
  deliveryEta?: string;
  orderItems: OrderItem[];
}

interface StatusHistoryItem {
  id: string;
  oldStatus?: string;
  newStatus: string;
  changedBy?: string;
  notes?: string;
  createdAt: string;
}

interface TrackingData {
  order: Order;
  statusHistory: StatusHistoryItem[];
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'confirmed':
    case 'processing':
      return <Package className="w-5 h-5 text-blue-500" />;
    case 'shipped':
      return <Truck className="w-5 h-5 text-purple-500" />;
    case 'delivered':
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'cancelled':
    case 'cancellation_requested':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'cancellation_requested':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}/status`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Order not found. Please check your order ID.");
        } else {
          setError("Failed to fetch order details. Please try again.");
        }
        return;
      }

      const data = await response.json();

      // Validate response structure
      if (!data.order || !data.statusHistory) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      setTrackingData(data);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      track();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-600">Enter your order ID to get real-time updates on your package</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Order ID (e.g., clxxxxxx...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={track}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {trackingData && trackingData.order && trackingData.statusHistory && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order #{trackingData.order.id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.order.status)}`}>
                {trackingData.order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Total Amount:</span> £{trackingData.order.amount.toFixed(2)}</p>
                  <p><span className="font-medium">Order Date:</span> {new Date(trackingData.order.createdAt).toLocaleDateString()}</p>
                  {trackingData.order.deliveryEta && (
                    <p><span className="font-medium">Expected Delivery:</span> {new Date(trackingData.order.deliveryEta).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {trackingData.order.shippingAddress && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{trackingData.order.customerName}</p>
                    <p>{trackingData.order.shippingAddress}</p>
                    <p>{trackingData.order.city}, {trackingData.order.state} {trackingData.order.postalCode}</p>
                    <p>{trackingData.order.country}</p>
                  </div>
                </div>
              )}
            </div>

            {trackingData.order.trackingId && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Tracking Information</span>
                </div>
                <div className="mt-2 text-sm">
                  <p><span className="font-medium">Carrier:</span> {trackingData.order.shippingProvider}</p>
                  <p><span className="font-medium">Tracking ID:</span> {trackingData.order.trackingId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {trackingData.order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {trackingData.statusHistory.map((history) => (
                <div key={history.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(history.newStatus)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {history.newStatus.replace('_', ' ').toUpperCase()}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}