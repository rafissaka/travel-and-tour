import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return dbUser;
}

/**
 * GET /api/admin/academic-profiles
 * Get all user academic profiles (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const educationLevel = searchParams.get('educationLevel');

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (educationLevel) {
      where.currentEducationLevel = educationLevel;
    }

    // Fetch academic profiles
    const profiles = await prisma.userAcademicProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            profile: {
              select: {
                dateOfBirth: true,
              },
            },
          },
        },
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userDocuments: {
          orderBy: { createdAt: 'desc' },
        },
        userTestScores: {
          orderBy: { testDate: 'desc' },
        },
        programEligibility: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                country: true,
                university: true,
              },
            },
          },
          where: {
            isEligible: true,
          },
          orderBy: { eligibilityScore: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: profiles.length,
      withEducation: profiles.filter(p => p.userEducationHistory.length > 0).length,
      withDocuments: profiles.filter(p => p.userDocuments.length > 0).length,
      withTestScores: profiles.filter(p => p.userTestScores.length > 0).length,
      eligible: profiles.filter(p => p.programEligibility.some(e => e.isEligible)).length,
      byEducationLevel: {} as Record<string, number>,
      documentsVerified: 0,
      documentsPending: 0,
    };

    // Count by education level
    profiles.forEach(profile => {
      if (profile.currentEducationLevel) {
        stats.byEducationLevel[profile.currentEducationLevel] =
          (stats.byEducationLevel[profile.currentEducationLevel] || 0) + 1;
      }
    });

    // Count verified documents
    profiles.forEach(profile => {
      profile.userDocuments.forEach(doc => {
        if (doc.isVerified) {
          stats.documentsVerified++;
        } else {
          stats.documentsPending++;
        }
      });
    });

    return NextResponse.json({
      profiles,
      stats,
    });
  } catch (error) {
    console.error('Error fetching academic profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic profiles' },
      { status: 500 }
    );
  }
}
