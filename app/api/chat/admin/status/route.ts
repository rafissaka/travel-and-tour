import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// GET - Get admin online status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get or create admin status
    let status = await prisma.adminChatStatus.findUnique({
      where: { adminId: user.id },
    });

    if (!status) {
      status = await prisma.adminChatStatus.create({
        data: {
          adminId: user.id,
          isOnline: false,
          autoRespond: true,
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching admin status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin status' },
      { status: 500 }
    );
  }
}

// POST - Update admin online status
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { isOnline, autoRespond } = body;

    // Update or create admin status
    const status = await prisma.adminChatStatus.upsert({
      where: { adminId: user.id },
      update: {
        isOnline: isOnline !== undefined ? isOnline : undefined,
        autoRespond: autoRespond !== undefined ? autoRespond : undefined,
        lastActiveAt: new Date(),
      },
      create: {
        adminId: user.id,
        isOnline: isOnline ?? false,
        autoRespond: autoRespond ?? true,
      },
    });

    // If going online, update conversations
    if (isOnline) {
      await prisma.chatConversation.updateMany({
        where: {
          status: 'ACTIVE',
          assignedAdminId: null,
        },
        data: {
          assignedAdminId: user.id,
          isAdminOnline: true,
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { error: 'Failed to update admin status' },
      { status: 500 }
    );
  }
}

// PATCH - Heartbeat to keep admin online
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update last active time
    await prisma.adminChatStatus.update({
      where: { adminId: user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}
