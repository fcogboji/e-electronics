// app/api/reviews/count/[productId]/route.ts

import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  const { productId } = params;

  const count = await prisma.review.count({
    where: { productId },
  });

  return NextResponse.json({ count });
}
