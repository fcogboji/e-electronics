/**
 * Enterprise-grade error handling
 * Custom error classes for different types of application errors
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class PaymentError extends AppError {
  constructor(message: string, public paymentDetails?: Record<string, any>) {
    super(message, 402, 'PAYMENT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR', false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    public service: string,
    public originalError?: Error
  ) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', false);
  }
}

/**
 * Check if error is an operational error (expected, like validation errors)
 * vs programming errors (unexpected, like null reference errors)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert Prisma errors to AppErrors
 */
export function handlePrismaError(error: any): AppError {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    case 'P2002':
      return new ConflictError('A record with this value already exists');
    case 'P2025':
      return new NotFoundError('Record not found');
    case 'P2024':
      return new DatabaseError('Connection timeout. Please try again.', error);
    case 'P2034':
      return new DatabaseError('Transaction failed. Please try again.', error);
    default:
      return new DatabaseError('A database error occurred', error);
  }
}

/**
 * Sanitize error for client response
 * Never expose sensitive details or stack traces to client
 */
export function sanitizeError(error: Error, isDevelopment: boolean = false) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(error instanceof ValidationError && { fields: error.fields }),
    };
  }

  // Don't expose internal errors in production
  if (!isDevelopment) {
    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }

  // In development, show error message but never stack (logs only)
  return {
    message: error.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}
