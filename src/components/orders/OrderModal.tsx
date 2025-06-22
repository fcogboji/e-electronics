// components/Orders/OrderModal.tsx
import React from 'react';

const OrderModal = ({
  order,
  onClose,
  onUpdate,
}: {
  order: any;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div>
          <p className="text-gray-700 mb-2">Customer: {order.customerName}</p>
          <p className="text-gray-700 mb-2">Status: {order.status}</p>
          <p className="text-gray-700 mb-2">Total: {order.total}</p>
          <p className="text-gray-700 mb-2">Created at: {order.createdAt}</p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              onUpdate();
              onClose();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
