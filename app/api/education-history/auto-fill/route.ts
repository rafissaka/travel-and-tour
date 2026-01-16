import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { DocumentType, EducationLevel } from '@prisma/client';

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

// Map document types to education levels
const documentToEducationLevel: Record<string, EducationLevel> = {
  // High School Documents
  'WASSCE_RESULT': 'HIGH_SCHOOL',
  'BECE_RESULT': 'HIGH_SCHOOL',
  'JHS_TRANSCRIPT': 'HIGH_SCHOOL',
  'SHS_TRANSCRIPT': 'HIGH_SCHOOL',
  'HIGH_SCHOOL_TRANSCRIPT': 'HIGH_SCHOOL',

  // University Documents
  'UNIVERSITY_TRANSCRIPT': 'UNDERGRADUATE',
  'DEGREE_CERTIFICATE': 'UNDERGRADUATE',
  'BACHELORS_DEGREE': 'UNDERGRADUATE',
  'BACHELORS_TRANSCRIPT': 'UNDERGRADUATE',

  // Diploma
  'DIPLOMA_CERTIFICATE': 'DIPLOMA',

  // Masters
  'MASTERS_DEGREE': 'MASTERS',
  'MASTERS_TRANSCRIPT': 'MASTERS',

  // Foundation
  'FOUNDATION_CERTIFICATE': 'FOUNDATION',
};

/**
 * POST /api/education-history/auto-fill
 * Auto-generate education history from uploaded documents
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's uploaded documents
    const documents = await prisma.userDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { message: 'No documents found to generate education history' },
        { status: 200 }
      );
    }

    // Ensure academic profile exists
    await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Get existing education history to avoid duplicates
    const existingEducation = await prisma.userEducationHistory.findMany({
      where: {
        userAcademicProfile: {
          userId: user.id,
        },
      },
    });

    const createdEntries: any[] = [];
    const skippedDocuments: string[] = [];

    for (const doc of documents) {
      const educationLevel = documentToEducationLevel[doc.documentType];

      if (!educationLevel) {
        skippedDocuments.push(doc.documentType);
        continue;
      }

      // Check if this education level already exists
      const exists = existingEducation.some(
        (edu) => edu.educationLevel === educationLevel
      );

      if (exists) {
        skippedDocuments.push(doc.documentType + ' (already exists)');
        continue;
      }

      // Get the academic profile
      const academicProfile = await prisma.userAcademicProfile.findUnique({
        where: { userId: user.id },
      });

      if (!academicProfile) continue;

      // Create education history entry
      const entry = await prisma.userEducationHistory.create({
        data: {
          userId: user.id,
          educationLevel,
          institutionName: doc.issuingAuthority || 'To be updated',
          fieldOfStudy: 'General',
          startDate: null,
          endDate: doc.issueDate || null,
          graduated: true,
          grade: null,
          gradingSystem: null,
        },
      });

      createdEntries.push({
        level: educationLevel,
        documentType: doc.documentType,
      });
    }

    return NextResponse.json({
      message: `Created ${createdEntries.length} education entries`,
      created: createdEntries,
      skipped: skippedDocuments,
    });
  } catch (error) {
    console.error('Error auto-filling education history:', error);
    return NextResponse.json(
      { error: 'Failed to auto-fill education history' },
      { status: 500 }
    );
  }
}
