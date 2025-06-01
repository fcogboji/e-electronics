import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkMiddleware } from '@clerk/nextjs/server';

// =============================================================================
// Rate Limiting Logic for POST /api/reviews (simple in-memory example)
// =============================================================================

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;              // 5 requests per minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return false;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return true;
  }

  rateLimitMap.set(userId, {
    count: userLimit.count + 1,
    timestamp: userLimit.timestamp,
  });

  return false;
}

// =============================================================================
// Custom Middleware Wrapper to Inject Rate Limiting
// =============================================================================

export const middleware = clerkMiddleware(
  async (authContext, request: NextRequest) => {
    if (
      request.method === 'POST' &&
      request.nextUrl.pathname.startsWith('/api/reviews')
    ) {
      const { userId } = await authContext(); // ✅ correct

      if (userId && isRateLimited(userId)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.next();
  }
);




// =============================================================================
// Matcher Configuration
// =============================================================================

export const config = {
  matcher: [
    // Static and internal exclusions
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    '/(api|trpc)(.*)',

    // Optional: explicitly match review API
    '/api/reviews/:path*',
  ],
};
