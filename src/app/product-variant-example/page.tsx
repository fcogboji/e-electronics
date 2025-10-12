'use client';

import { useState } from 'react';
import { ConditionSelector } from '@/components/product/ConditionSelector';
import { StorageSelector } from '@/components/product/StorageSelector';
import { SIMTypeSelector } from '@/components/product/SIMTypeSelector';
import { ColorSelector } from '@/components/product/ColorSelector';

export default function ProductVariantExample() {
  // State for selected options
  const [selectedCondition, setSelectedCondition] = useState('fair');
  const [selectedStorage, setSelectedStorage] = useState('128gb');
  const [selectedSIM, setSelectedSIM] = useState('physical-esim');
  const [selectedColor, setSelectedColor] = useState('blue');

  // Sample data - replace with your actual product data
  const conditions = [
    {
      id: 'fair',
      name: 'Fair',
      price: 273.0,
      features: ['Visible signs of use', 'Verified parts', 'Battery for daily use'],
      image: '/images/placeholder.svg',
    },
    {
      id: 'good',
      name: 'Good',
      price: 298.0,
      features: ['Light signs of use', 'Verified parts', 'Good battery life'],
      image: '/images/placeholder.svg',
    },
    {
      id: 'excellent',
      name: 'Excellent',
      price: 351.0,
      features: ['Minimal signs of use', 'Verified parts', 'Excellent battery'],
      image: '/images/placeholder.svg',
      badge: 'Popular',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 394.0,
      features: ['Like new', 'Verified parts', 'Perfect battery'],
      image: '/images/placeholder.svg',
    },
  ];

  const storageOptions = [
    { id: '128gb', size: '128 GB', price: 273.0 },
    { id: '256gb', size: '256 GB', price: 319.0 },
    { id: '512gb', size: '512 GB', price: 423.0 },
  ];

  const simOptions = [
    {
      id: 'esim',
      type: 'eSIM',
      description: '2 virtual SIM slots (no physical SIM slot)',
      price: 366.0,
    },
    {
      id: 'physical-esim',
      type: 'Physical SIM + eSIM',
      description: '1 physical SIM + 1 virtual SIM slot',
      price: 273.0,
    },
  ];

  const colorOptions = [
    {
      id: 'midnight',
      name: 'Midnight',
      price: 295.0,
      colorCode: '#182028',
      images: ['/images/placeholder.svg'],
    },
    {
      id: 'red',
      name: 'Red',
      price: 274.0,
      colorCode: '#FF0000',
      images: ['/images/placeholder.svg'],
    },
    {
      id: 'yellow',
      name: 'Yellow',
      price: 277.0,
      colorCode: '#FFFF00',
      images: ['/images/placeholder.svg'],
    },
    {
      id: 'blue',
      name: 'Blue',
      price: 273.0,
      colorCode: '#9CB0C4',
      images: ['/images/placeholder.svg'],
    },
    {
      id: 'purple',
      name: 'Purple',
      price: 284.0,
      colorCode: '#E6DAE6',
      images: ['/images/placeholder.svg'],
    },
    {
      id: 'starlight',
      name: 'Starlight',
      price: 349.0,
      colorCode: '#EEE9E5',
      images: ['/images/placeholder.svg'],
    },
  ];

  // Calculate total price based on selections
  const selectedConditionObj = conditions.find((c) => c.id === selectedCondition);
  const selectedStorageObj = storageOptions.find((s) => s.id === selectedStorage);
  const selectedSIMObj = simOptions.find((s) => s.id === selectedSIM);
  const selectedColorObj = colorOptions.find((c) => c.id === selectedColor);

  const totalPrice = [
    selectedConditionObj?.price || 0,
    selectedStorageObj?.price || 0,
    selectedSIMObj?.price || 0,
    selectedColorObj?.price || 0,
  ].reduce((a, b) => a + b, 0) / 4; // Average for demo purposes

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold mb-2">iPhone 14</h1>
          <p className="text-xl text-gray-600">Configure your device</p>
        </div>

        {/* Variant Selectors */}
        <div className="max-w-7xl mx-auto">
          <ConditionSelector
            conditions={conditions}
            selectedCondition={selectedCondition}
            onConditionChange={setSelectedCondition}
            productName="iPhone 14"
          />

          <StorageSelector
            options={storageOptions}
            selectedStorage={selectedStorage}
            onStorageChange={setSelectedStorage}
          />

          <SIMTypeSelector
            options={simOptions}
            selectedSIM={selectedSIM}
            onSIMChange={setSelectedSIM}
          />

          <ColorSelector
            options={colorOptions}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            productName="iPhone 14"
          />
        </div>

        {/* Summary & Add to Cart */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">£{totalPrice.toFixed(2)}</h3>
                <p className="text-sm text-gray-600">
                  {selectedConditionObj?.name} • {selectedStorageObj?.size} • {selectedSIMObj?.type} •{' '}
                  {selectedColorObj?.name}
                </p>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
