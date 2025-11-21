import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      console.error('Login error:', authError);

      // Check for email confirmation error
      if (authError.message?.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email before logging in. Check your inbox for the verification link.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    // Check if email is confirmed in user metadata
    if (!authData.user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          requiresVerification: true
        },
        { status: 403 }
      );
    }

    // Update login tracking in database
    try {
      await prisma.user.update({
        where: { id: authData.user.id },
        data: {
          lastLoginAt: new Date(),
          loginCount: {
            increment: 1,
          },
        },
      });
    } catch (dbError) {
      console.error('Error updating login tracking:', dbError);
      // Don't fail the login if tracking update fails
    }

    return NextResponse.json({
      message: 'Login successful',
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    });

  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
