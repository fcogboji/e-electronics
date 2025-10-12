/**
 * Enterprise-grade caching layer with LRU (Least Recently Used) eviction
 * In-memory cache for development, easily swappable with Redis for production
 */

import { logger } from './logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
  };

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;

    // Cleanup expired entries every 5 minutes
    if (typeof window === 'undefined') {
      setInterval(() => {
        this.cleanupExpired();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Update hit count for LRU
    entry.hits++;
    this.stats.hits++;

    logger.debug('Cache hit', { key, hits: entry.hits });

    return entry.value;
  }

  /**
   * Set value in cache with TTL (Time To Live)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
      hits: 0,
    });

    this.stats.sets++;
    this.stats.size = this.cache.size;

    logger.debug('Cache set', { key, ttlSeconds });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      logger.debug('Cache delete', { key });
    }

    return deleted;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const value = await fetchFn();

    // Store in cache
    this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0;

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.deletes += count;
    this.stats.size = this.cache.size;

    logger.info('Cache pattern invalidated', { pattern, count });

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      logger.debug('Cache cleanup', { cleaned });
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < lruHits) {
        lruHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      logger.debug('Cache LRU eviction', { key: lruKey, hits: lruHits });
    }
  }
}

// Singleton instance
const cache = new Cache(1000);

/**
 * Cache key builders for common patterns
 */
export const CacheKeys = {
  product: (id: string) => `product:${id}`,
  products: (page: number, limit: number, filter?: string) =>
    `products:${page}:${limit}:${filter || 'all'}`,
  productsByCategory: (category: string, page: number, limit: number) =>
    `products:category:${category}:${page}:${limit}`,
  user: (id: string) => `user:${id}`,
  order: (id: string) => `order:${id}`,
  orders: (userId: string, page: number, limit: number) =>
    `orders:user:${userId}:${page}:${limit}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  cart: (userId: string) => `cart:${userId}`,
  reviews: (productId: string) => `reviews:${productId}`,
  featuredProducts: () => 'products:featured',
  flashSales: () => 'flash-sales',
  categories: () => 'categories',
};

/**
 * Cache TTL configurations (in seconds)
 */
export const CacheTTL = {
  veryShort: 60, // 1 minute - for frequently changing data
  short: 5 * 60, // 5 minutes - for dynamic data
  medium: 15 * 60, // 15 minutes - for semi-static data
  long: 60 * 60, // 1 hour - for static data
  veryLong: 24 * 60 * 60, // 24 hours - for rarely changing data
};

// Export cache instance and methods
export { cache };

export const {
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  has: cacheHas,
  clear: cacheClear,
  getOrSet: cacheGetOrSet,
  invalidatePattern: cacheInvalidatePattern,
  getStats: cacheGetStats,
  getHitRate: cacheGetHitRate,
} = cache;
