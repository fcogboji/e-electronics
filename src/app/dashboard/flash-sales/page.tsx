'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';

interface FlashSale {
  id: string;
  productId: string;
  name: string;
  price: string;
  oldPrice: string | null;
  discount: string | null;
  image: string;
  itemsLeft: number;
  totalItems: number;
  progress: number;
  active: boolean;
  endsAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  stock: number;
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    price: '',
    oldPrice: '',
    discount: '',
    image: '',
    itemsLeft: '',
    totalItems: '',
    endsAt: ''
  });

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const res = await fetch('/api/admin/flash-sales');
      const data = await res.json();
      setFlashSales(data);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProduct = products.find(p => p.id === e.target.value);
    if (selectedProduct) {
      setFormData({
        ...formData,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price.toLocaleString(),
        image: selectedProduct.image,
        itemsLeft: selectedProduct.stock.toString(),
        totalItems: selectedProduct.stock.toString()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const progress = Math.round(
      ((Number(formData.totalItems) - Number(formData.itemsLeft)) / Number(formData.totalItems)) * 100
    );

    try {
      if (editingId) {
        // Update existing flash sale
        const res = await fetch('/api/admin/flash-sales', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
            itemsLeft: Number(formData.itemsLeft),
            totalItems: Number(formData.totalItems),
            progress,
          })
        });

        if (res.ok) {
          setShowForm(false);
          setEditingId(null);
          resetForm();
          fetchFlashSales();
        }
      } else {
        // Create new flash sale
        const res = await fetch('/api/admin/flash-sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            itemsLeft: Number(formData.itemsLeft),
            totalItems: Number(formData.totalItems),
            progress,
            active: true
          })
        });

        if (res.ok) {
          setShowForm(false);
          resetForm();
          fetchFlashSales();
        }
      }
    } catch (error) {
      console.error('Error saving flash sale:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      price: '',
      oldPrice: '',
      discount: '',
      image: '',
      itemsLeft: '',
      totalItems: '',
      endsAt: ''
    });
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingId(sale.id);
    setFormData({
      productId: sale.productId,
      name: sale.name,
      price: sale.price,
      oldPrice: sale.oldPrice || '',
      discount: sale.discount || '',
      image: sale.image,
      itemsLeft: sale.itemsLeft.toString(),
      totalItems: sale.totalItems.toString(),
      endsAt: new Date(sale.endsAt).toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;

    try {
      const res = await fetch(`/api/admin/flash-sales?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchFlashSales();
      }
    } catch (error) {
      console.error('Error deleting flash sale:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flash Sales Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={20} />
          Add Flash Sale
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Flash Sale' : 'Add New Flash Sale'}
          </h2>
          {!editingId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Quick Start:</strong> Select a product from the dropdown below to automatically fill in all details including the product ID, name, price, and image. You can then adjust the flash sale price, discount, and end time.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Select Product</label>
              <select
                onChange={handleProductSelect}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value="">-- Select a product to auto-fill details --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₦{product.price.toLocaleString()} ({product.stock} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (₦)</label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="6,908"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Old Price (₦)</label>
              <input
                type="text"
                value={formData.oldPrice}
                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="7,500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount</label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="-7%"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Image URL (from /public/images/)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="/images/product.jpg"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.svg';
                    }}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Image path should start with /images/ (e.g., /images/s25ultrabanner.jpg)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Items Left</label>
              <input
                type="number"
                required
                value={formData.itemsLeft}
                onChange={(e) => setFormData({ ...formData, itemsLeft: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Items</label>
              <input
                type="number"
                required
                value={formData.totalItems}
                onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Ends At</label>
              <input
                type="datetime-local"
                required
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                <Save size={16} />
                {editingId ? 'Update Flash Sale' : 'Create Flash Sale'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Old Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Left</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ends At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flashSales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4">
                  <img
                    src={sale.image}
                    alt={sale.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.svg';
                    }}
                  />
                </td>
                <td className="px-6 py-4 text-sm">{sale.name}</td>
                <td className="px-6 py-4 text-sm">₦ {sale.price}</td>
                <td className="px-6 py-4 text-sm">{sale.oldPrice ? `₦ ${sale.oldPrice}` : '-'}</td>
                <td className="px-6 py-4 text-sm">{sale.discount || '-'}</td>
                <td className="px-6 py-4 text-sm">{sale.itemsLeft}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${sale.progress}%` }}
                      />
                    </div>
                    <span>{sale.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(sale.endsAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit flash sale"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete flash sale"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {flashSales.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No flash sales found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
