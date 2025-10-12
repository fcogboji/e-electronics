/**
 * Wishlist management API endpoints
 * Enterprise-grade implementation with caching, rate limiting, and error handling
 */

import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  withErrorHandling
} from '@/lib/api-response';
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handlePrismaError
} from '@/lib/errors';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitConfigs
} from '@/lib/rate-limit';
import {
  cache,
  CacheKeys,
  CacheTTL
} from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * GET /api/wishlist
 * Fetch user's wishlist with caching
 */
async function getHandler(req: NextRequest) {
  // Authentication
  const user = await currentUser();
  if (!user) {
    throw new AuthenticationError();
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req, user.id);
  checkRateLimit(identifier, RateLimitConfigs.read);

  // Try to get from cache, otherwise fetch from database
  const wishlist = await cache.getOrSet(
    CacheKeys.wishlist(user.id),
    async () => {
      return await prisma.wishlist.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              description: true,
              brand: true,
              category: true,
              discount: true,
              stock: true,
              avgRating: true,
              totalReviews: true,
              isLivePromo: true,
              isFeatured: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    CacheTTL.short
  );

  logger.info('Wishlist fetched', {
    userId: user.id,
    itemCount: wishlist.length
  });

  return successResponse(wishlist);
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
async function postHandler(req: NextRequest) {
  // Authentication
  const user = await currentUser();
  if (!user) {
    throw new AuthenticationError();
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req, user.id);
  checkRateLimit(identifier, RateLimitConfigs.wishlist);

  // Validate request body
  let body;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid request body');
  }

  const { productId } = body;

  if (!productId || typeof productId !== 'string') {
    throw new ValidationError('Valid product ID is required', {
      productId: 'Product ID must be a non-empty string'
    });
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if already in wishlist (using unique constraint)
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId: productId
      }
    });

    if (existingItem) {
      throw new ConflictError('Product already in your wishlist');
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId: productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            brand: true,
            category: true,
            discount: true,
            stock: true,
            avgRating: true,
            totalReviews: true,
          }
        }
      }
    });

    // Invalidate cache
    cache.invalidatePattern(`wishlist:${user.id}`);

    logger.info('Product added to wishlist', {
      userId: user.id,
      productId,
      productName: product.name
    });

    return createdResponse(
      wishlistItem,
      'Product added to wishlist successfully'
    );
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error.code && error.code.startsWith('P')) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
