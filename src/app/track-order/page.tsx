// Track Order: /src/app/track-order/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);

  const track = async () => {
    const res = await axios.get(`/api/order-status?id=${orderId}`);
    setOrder(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>
      <input type="text" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="border p-2" />
      <button onClick={track} className="ml-2 bg-blue-500 text-white px-4 py-2">Track</button>
      {order && (
        <div className="mt-4">
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}