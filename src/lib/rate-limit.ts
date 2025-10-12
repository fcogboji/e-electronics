/**
 * Enterprise-grade rate limiting
 * Memory-based rate limiter with sliding window algorithm
 * For production with high traffic, consider Redis-based rate limiting
 */

import { RateLimitError } from './errors';
import { logger } from './logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 60 seconds
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  check(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record for this window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        identifier,
        count: record.count,
        maxRequests: config.maxRequests,
      });
      return false;
    }

    record.count++;
    return true;
  }

  reset(identifier: string) {
    this.requests.delete(identifier);
  }

  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - record.count);
  }

  getResetTime(identifier: string): number | null {
    const record = this.requests.get(identifier);
    return record ? record.resetTime : null;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoint types
 */
export const RateLimitConfigs = {
  // Strict rate limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  },

  // Moderate rate limit for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please try again later.',
  },

  // Stricter rate limit for payment endpoints
  payment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'Too many payment requests. Please try again later.',
  },

  // Moderate rate limit for write operations (user-facing features)
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many write operations. Please slow down.',
  },

  // Lenient rate limit for wishlist operations
  wishlist: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many wishlist operations. Please slow down.',
  },

  // Lenient rate limit for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests. Please try again later.',
  },
} as const;

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers (proxy-aware)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfIp = req.headers.get('cf-connecting-ip'); // Cloudflare

  const ip = forwarded?.split(',')[0] || realIp || cfIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RateLimitConfigs.api
): void {
  const allowed = rateLimiter.check(identifier, config);

  if (!allowed) {
    const message = config.message || 'Too many requests. Please try again later.';
    throw new RateLimitError(message);
  }
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(
  identifier: string,
  config: RateLimitConfig = RateLimitConfigs.api
): number {
  return rateLimiter.getRemainingRequests(identifier, config);
}

/**
 * Reset rate limit for an identifier (useful for testing or admin overrides)
 */
export function resetRateLimit(identifier: string): void {
  rateLimiter.reset(identifier);
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  identifier: string,
  config: RateLimitConfig = RateLimitConfigs.api
): void {
  const remaining = rateLimiter.getRemainingRequests(identifier, config);
  const resetTime = rateLimiter.getResetTime(identifier);

  headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());

  if (resetTime) {
    const resetSeconds = Math.ceil(resetTime / 1000);
    headers.set('X-RateLimit-Reset', resetSeconds.toString());
  }
}
