'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ productId }: { productId: string }) {
  const { getToken } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    const token = await getToken();

    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      router.refresh(); // Reload page or re-fetch data
    } else {
      console.error('Delete failed');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Delete
    </button>
  );
}
