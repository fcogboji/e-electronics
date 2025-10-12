"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Package, RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

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
      id: string;
      name: string;
      image: string;
    };
  }[];
}

interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  details?: string;
  status: string;
  refundAmount?: number;
  createdAt: string;
  returnItems: {
    id: string;
    quantity: number;
    reason: string;
    condition?: string;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
}

const RETURNABLE_STATUSES = ['delivered', 'completed'];

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'processing':
      return <Package className="w-5 h-5 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ReturnsRefunds() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'policy' | 'create' | 'history'>('policy');
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnItems, setReturnItems] = useState<{[key: string]: {quantity: number, reason: string, condition: string}}>({});
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders();
      fetchReturns();
    }
  }, [isLoaded, user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const returnableOrders = data.filter(order =>
          RETURNABLE_STATUSES.includes(order.status.toLowerCase())
        );
        setOrders(returnableOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/returns');
      const data = await response.json();
      if (Array.isArray(data)) {
        setReturns(data);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
    }
  };

  const handleItemSelection = (itemId: string, field: string, value: string | number) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const submitReturn = async () => {
    if (!selectedOrder || !returnReason.trim()) {
      setError("Please select a reason for return");
      return;
    }

    const selectedItems = Object.entries(returnItems)
      .filter(([_, item]) => item.quantity > 0)
      .map(([itemId, item]) => ({
        productId: selectedOrder.orderItems.find(oi => oi.id === itemId)?.product.id,
        quantity: item.quantity,
        reason: item.reason || returnReason,
        condition: item.condition
      }));

    if (selectedItems.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          reason: returnReason,
          details: returnDetails,
          items: selectedItems
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit return request');
        return;
      }

      setSuccess("Return request submitted successfully!");
      setSelectedOrder(null);
      setReturnItems({});
      setReturnReason("");
      setReturnDetails("");
      fetchReturns();
      setActiveTab('history');
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user && activeTab !== 'policy') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h1>
          <p className="text-gray-600">Please sign in to manage your returns and refunds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
        <p className="text-gray-600">Manage your return requests and view our return policy</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('policy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policy'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Return Policy
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Request Return
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Return History
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Policy Tab */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Return & Refund Policy</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Return Eligibility</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  Items must be returned within 30 days of delivery
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  Items must be in original condition and packaging
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  All accessories and documentation must be included
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  Items must not show signs of damage or excessive wear
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Return Process</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Request Return</h4>
                  <p className="text-sm text-gray-600">Submit your return request with reason and item details</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Return Approval</h4>
                  <p className="text-sm text-gray-600">We review your request and provide return instructions</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Refund Processing</h4>
                  <p className="text-sm text-gray-600">Refund processed within 5-7 business days after we receive your return</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Non-Returnable Items</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  Personalized or customized items
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  Software products (once opened)
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  Items damaged by misuse or normal wear
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  Items returned after 30-day period
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Create Return Tab */}
      {activeTab === 'create' && user && (
        <div className="space-y-6">
          {!selectedOrder ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Select Order to Return</h2>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Orders</h3>
                  <p className="text-gray-600">You don't have any delivered orders eligible for return.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            Delivered on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{order.amount.toFixed(2)}</p>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.orderItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="text-sm text-gray-600">{item.product.name}</span>
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.orderItems.length - 2} more items
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Return Items from Order #{selectedOrder.id}</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Orders
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Select items to return:</h3>
                    <div className="space-y-4">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-600">
                                Ordered quantity: {item.quantity} | Price: £{item.price.toFixed(2)}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Return Quantity
                                  </label>
                                  <select
                                    value={returnItems[item.id]?.quantity || 0}
                                    onChange={(e) => handleItemSelection(item.id, 'quantity', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                  >
                                    <option value={0}>Don't return</option>
                                    {Array.from({ length: item.quantity }, (_, i) => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </select>
                                </div>

                                {returnItems[item.id]?.quantity > 0 && (
                                  <>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason
                                      </label>
                                      <select
                                        value={returnItems[item.id]?.reason || ''}
                                        onChange={(e) => handleItemSelection(item.id, 'reason', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                      >
                                        <option value="">Select reason</option>
                                        <option value="defective">Defective/Damaged</option>
                                        <option value="wrong_item">Wrong item received</option>
                                        <option value="not_as_described">Not as described</option>
                                        <option value="changed_mind">Changed my mind</option>
                                        <option value="size_fit">Size/Fit issues</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Condition
                                      </label>
                                      <select
                                        value={returnItems[item.id]?.condition || ''}
                                        onChange={(e) => handleItemSelection(item.id, 'condition', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                      >
                                        <option value="">Select condition</option>
                                        <option value="new">Like new (unopened)</option>
                                        <option value="excellent">Excellent (lightly used)</option>
                                        <option value="good">Good (used, working)</option>
                                        <option value="damaged">Damaged/Defective</option>
                                      </select>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Return Reason *
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    >
                      <option value="">Select primary reason</option>
                      <option value="defective">Product defective or damaged</option>
                      <option value="wrong_item">Wrong item received</option>
                      <option value="not_as_described">Item not as described</option>
                      <option value="quality_issues">Quality not as expected</option>
                      <option value="changed_mind">Changed my mind</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      placeholder="Provide any additional details about your return..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700">{success}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitReturn}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {loading ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Return History Tab */}
      {activeTab === 'history' && user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Return History</h2>

          {returns.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Return Requests</h3>
              <p className="text-gray-600">You haven't submitted any return requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnRequest) => (
                <div key={returnRequest.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(returnRequest.status)}
                      <div>
                        <h3 className="font-medium">Return Request #{returnRequest.id}</h3>
                        <p className="text-sm text-gray-600">
                          Order #{returnRequest.orderId} • {new Date(returnRequest.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnRequest.status)}`}>
                      {returnRequest.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Return Details</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Reason:</span> {returnRequest.reason}
                      </p>
                      {returnRequest.details && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Details:</span> {returnRequest.details}
                        </p>
                      )}
                      {returnRequest.refundAmount && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Refund Amount:</span> £{returnRequest.refundAmount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Returned Items</h4>
                      <div className="space-y-1">
                        {returnRequest.returnItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="text-sm text-gray-600">
                              {item.product.name} (Qty: {item.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}