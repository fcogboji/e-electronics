// /src/app/admin/orders/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") redirect("/");

  // Fetch completed orders
  const orders = await prisma.order.findMany({
    where: {
      status: "completed"
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Customer Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No completed orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded">
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Amount:</strong> ₦{order.amount}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              {order.shippingAddress && (
                <p><strong>Address:</strong> {order.shippingAddress}, {order.city}, {order.state}</p>
              )}
              {order.orderItems.length > 0 && (
                <div className="mt-2">
                  <strong>Items:</strong>
                  <ul className="ml-4 list-disc">
                    {order.orderItems.map((item) => (
                      <li key={item.id}>
                        {item.product.name} (Qty: {item.quantity}) - ₦{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}