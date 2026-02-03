import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Save device token
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, deviceType, userAgent } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token already exists (globally, due to unique constraint)
    const existingToken = await prisma.device_tokens.findUnique({
      where: { token },
    });

    if (existingToken) {
      // If token exists for another user, update it to the current user
      // This handles the case where a user logs out and another logs in on the same device
      const updatedToken = await prisma.device_tokens.update({
        where: { token },
        data: {
          user_id: user.id,
          is_active: true,
          device_type: deviceType || existingToken.device_type,
          user_agent: userAgent || existingToken.user_agent,
          updated_at: new Date(),
        },
      });

      // console.log('='.repeat(80));
      // console.log(`📱 UPDATED FCM TOKEN for user: ${user.email} (ID: ${user.id})`);
      // console.log('='.repeat(80));
      // console.log(token);
      // console.log('='.repeat(80));

      return NextResponse.json(updatedToken);
    }

    // Create new token
    const deviceToken = await prisma.device_tokens.create({
      data: {
        user_id: user.id,
        token,
        device_type: deviceType || 'WEB',
        user_agent: userAgent || null,
        is_active: true,
        updated_at: new Date(),
      },
    });

    // console.log('='.repeat(80));
    // console.log(`📱 NEW FCM TOKEN for user: ${user.email} (ID: ${user.id})`);
    // console.log('='.repeat(80));
    // console.log(token);
    // console.log('='.repeat(80));
    // console.log('Copy this token to test in Firebase Console > Cloud Messaging > Send test message');
    // console.log('='.repeat(80));

    return NextResponse.json(deviceToken, { status: 201 });
  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json(
      { error: 'Failed to save device token' },
      { status: 500 }
    );
  }
}

// GET - Get all device tokens for current user
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await prisma.device_tokens.findMany({
      where: {
        user_id: user.id,
        is_active: true,
      },
      select: {
        id: true,
        device_type: true,
        user_agent: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device tokens' },
      { status: 500 }
    );
  }
}

// DELETE - Remove device token
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Deactivate the token (don't delete for audit trail)
    await prisma.device_tokens.updateMany({
      where: {
        user_id: user.id,
        token,
      },
      data: {
        is_active: false,
      },
    });

    console.log(`Deactivated device token for user ${user.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device token:', error);
    return NextResponse.json(
      { error: 'Failed to delete device token' },
      { status: 500 }
    );
  }
}
