/**
 * Enterprise-grade Prisma Client with optimized connection pooling
 * Designed for production e-commerce workloads
 */

import { PrismaClient } from '@/generated/prisma';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log levels based on environment
const logConfig =
  env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'];

// Create Prisma Client with production-ready configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig as any,
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Optimize for serverless/edge environments
    errorFormat: 'minimal',
  });

// Prevent multiple instances during development hot reload
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('🔄 Closing database connections...');
  await prisma.$disconnect();
  console.log('✅ Database connections closed');
};

// Handle process termination signals
if (typeof window === 'undefined') {
  process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
  });
}

// Health check function with retry logic
export async function checkDatabaseHealth(): Promise<boolean> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      if (attempt > 1) {
        console.log(`✅ Database connection restored on attempt ${attempt}`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Database health check failed (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return false;
}

// Connection helper with automatic retry
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if it's a connection error
      const isConnectionError =
        error?.code === 'P1001' || // Can't reach database
        error?.code === 'P1017' || // Connection closed
        error?.message?.includes('Connection') ||
        error?.message?.includes('Closed');

      if (isConnectionError && attempt < maxRetries) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 3000);
        console.warn(`⚠️ Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}
