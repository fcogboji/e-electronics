/**
 * Standardized API response utilities
 * Consistent response format across all API endpoints
 */

import { NextResponse } from 'next/server';
import { AppError, sanitizeError } from './errors';
import { env } from './env';
import { logger } from './logger';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    fields?: Record<string, string>;
    stack?: string;
  };
  timestamp: string;
  path?: string;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  error: Error | AppError,
  path?: string
): NextResponse<ApiErrorResponse> {
  const isDevelopment = env.NODE_ENV === 'development';

  // Log the error
  logger.error('API Error', error, { path });

  const sanitized = sanitizeError(error, isDevelopment);
  const statusCode = sanitized.statusCode || 500;

  return NextResponse.json(
    {
      success: false,
      error: sanitized,
      timestamp: new Date().toISOString(),
      path,
    },
    { status: statusCode }
  );
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiSuccessResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}

/**
 * Handle async API route with error handling
 */
export function withErrorHandling<T = any>(
  handler: (...args: any[]) => Promise<NextResponse<T>>
) {
  return async (...args: any[]): Promise<NextResponse<T | ApiErrorResponse>> => {
    const req = args[0];
    const startTime = Date.now();
    const method = req.method;
    const path = new URL(req.url).pathname;

    try {
      logger.apiRequest(method, path);
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      logger.apiResponse(method, path, response.status, duration);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      logger.apiResponse(method, path, statusCode, duration);
      return errorResponse(error as Error, path);
    }
  };
}
