"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }[];
}

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing'];

export default function CancelOrder() {
  const { user, isLoaded } = useUser();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<'search' | 'form' | 'success'>('search');

  const searchOrder = async () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setSearching(true);
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
      setOrder(data.order);

      if (!CANCELLABLE_STATUSES.includes(data.order.status.toLowerCase())) {
        setError(`Order cannot be cancelled. Current status: ${data.order.status}`);
        return;
      }

      setStep('form');
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const submitCancellation = async () => {
    if (!reason.trim()) {
      setError("Please select a reason for cancellation");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          details,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit cancellation request');
        return;
      }

      setStep('success');
      setMessage("Your cancellation request has been submitted successfully. You will receive an email confirmation shortly.");
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('search');
    setOrderId("");
    setOrder(null);
    setReason("");
    setDetails("");
    setError("");
    setMessage("");
  };

  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h1>
          <p className="text-gray-600">Please sign in to cancel your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancel Order</h1>
        <p className="text-gray-600">Request cancellation for your order if it hasn't been shipped yet</p>
      </div>

      {step === 'search' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Find Your Order</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                placeholder="Enter your order ID (e.g., clxxxxxx...)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={searchOrder}
              disabled={searching}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {searching ? 'Searching...' : 'Find Order'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Cancellation Policy</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Orders can only be cancelled if they are in "pending", "confirmed", or "processing" status.
                  Once shipped, orders cannot be cancelled but can be returned after delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'form' && order && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <div className="flex items-center gap-4 mb-4">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Items in this order:</h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">£{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>£{order.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Cancellation Request</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="found_better_price">Found a better price elsewhere</option>
                  <option value="ordered_by_mistake">Ordered by mistake</option>
                  <option value="delivery_too_slow">Delivery taking too long</option>
                  <option value="financial_reasons">Financial reasons</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please provide any additional details about your cancellation request..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('search')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={submitCancellation}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Cancellation Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Your cancellation request for Order #{orderId} has been submitted.
              Our team will review it and process your refund if approved.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Another Order
              </button>
              <a
                href="/orders"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Orders
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
