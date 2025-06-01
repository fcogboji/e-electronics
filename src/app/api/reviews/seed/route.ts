// app/api/reviews/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const review = await prisma.review.create({
    data: {
      productId: 'cmatzzpza0000uiwcr5z2rt2b',
      userId: 'test_user_123', // Replace with a valid Clerk userId or mock
      rating: 5,
      comment: 'Superb quality, highly recommended!',
    },
  });

  return NextResponse.json({ success: true, review });
}
