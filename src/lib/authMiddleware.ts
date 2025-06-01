// src/lib/authMiddleware.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function authMiddleware(req: NextRequest): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}
