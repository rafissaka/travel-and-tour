import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programs/[programId]
 * Get a single program by ID (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    // Try to find by slug first, then by id
    let program = await prisma.program.findUnique({
      where: { slug: programId },
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        description: true,
        fullDescription: true,
        country: true,
        university: true,
        duration: true,
        startDate: true,
        endDate: true,
        deadline: true,
        imageUrl: true,
        features: true,
        requirements: true,
        benefits: true,
        tuitionFee: true,
        applicationFee: true,
        scholarshipType: true,
        isActive: true,
      },
    });

    // If not found by slug, try by id
    if (!program) {
      program = await prisma.program.findUnique({
        where: { id: programId },
        select: {
          id: true,
          title: true,
          slug: true,
          tagline: true,
          description: true,
          fullDescription: true,
          country: true,
          university: true,
          duration: true,
          startDate: true,
          endDate: true,
          deadline: true,
          imageUrl: true,
          features: true,
          requirements: true,
          benefits: true,
          tuitionFee: true,
          applicationFee: true,
          scholarshipType: true,
          isActive: true,
        },
      });
    }

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Only return active programs to public
    if (!program.isActive) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}
