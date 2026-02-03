import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { notifyAdminsNewChatMessage } from '@/lib/notifications';

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to get authenticated user (optional for guests)
async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Check if any admin is online
async function isAdminOnline(): Promise<{ online: boolean; adminId?: string }> {
  const onlineAdmin = await prisma.adminChatStatus.findFirst({
    where: {
      isOnline: true,
      lastActiveAt: {
        gte: new Date(Date.now() - 60000), // Active in last 1 minute
      },
    },
    orderBy: { lastActiveAt: 'desc' },
  });

  return {
    online: !!onlineAdmin,
    adminId: onlineAdmin?.adminId,
  };
}

// Generate AI response using Gemini
async function generateAIResponse(userMessage: string, conversationHistory: any[]): Promise<string> {
  try {
    console.log('Generating AI response for message:', userMessage);
    // console.log('Using Gemini API Key:', process.env.GEMINI_API_KEY ? 'Key is set' : 'Key is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context about the business
    const businessContext = `You are a helpful customer service assistant for Godfirst Education and Tours, a company based in Ghana that provides:

1. Educational Services:
   - University admissions consulting
   - Study abroad programs (including Stipendium Hungaricum scholarship program to Hungary)
   - Scholarship application assistance
   - Educational consulting and guidance

2. Travel & Tours:
   - Flight bookings
   - Hotel reservations
   - Tour packages across Ghana and international destinations
   - Custom travel itineraries

3. Visa Assistance:
   - Visa application support
   - Documentation services
   - Visa processing for multiple countries

Contact Information:
- Location: Santa Maria, Jah-Love Junction, Accra, Ghana
- Phone: 0558735654 or 0537579919
- Email: info@godfirstedu.com
- Working Days: Monday to Saturday
- Working Hours: 8:00 AM - 6:00 PM (GMT)
- Sunday: Closed

Key Programs:
- Stipendium Hungaricum: A fully-funded scholarship program to study in Hungary covering tuition, accommodation, and stipend
- Various study abroad programs in multiple countries
- Educational tours and cultural exchange programs

Please provide helpful, friendly, and accurate responses about our services. If you don't have specific information, suggest that the customer contact us directly or an admin will respond shortly.`;

    // Build conversation history
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.sender === 'USER' ? 'Customer' : 'Assistant'}: ${msg.message}`)
      .join('\n');

    const prompt = `${businessContext}

Previous conversation:
${conversationContext}

Customer's current message: ${userMessage}

Please provide a helpful and professional response:`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    console.log('AI Response received:', aiText.substring(0, 100) + '...');
    return aiText;
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    console.error('Error details:', error.message || error);
    console.error('Error stack:', error.stack);
    return "Thank you for your message! Our team will get back to you shortly. For immediate assistance, please call us at 0558735654 or 0537579919, or email info@godfirstedu.com.";
  }
}

// GET - Fetch messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Conversation ID and message are required' },
        { status: 400 }
      );
    }

    // Verify conversation exists
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Determine sender type - only mark as ADMIN if explicitly from admin panel
    let sender: 'USER' | 'ADMIN' = 'USER';
    const { searchParams } = new URL(request.url);
    const isAdminSending = searchParams.get('adminSending') === 'true';

    if (user && isAdminSending) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';
      sender = isAdmin ? 'ADMIN' : 'USER';
    }

    // Create user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        sender,
        senderId: user?.id,
        message,
      },
    });

    // Update conversation
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        ...(sender === 'ADMIN' && { assignedAdminId: user?.id }),
      },
    });

    // If user message and not admin, always generate AI response
    let aiResponse = null;
    if (sender === 'USER') {
      const { online, adminId } = await isAdminOnline();

      // Always generate AI response for user messages
      const aiResponseText = await generateAIResponse(message, conversation.messages);

      aiResponse = await prisma.chatMessage.create({
        data: {
          conversationId,
          sender: 'AI',
          message: aiResponseText,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: 'gemini-2.5-flash',
            adminOnline: online,
          },
        },
      });

      // Update conversation status
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          isAdminOnline: online,
          assignedAdminId: online ? adminId : null,
          status: online ? 'PENDING_ADMIN' : 'ACTIVE',
        },
      });

      // Notify admins about new user message (non-blocking)
      const userName = conversation.visitorName || conversation.visitorEmail || 'User';
      notifyAdminsNewChatMessage(conversationId, userName, message).catch(error => {
        console.error('Error sending chat message notifications:', error);
      });
    }

    return NextResponse.json({
      userMessage,
      aiResponse,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
