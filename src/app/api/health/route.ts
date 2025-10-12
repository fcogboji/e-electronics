/**
 * Health check endpoint for monitoring and load balancers
 * Returns application health status and metrics
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database health
    let dbHealthy = false;
    let dbError = null;

    try {
      dbHealthy = await checkDatabaseHealth();
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Database health check failed:', error);
    }

    // Get cache stats
    const cacheStats = cache.getStats();
    const cacheHitRate = cache.getHitRate();

    // Calculate uptime
    const uptime = process.uptime();

    // Memory usage
    const memoryUsage = process.memoryUsage();

    const health = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      checks: {
        database: {
          status: dbHealthy ? 'up' : 'down',
          responseTime: Date.now() - startTime,
          ...(dbError && { error: dbError }),
        },
        cache: {
          status: 'up',
          stats: {
            size: cacheStats.size,
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            hitRate: `${(cacheHitRate * 100).toFixed(2)}%`,
          },
        },
      },
      system: {
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        node: process.version,
      },
    };

    const statusCode = dbHealthy ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
