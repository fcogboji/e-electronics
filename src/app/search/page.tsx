// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Search, Filter, Grid, List, Star, ShoppingCart } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore(s => s.addToCart);

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?query=${encodeURIComponent(q)}`);
        const data = await res.json();
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [q]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl mb-4">{q ? `Results for "${q}"` : "All Products"}</h1>

      <div className="space-y-4">
        {filtered.length ? filtered.map(p => (
          <div key={p.id} className="flex items-center border rounded p-4">
            <img src={p.image} alt={p.name} className="w-24 h-24 object-cover mr-4" />
            <div className="flex-grow">
              <Link href={`/product/${p.id}`} className="font-semibold">{p.name}</Link>
              <p>{p.brand} • £{p.price.toLocaleString()}</p>
            </div>
            <button onClick={() => addToCart(p)} className="text-red-500">
              <ShoppingCart size={20} />
            </button>
          </div>
        )) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}