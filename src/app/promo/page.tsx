'use client'

import React from 'react'

type Product = {
  id: number
  name: string
  price: string
  discount: string
  imageUrl: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Fresh Organic Apples',
    price: '$5.99',
    discount: '20% OFF',
    imageUrl: '/images/famales.avif',
  },
  {
    id: 2,
    name: 'Natural Honey Jar',
    price: '$9.49',
    discount: '15% OFF',
    imageUrl: '/images/femaled.jpg',
  },
  {
    id: 3,
    name: 'Handmade Soap',
    price: '$3.50',
    discount: '30% OFF',
    imageUrl: '/images/blender.jpg',
  },
  {
    id: 4,
    name: 'Herbal Tea Mix',
    price: '$7.99',
    discount: '25% OFF',
    imageUrl: '/images/car-promo.jpg',
  },
]

export default function PromoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 p-8 text-white">
      {/* Blinking promo banner */}
      <h1 className="text-5xl font-extrabold text-center mb-12 animate-blink">
        🔥 FLASH SALE! LIMITED TIME OFFERS 🔥
      </h1>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative bg-white bg-opacity-10 rounded-xl p-6 shadow-lg transform transition-transform duration-700 hover:scale-105 hover:shadow-2xl animate-flash"
          >
            {/* Discount badge */}
            <div className="absolute top-3 right-3 bg-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {product.discount}
            </div>

            <img
              src={product.imageUrl}
              alt={product.name}
              className="mx-auto mb-4 w-32 h-32 object-contain rounded-lg shadow-md"
            />

            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-lg font-bold">{product.price}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
