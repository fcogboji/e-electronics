// AdminDashboard.tsx
export const dynamic = 'force-dynamic';

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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Link
          href="/dashboard/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Product
        </Link>

        <Link
          href="/dashboard/categories"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-indigo-700 transition-colors"
        >
          Manage Categories
        </Link>

        <Link
          href="/dashboard/sponsored-products"
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded hover:from-amber-600 hover:to-orange-600 transition-colors"
        >
          Manage Sponsored Products
        </Link>

        <Link
          href="/dashboard/flash-sales"
          className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded hover:from-red-700 hover:to-rose-700 transition-colors"
        >
          Manage Flash Sales
        </Link>

        <Link
          href="/dashboard/carousels/live-promotions"
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded hover:from-red-600 hover:to-pink-600 transition-colors"
        >
          Manage Live Promotions
        </Link>

        <Link
          href="/dashboard/carousels/featured"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-blue-600 transition-colors"
        >
          Manage Featured/Trending
        </Link>

        <Link
          href="/dashboard/carousels/laptops"
          className="bg-gradient-to-r from-slate-700 to-gray-900 text-white px-4 py-2 rounded hover:from-slate-800 hover:to-black transition-colors"
        >
          Manage Laptops
        </Link>
      </div>

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
                  £{(product.price / 100).toFixed(2)}
                </p>
                <p className="text-green-600 font-bold">
                  £{(product.price * (1 - product.discount / 100) / 100).toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-black font-bold">
                £{(product.price / 100).toFixed(2)}
              </p>
            )}

            <p className="text-sm text-gray-600">
              Category: {product.category}
            </p>
            <p className="text-sm text-gray-600">
              Brand: {product.brand || 'N/A'}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {product.variants?.length || 0} variant(s)
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
