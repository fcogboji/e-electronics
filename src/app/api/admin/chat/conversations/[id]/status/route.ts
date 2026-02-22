import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!(await verifyAdmin()) || !user) {
      return unauthorizedResponse('Admin access required');
    }

    const { status } = await req.json();
    const { id: conversationId } = await params;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status,
        updatedAt: new Date(),
        assignedTo: status === 'IN_PROGRESS' ? user.id : undefined
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
