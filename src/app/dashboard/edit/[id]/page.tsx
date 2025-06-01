
// ✅ EditProductPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { getToken } = useAuth();

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

  useEffect(() => {
    const fetchProduct = async () => {
      const token = await getToken();
      const res = await fetch(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch product');
        return;
      }

      const data = await res.json();

      setForm({
        name: data.name || '',
        price: data.price?.toString() || '',
        image: data.image || '',
        description: data.description || '',
        category: data.category || '',
        stock: data.stock?.toString() || '0',
        discount: data.discount?.toString() || '',
        brand: data.brand || '',
      });
    };

    if (id) fetchProduct();
  }, [id, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
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

    if (res.ok) {
      router.push('/dashboard');
    } else {
      console.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    const token = await getToken();

    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      console.error('Failed to delete product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Product</h1>

      {['name', 'price', 'image', 'description', 'category'].map((field) => (
        <input
          key={field}
          type="text"
          placeholder={field}
          value={(form as any)[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="border p-2 w-full mb-4 rounded"
          required
        />
      ))}

      <input
        type="number"
        placeholder="Stock quantity"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
        className="border p-2 w-full mb-4 rounded"
        min={0}
        required
      />

      <input
        type="number"
        placeholder="Discount (%)"
        value={form.discount}
        onChange={(e) => setForm({ ...form, discount: e.target.value })}
        className="border p-2 w-full mb-4 rounded"
        min={0}
        max={100}
      />

      <input
        type="text"
        placeholder="Brand"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        className="border p-2 w-full mb-4 rounded"
        required
      />

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Update Product
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Delete Product
        </button>
      </div>
    </form>
  );
}
