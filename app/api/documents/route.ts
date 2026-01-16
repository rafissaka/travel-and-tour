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

// GET - Fetch user's documents
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type');

    const where: any = { userId: user.id };
    if (documentType) {
      where.documentType = documentType;
    }

    const documents = await prisma.userDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      documentType,
      documentName,
      fileUrl,
      fileSize,
      mimeType,
      issueDate,
      expiryDate,
      issuingAuthority,
      documentNumber,
      notes,
      // Institutional Information fields
      institutionName,
      courseOfStudy,
      startDate,
      endDate,
      completionDate,
      fundingType,
    } = body;

    if (!documentType || !documentName || !fileUrl) {
      return NextResponse.json(
        { error: 'Document type, name, and file URL are required' },
        { status: 400 }
      );
    }

    const document = await prisma.userDocument.create({
      data: {
        userId: user.id,
        documentType,
        documentName,
        fileUrl,
        fileSize,
        mimeType,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingAuthority,
        documentNumber,
        notes,
        isVerified: false,
        // Institutional Information
        institutionName: institutionName || null,
        courseOfStudy: courseOfStudy || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        fundingType: fundingType || null,
      },
    });

    // Automatically create education history entry for educational documents
    const educationLevel = documentToEducationLevel[documentType];
    let educationCreated = false;

    console.log('Document Type:', documentType);
    console.log('Mapped Education Level:', educationLevel);

    if (educationLevel) {
      try {
        console.log('Creating education history for user:', user.id);

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

        console.log('Academic Profile ID:', academicProfile?.id);

        if (academicProfile) {
          // Check if education entry for this level already exists
          const existingEducation = await prisma.userEducationHistory.findFirst({
            where: {
              userId: user.id,
              educationLevel: educationLevel,
            },
          });

          console.log('Existing Education Entry:', existingEducation);

          // Only create if it doesn't exist
          if (!existingEducation) {
            const newEducation = await prisma.userEducationHistory.create({
              data: {
                userId: user.id,
                educationLevel,
                institutionName: institutionName || issuingAuthority || 'To be updated',
                fieldOfStudy: courseOfStudy || 'General',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate || completionDate ? new Date(endDate || completionDate) : null,
                graduated: true,
                grade: null,
                gradingSystem: null,
              },
            });
            console.log('Created Education Entry:', newEducation);
            educationCreated = true;
          } else {
            console.log('Education entry already exists for level:', educationLevel);
          }
        }
      } catch (eduError) {
        console.error('Error creating education history:', eduError);
        // Don't fail the document upload if education creation fails
      }
    } else {
      console.log('Document type not mapped to education level:', documentType);
    }

    return NextResponse.json({
      ...document,
      educationCreated
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    // Verify ownership
    const existing = await prisma.userDocument.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert date strings to Date objects
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.completionDate) {
      updateData.completionDate = new Date(updateData.completionDate);
    }

    // Only admins can verify documents
    if (updateData.isVerified !== undefined && !isAdmin) {
      delete updateData.isVerified;
      delete updateData.verifiedAt;
      delete updateData.verifiedBy;
    }

    // Set verification timestamp and admin ID for verified documents
    if (updateData.isVerified && isAdmin) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = user.id;
    }

    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const document = await prisma.userDocument.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.userDocument.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userDocument.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
