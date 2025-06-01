// Cancel Order: /src/app/cancel-order/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function CancelOrder() {
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    await axios.post("/api/cancel-order", { orderId });
    setMessage("Cancellation request submitted.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cancel an Order</h1>
      <input type="text" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="border p-2" />
      <button onClick={submit} className="ml-2 bg-red-500 text-white px-4 py-2">Submit</button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
