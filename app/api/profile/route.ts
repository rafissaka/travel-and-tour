import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create empty profile if it doesn't exist
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
        },
      });
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Convert dateOfBirth to Date object if provided
    const dateOfBirth = data.dateOfBirth
      ? new Date(data.dateOfBirth)
      : undefined;

    // Upsert user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        nationality: data.nationality || null,
        passportNumber: data.passportNumber || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        preferences: data.preferences || null,
        work_experience: data.workExperience || null,
      },
      create: {
        userId: user.id,
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        nationality: data.nationality || null,
        passportNumber: data.passportNumber || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        preferences: data.preferences || null,
        work_experience: data.workExperience || null,
      },
    });

    return NextResponse.json(profile);

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
