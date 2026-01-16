import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateAllProgramsEligibility, calculateProgramEligibility } from '@/lib/eligibility-calculator';

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
 * GET /api/user/eligible-programs
 * Get programs user is eligible for based on their documents and qualifications
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : 0;
    const onlyEligible = searchParams.get('onlyEligible') === 'true';
    const recalculate = searchParams.get('recalculate') === 'true';

    // Recalculate eligibility if requested
    if (recalculate) {
      await calculateAllProgramsEligibility(user.id);
    }

    // Build where clause
    const where: any = { userId: user.id };
    if (minScore > 0) {
      where.eligibilityScore = { gte: minScore };
    }
    if (onlyEligible) {
      where.isEligible = true;
    }

    // Fetch eligibility data
    const eligibility = await prisma.programEligibility.findMany({
      where,
      include: {
        program: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
              },
            },
            programRequirements: true,
          },
        },
      },
      orderBy: { eligibilityScore: 'desc' },
    });

    // Get user's academic profile for context
    const profile = await prisma.userAcademicProfile.findUnique({
      where: { userId: user.id },
      include: {
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userDocuments: true,
        userTestScores: true,
      },
    });

    return NextResponse.json({
      eligibility,
      profile,
      summary: {
        total: eligibility.length,
        eligible: eligibility.filter(e => e.isEligible).length,
        highMatch: eligibility.filter(e => e.eligibilityScore >= 80).length,
        mediumMatch: eligibility.filter(e => e.eligibilityScore >= 60 && e.eligibilityScore < 80).length,
        lowMatch: eligibility.filter(e => e.eligibilityScore < 60).length,
      },
    });
  } catch (error) {
    console.error('Error fetching eligible programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligible programs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/eligible-programs
 * Recalculate eligibility for all programs or specific program
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const programId = body.programId;

    if (programId) {
      // Recalculate for specific program
      const eligibility = await calculateProgramEligibility(user.id, programId);

      // Store in database
      await prisma.programEligibility.upsert({
        where: {
          userId_programId: {
            userId: user.id,
            programId,
          },
        },
        create: {
          userId: user.id,
          programId,
          eligibilityScore: eligibility.eligibilityScore,
          isEligible: eligibility.isEligible,
          metRequirements: eligibility.metRequirements,
          missingRequirements: eligibility.missingRequirements,
          recommendationNotes: eligibility.recommendationNotes,
          lastCalculatedAt: new Date(),
        },
        update: {
          eligibilityScore: eligibility.eligibilityScore,
          isEligible: eligibility.isEligible,
          metRequirements: eligibility.metRequirements,
          missingRequirements: eligibility.missingRequirements,
          recommendationNotes: eligibility.recommendationNotes,
          lastCalculatedAt: new Date(),
        },
      });

      // Fetch updated eligibility
      const updatedEligibility = await prisma.programEligibility.findUnique({
        where: {
          userId_programId: {
            userId: user.id,
            programId,
          },
        },
        include: {
          program: {
            include: {
              service: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  imageUrl: true,
                },
              },
              programRequirements: true,
            },
          },
        },
      });

      return NextResponse.json(updatedEligibility);
    } else {
      // Recalculate for all programs
      const results = await calculateAllProgramsEligibility(user.id);

      return NextResponse.json({
        message: 'Eligibility recalculated for all programs',
        count: results.length,
        eligible: results.filter(r => r.eligibility.isEligible).length,
      });
    }
  } catch (error) {
    console.error('Error recalculating eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate eligibility' },
      { status: 500 }
    );
  }
}
