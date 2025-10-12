/**
 * Wishlist item management API endpoint
 * Enterprise-grade implementation with proper error handling, logging, and validation
 */

import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  withErrorHandling
} from '@/lib/api-response';
import {
  AuthenticationError,
  NotFoundError,
  AuthorizationError,
  handlePrismaError
} from '@/lib/errors';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitConfigs
} from '@/lib/rate-limit';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

async function deleteHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authentication
  const user = await currentUser();
  if (!user) {
    throw new AuthenticationError();
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req, user.id);
  checkRateLimit(identifier, RateLimitConfigs.wishlist);

  const { id: wishlistId } = await params;

  try {
    // Validate wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
      select: { id: true, userId: true, productId: true }
    });

    if (!wishlistItem) {
      throw new NotFoundError('Wishlist item not found');
    }

    if (wishlistItem.userId !== user.id) {
      throw new AuthorizationError('You do not have permission to delete this item');
    }

    // Delete the wishlist item
    await prisma.wishlist.delete({
      where: { id: wishlistId }
    });

    // Invalidate cache
    cache.invalidatePattern(`wishlist:${user.id}`);

    logger.info('Wishlist item deleted', {
      userId: user.id,
      wishlistId,
      productId: wishlistItem.productId
    });

    return successResponse(
      { id: wishlistId },
      'Item removed from wishlist successfully'
    );
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error.code && error.code.startsWith('P')) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export const DELETE = withErrorHandling(deleteHandler);