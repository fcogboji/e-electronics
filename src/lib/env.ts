/**
 * Environment variables validation and type-safe configuration
 * Enterprise-grade environment management for production applications
 */

function validateEnvVar(name: string, value: string | undefined, required = true): string {
  if (!value && required) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
      `Please add this to your .env file. See .env.example for reference.`
    );
  }
  return value || '';
}

// During build time, use placeholder values
const isBuildTime = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build';

export const env = {
  // Database Configuration
  DATABASE_URL: isBuildTime ? 'postgresql://placeholder' : validateEnvVar('DATABASE_URL', process.env.DATABASE_URL),
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,

  // Clerk Authentication
  CLERK_SECRET_KEY: isBuildTime ? 'sk_placeholder' : validateEnvVar('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: isBuildTime ? 'pk_placeholder' : validateEnvVar(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',

  // Paystack Payment Gateway
  PAYSTACK_SECRET_KEY: isBuildTime ? 'sk_test_placeholder' : validateEnvVar('PAYSTACK_SECRET_KEY', process.env.PAYSTACK_SECRET_KEY),
  PAYSTACK_WEBHOOK_SECRET: isBuildTime ? 'whsec_placeholder' : validateEnvVar('PAYSTACK_WEBHOOK_SECRET', process.env.PAYSTACK_WEBHOOK_SECRET),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: isBuildTime ? 'pk_test_placeholder' : validateEnvVar(
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  ),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_ADMIN_ID: process.env.NEXT_PUBLIC_ADMIN_ID || '',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Email Service
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // Feature Flags
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING === 'true',
  ENABLE_CACHING: process.env.ENABLE_CACHING === 'true',
  ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true',
} as const;

export type Env = typeof env;

// Validate critical environment variables on startup
if (!isBuildTime && env.NODE_ENV !== 'test') {
  console.log('✅ Environment variables validated successfully');
}