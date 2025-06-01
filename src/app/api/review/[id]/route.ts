import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: Request, { params }: any) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { rating, comment } = body;

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review || review.userId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: { rating, comment },
  });

  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review || review.userId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  await prisma.review.delete({ where: { id: params.id } });

  return new Response('Review deleted');
}
