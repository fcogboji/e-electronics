// src/lib/authMiddleware.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export async function authMiddleware(req: NextRequest): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Verify that the current user is authenticated
 * Returns the userId if authenticated, null otherwise
 */
export async function verifyAuth(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Verify that the current user is an admin
 * Returns true if admin, false otherwise
 */
export async function verifyAdmin(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId && userId === ADMIN_ID;
}

/**
 * Helper to create an unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Higher-order function to protect admin routes
 * Usage: export const GET = withAdminAuth(async (req) => { ... });
 */
export function withAdminAuth<T extends NextRequest>(
  handler: (req: T) => Promise<NextResponse>
) {
  return async (req: T): Promise<NextResponse> => {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return unauthorizedResponse('Admin access required');
    }
    return handler(req);
  };
}
