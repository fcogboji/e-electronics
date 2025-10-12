'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

type Variant = {
  id?: string;
  condition: string;
  storage: string;
  simType: string;
  color: string;
  stock: number;
  priceAdjustment: number;
  isAvailable: boolean;
};

const CONDITIONS = ['Fair', 'Good', 'Excellent', 'Premium'];
const STORAGES = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'];
const SIM_TYPES = ['eSIM', 'Physical SIM + eSIM'];
const COLORS = [
  'Black', 'White', 'Grey', 'Silver', 'Blue', 'Red',
  'Green', 'Purple', 'Pink', 'Yellow', 'Gold', 'Rose Gold'
];

type VariantManagerProps = {
  productId?: string;
  onVariantsChange?: (variants: Variant[]) => void;
  initialVariants?: Variant[];
};

export default function VariantManager({
  productId,
  onVariantsChange,
  initialVariants = []
}: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [newVariant, setNewVariant] = useState<Variant>({
    condition: 'Good',
    storage: '128 GB',
    simType: 'eSIM',
    color: 'Black',
    stock: 0,
    priceAdjustment: 0,
    isAvailable: true,
  });

  // Fetch existing variants if productId is provided
  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  // Notify parent component of changes
  useEffect(() => {
    if (onVariantsChange) {
      onVariantsChange(variants);
    }
  }, [variants, onVariantsChange]);

  const fetchVariants = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/variants`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const addVariant = async () => {
    // Check if variant already exists
    const exists = variants.some(v =>
      v.condition === newVariant.condition &&
      v.storage === newVariant.storage &&
      v.simType === newVariant.simType &&
      v.color === newVariant.color
    );

    if (exists) {
      toast.error('This variant combination already exists!');
      return;
    }

    if (productId) {
      // Product exists - save to database
      try {
        const res = await fetch(`/api/products/${productId}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVariant),
        });

        if (res.ok) {
          const savedVariant = await res.json();
          setVariants([...variants, savedVariant]);
          toast.success('Variant added successfully!');
          resetNewVariant();
        } else {
          toast.error('Failed to add variant');
        }
      } catch (error) {
        console.error('Error adding variant:', error);
        toast.error('Error adding variant');
      }
    } else {
      // Product doesn't exist yet - just add to local state
      setVariants([...variants, { ...newVariant }]);
      toast.success('Variant added!');
      resetNewVariant();
    }
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];

    if (variant.id && productId) {
      // Delete from database
      try {
        const res = await fetch(`/api/products/variants/${variant.id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setVariants(variants.filter((_, i) => i !== index));
          toast.success('Variant deleted!');
        } else {
          toast.error('Failed to delete variant');
        }
      } catch (error) {
        console.error('Error deleting variant:', error);
        toast.error('Error deleting variant');
      }
    } else {
      // Just remove from local state
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = async (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };

    if (updatedVariants[index].id && productId) {
      // Update in database
      try {
        const res = await fetch(`/api/products/variants/${updatedVariants[index].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedVariants[index]),
        });

        if (res.ok) {
          setVariants(updatedVariants);
          toast.success('Variant updated!');
        } else {
          toast.error('Failed to update variant');
        }
      } catch (error) {
        console.error('Error updating variant:', error);
        toast.error('Error updating variant');
      }
    } else {
      // Just update local state
      setVariants(updatedVariants);
    }
  };

  const resetNewVariant = () => {
    setNewVariant({
      condition: 'Good',
      storage: '128 GB',
      simType: 'eSIM',
      color: 'Black',
      stock: 0,
      priceAdjustment: 0,
      isAvailable: true,
    });
  };

  const formatPrice = (priceInKobo: number) => {
    return `₦${(priceInKobo / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add different variations of this product (e.g., different colors, storage sizes, conditions)
        </p>

        {/* Add New Variant Form */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-sm text-gray-700">Add New Variant</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                value={newVariant.condition}
                onChange={(e) => setNewVariant({ ...newVariant, condition: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage
              </label>
              <select
                value={newVariant.storage}
                onChange={(e) => setNewVariant({ ...newVariant, storage: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {STORAGES.map((storage) => (
                  <option key={storage} value={storage}>{storage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIM Type
              </label>
              <select
                value={newVariant.simType}
                onChange={(e) => setNewVariant({ ...newVariant, simType: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SIM_TYPES.map((simType) => (
                  <option key={simType} value={simType}>{simType}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                value={newVariant.color}
                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newVariant.stock}
                onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Adjustment (₦)
              </label>
              <input
                type="number"
                step="0.01"
                value={newVariant.priceAdjustment / 100}
                onChange={(e) => setNewVariant({
                  ...newVariant,
                  priceAdjustment: Math.round(parseFloat(e.target.value || '0') * 100)
                })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Extra charge for this variant</p>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newVariant.isAvailable}
                  onChange={(e) => setNewVariant({ ...newVariant, isAvailable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Available</span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addVariant}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Variants List */}
      {variants.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Existing Variants ({variants.length})</h4>
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={variant.id || index} className="bg-white border rounded-lg p-4 flex items-center gap-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
                  <div>
                    <span className="text-xs text-gray-500">Condition</span>
                    <p className="font-medium">{variant.condition}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Storage</span>
                    <p className="font-medium">{variant.storage}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">SIM Type</span>
                    <p className="font-medium text-sm">{variant.simType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Color</span>
                    <p className="font-medium">{variant.color}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      className="w-20 p-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Price Adj.</span>
                    <p className="font-medium text-sm">{formatPrice(variant.priceAdjustment)}</p>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={variant.isAvailable}
                        onChange={(e) => updateVariant(index, 'isAvailable', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete variant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
