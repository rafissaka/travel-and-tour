import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { EducationLevel } from '@prisma/client';

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

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * POST /api/education-history/migrate
 * One-time migration script to create education entries from ALL existing documents
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting migration for user:', user.id);

    // Get ALL user's documents
    const documents = await prisma.userDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found documents:', documents.length);

    if (documents.length === 0) {
      return NextResponse.json(
        { message: 'No documents found', created: [], skipped: [] },
        { status: 200 }
      );
    }

    // Ensure academic profile exists
    await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Get the academic profile
    const academicProfile = await prisma.userAcademicProfile.findUnique({
      where: { userId: user.id },
    });

    if (!academicProfile) {
      return NextResponse.json(
        { error: 'Failed to create academic profile' },
        { status: 500 }
      );
    }

    // Get existing education history to avoid duplicates
    const existingEducation = await prisma.userEducationHistory.findMany({
      where: {
        userAcademicProfile: {
          userId: user.id,
        },
      },
    });

    console.log('Existing education entries:', existingEducation.length);

    const createdEntries: any[] = [];
    const skippedDocuments: string[] = [];

    for (const doc of documents) {
      const educationLevel = documentToEducationLevel[doc.documentType];

      console.log(`Processing document: ${doc.documentType} -> ${educationLevel || 'NOT MAPPED'}`);

      if (!educationLevel) {
        skippedDocuments.push(`${doc.documentType} (not an educational document)`);
        continue;
      }

      // Check if this education level already exists
      const exists = existingEducation.some(
        (edu) => edu.educationLevel === educationLevel
      );

      if (exists) {
        skippedDocuments.push(`${doc.documentType} (${educationLevel} already exists)`);
        continue;
      }

      // Create education history entry
      const entry = await prisma.userEducationHistory.create({
        data: {
          userAcademicProfile: {
            connect: { userId: user.id }
          },
          educationLevel,
          institutionName: doc.institutionName || doc.issuingAuthority || 'To be updated',
          fieldOfStudy: doc.courseOfStudy || 'General',
          startDate: doc.startDate || null,
          endDate: doc.endDate || doc.completionDate || doc.issueDate || null,
          graduated: true,
          grade: null,
          gradingSystem: null,
        },
      });

      console.log('Created education entry:', entry);

      createdEntries.push({
        level: educationLevel,
        documentType: doc.documentType,
        documentName: doc.documentName,
        institution: entry.institutionName,
      });

      // Add to existing to prevent duplicates in this run
      existingEducation.push(entry);
    }

    console.log('Migration complete. Created:', createdEntries.length, 'Skipped:', skippedDocuments.length);

    return NextResponse.json({
      success: true,
      message: `Migration complete! Created ${createdEntries.length} education entries.`,
      created: createdEntries,
      skipped: skippedDocuments,
      totalDocuments: documents.length,
    });
  } catch (error) {
    console.error('Error migrating education history:', error);
    return NextResponse.json(
      { error: 'Failed to migrate education history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
