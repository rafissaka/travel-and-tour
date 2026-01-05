import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUrl = `${siteUrl}/auth/reset-password`;

    console.log('Sending password reset email to:', email.toLowerCase());
    console.log('Redirect URL:', redirectUrl);

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('Supabase forgot password error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // Don't reveal if email exists or not (security best practice)
      // But still log the actual error for debugging
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
        success: true,
      });
    }

    console.log('Password reset email sent successfully');
    console.log('Response data:', data);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true,
    });

  } catch (error: unknown) {
    console.error('Forgot password exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
