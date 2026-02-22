import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { sendChatResponseNotification } from '@/lib/email';
import { clerkClient } from '@clerk/nextjs/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }

    const { id: conversationId } = await params;

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Mark user messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: 'USER',
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!(await verifyAdmin()) || !user) {
      return unauthorizedResponse('Admin access required');
    }

    const { content, attachments } = await req.json();
    const { id: conversationId } = await params;

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        senderType: 'ADMIN',
        content,
        attachments,
        isRead: false
      }
    });

    // Update conversation
    const conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        status: 'IN_PROGRESS'
      }
    });

    // Send email notification to customer
    try {
      const client = await clerkClient();
      const customer = await client.users.getUser(conversation.userId);
      const customerEmail = customer.emailAddresses[0]?.emailAddress;

      if (customerEmail) {
        await sendChatResponseNotification({
          to: customerEmail,
          subject: conversation.subject,
          adminMessage: content,
          conversationId: conversation.id
        });
      }
    } catch (emailError) {
      console.error('Failed to send customer notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
