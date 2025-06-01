// ✅ AdminDashboard.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DeleteButton from '@/components/DeleteButton';

export default async function AdminDashboard() {
  const user = await currentUser();

  if (user?.publicMetadata.role !== "admin") {
    redirect("/");
  }

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>

      <Link
        href="/dashboard/new"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Product
      </Link>

      <div className="mt-6 grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">{product.name}</h2>

            {product.discount ? (
              <>
                <p className="text-red-500 font-bold">
                  {product.discount}% OFF
                </p>
                <p className="line-through text-gray-500">
                  ₦{(product.price / 100).toFixed(2)}
                </p>
                <p className="text-green-600 font-bold">
                  ₦{(product.price * (1 - product.discount / 100) / 100).toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-black font-bold">
                ₦{(product.price / 100).toFixed(2)}
              </p>
            )}

            <p className="text-sm text-gray-600">
              Category: {product.category}
            </p>
            <p className="text-sm text-gray-600">
              Brand: {product.brand || 'N/A'}
            </p>

            <div className="flex gap-2">
              <form action={`/api/products/${product.id}`} method="POST">
                <input type="hidden" name="_method" value="DELETE" />
                <DeleteButton productId={product.id} />
              </form>

              <Link
                href={`/dashboard/edit/${product.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
