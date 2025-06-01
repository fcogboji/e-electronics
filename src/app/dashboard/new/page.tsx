// ✅ AddProductPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

const categories = [
  'Appliances', 'Phones & Tablets', 'Health & Beauty', 'Home & Office', 'Electronics',
  'Fashion', 'Supermarket', 'Computing', 'Baby Products', 'Gaming', 'Musical Instruments', 'Other categorie'
];

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    stock: '',
    discount: '',
    brand: '',
  });

  const [error, setError] = useState('');
  const router = useRouter();
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.image || !form.description || !form.category || !form.stock || !form.brand) {
      setError('All fields are required');
      return;
    }

    const token = await getToken();

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: parseInt(form.price),
        stock: parseInt(form.stock),
        discount: form.discount ? parseInt(form.discount) : 0,
      }),
    });

    if (!res.ok) {
      setError('Failed to add product');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4 bg-white rounded shadow">
      <h1 className="text-xl mb-2 font-semibold">Add New Product</h1>

      {error && <p className="text-red-500">{error}</p>}

      <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 w-full" required />
      <input type="number" placeholder="Price (₦)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border p-2 w-full" required />
      <input type="text" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="border p-2 w-full" required />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border p-2 w-full" required />
      <input type="number" placeholder="Stock Quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border p-2 w-full" min={0} required />
      <input type="number" placeholder="Discount (%)" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="border p-2 w-full" min={0} max={100} />
      <input type="text" placeholder="Brand (e.g. Samsung)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border p-2 w-full" required />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border p-2 w-full" required>
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <button className="bg-green-600 text-white px-4 py-2 rounded">Add Product</button>
    </form>
  );
}
