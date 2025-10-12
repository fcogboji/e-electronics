import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { sendNewChatMessageNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, subject, message } = await req.json();

    const conversation = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        orderId,
        subject: subject || 'General Inquiry',
        status: 'OPEN',
        priority: 'NORMAL',
        messages: {
          create: {
            senderId: user.id,
            senderType: 'USER',
            content: message,
            isRead: false
          }
        }
      },
      include: {
        messages: true
      }
    });

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    await sendNewChatMessageNotification({
      to: adminEmail,
      subject: subject || 'General Inquiry',
      customerMessage: message,
      conversationId: conversation.id
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}