// next.config.ts
import { NextConfig } from 'next';

// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'www.mamasandpapas.com',
      'files.stripe.com',
      'res.cloudinary.com',
      'images.macrumors.com',
      'm.media-amazon.com', // ✅ Add this line
      "i5.walmartimages.com",
      "images.samsung.com" 
    ],
  },
};

module.exports = nextConfig;
