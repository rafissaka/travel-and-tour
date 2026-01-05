import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// Helper function to get authenticated user (optional for guests)
async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET - Fetch conversations (admin: all conversations, user: their conversations)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    let conversations;

    if (isAdmin) {
      // Admins see all conversations
      conversations = await prisma.chatConversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  sender: { not: 'ADMIN' },
                },
              },
            },
          },
        },
      });
    } else {
      // Users see only their conversations
      conversations = await prisma.chatConversation.findMany({
        where: { userId: user.id },
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  sender: { in: ['ADMIN', 'AI'] },
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const body = await request.json();
    const { message, visitorName, visitorEmail } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // For guests, require name and email
    if (!user && (!visitorName || !visitorEmail)) {
      return NextResponse.json(
        { error: 'Name and email are required for guests' },
        { status: 400 }
      );
    }

    // Create conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: user?.id,
        visitorName: visitorName,
        visitorEmail: visitorEmail,
        lastMessageAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Create first user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        senderId: user?.id,
        message,
      },
    });

    // Trigger AI response by calling the messages endpoint
    try {
      const messagesResponse = await fetch(`${request.nextUrl.origin}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message,
        }),
      });

      if (!messagesResponse.ok) {
        console.error('Failed to generate AI response for new conversation');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
