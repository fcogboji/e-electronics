// components/Orders/OrderModal.tsx
import React from 'react';

const OrderModal = ({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <p className="text-gray-700"><strong>Customer:</strong> {order.customerName}</p>
            <p className="text-gray-700"><strong>Status:</strong> {order.status}</p>
            <p className="text-gray-700"><strong>Total:</strong> £{Number(order.total).toFixed(2)}</p>
            <p className="text-gray-700"><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            {order.email && <p className="text-gray-700"><strong>Email:</strong> {order.email}</p>}
            {order.phone && <p className="text-gray-700"><strong>Phone:</strong> {order.phone}</p>}
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: £{Number(item.price).toFixed(2)}</p>
                        {item.condition && <p>Condition: {item.condition}</p>}
                        {item.storage && <p>Storage: {item.storage}</p>}
                        {item.simType && <p>SIM: {item.simType}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
              <div className="text-gray-700 space-y-1">
                <p>{order.shippingAddress}</p>
                {order.city && <p>{order.city}, {order.state} {order.postalCode}</p>}
                {order.country && <p>{order.country}</p>}
                {order.trackingId && <p><strong>Tracking:</strong> {order.trackingId}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
