'use client';

import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

type OrderTimelineProps = {
  status: string;
  trackingId?: string | null;
  shippingProvider?: string | null;
  deliveryEta?: string | null;
};

export default function OrderTimeline({ status, trackingId, shippingProvider, deliveryEta }: OrderTimelineProps) {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const statusIndex = statuses.findIndex((s) => s.key === status);
  const isCancelled = status === 'cancelled' || status === 'cancellation_requested';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          <span className="font-semibold">
            {status === 'cancelled' ? 'Order Cancelled' : 'Cancellation Requested'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {statuses.map((statusItem, index) => {
          const isCompleted = index <= statusIndex;
          const isCurrent = index === statusIndex;
          const Icon = statusItem.icon;

          return (
            <div key={statusItem.key} className="flex items-center gap-4 relative">
              {/* Connector Line */}
              {index < statuses.length - 1 && (
                <div
                  className={`absolute left-5 top-12 w-0.5 h-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></div>
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {statusItem.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-blue-600 font-medium">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Info */}
      {(trackingId || shippingProvider || deliveryEta) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          {shippingProvider && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shipping Provider:</span>
              <span className="font-medium">{shippingProvider}</span>
            </div>
          )}
          {trackingId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tracking Number:</span>
              <code className="bg-white px-2 py-1 rounded text-sm font-mono">{trackingId}</code>
            </div>
          )}
          {deliveryEta && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {new Date(deliveryEta).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
