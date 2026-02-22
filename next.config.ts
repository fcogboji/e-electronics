import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Show ESLint warnings during builds but don't fail the build
    // TODO: Fix all ESLint errors and set this to false for strict mode
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Fail builds on TypeScript errors
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.mamasandpapas.com',
      },
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.macrumors.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.com',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'ee.co.uk',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client'],
  // Security headers for production
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS - only enable in production
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
        ],
      },
    ];
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
