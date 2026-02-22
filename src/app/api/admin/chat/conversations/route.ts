import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }

    const conversations = await prisma.chatConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { status: 'asc' }, // OPEN first
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
