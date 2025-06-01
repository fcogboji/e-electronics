// --- WISHLIST ---
// File: /src/app/wishlist/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";


export default async function WishlistPage() {
  const user = await currentUser();
  if (!user) return <div className="p-6">Please sign in.</div>;

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: { product: true },
  });
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      {wishlist.length === 0 ? <p>Your wishlist is empty.</p> : (
        <ul className="space-y-4">
          {wishlist.map(item => (
            <li key={item.id} className="border p-4 rounded">
              <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
