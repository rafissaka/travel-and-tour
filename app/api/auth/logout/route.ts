import { NextRequest, NextResponse } from 'next/server';
import { signout } from '@/utils/supabase/auth-actions';

export async function POST(request: NextRequest) {
  try {
    const result = await signout();

    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Logged out successfully',
      success: true
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
