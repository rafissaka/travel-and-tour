import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { DocumentType } from '@prisma/client';
import { calculateAllProgramsEligibility } from '@/lib/eligibility-calculator';

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
 * GET /api/user/documents
 * Get user's documents
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type');

    const where: any = { userId: user.id };
    if (documentType && Object.values(DocumentType).includes(documentType as DocumentType)) {
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

/**
 * POST /api/user/documents
 * Upload a new document
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Ensure academic profile exists
    await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Validate required fields
    if (!body.documentType || !body.documentName || !body.fileUrl) {
      return NextResponse.json(
        { error: 'Document type, name, and file URL are required' },
        { status: 400 }
      );
    }

    if (!Object.values(DocumentType).includes(body.documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    const document = await prisma.userDocument.create({
      data: {
        userId: user.id,
        documentType: body.documentType,
        documentName: body.documentName,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize ? parseInt(body.fileSize) : null,
        mimeType: body.mimeType || null,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        issuingAuthority: body.issuingAuthority || null,
        documentNumber: body.documentNumber || null,
        // Institutional Information
        institutionName: body.institutionName || null,
        courseOfStudy: body.courseOfStudy || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        fundingType: body.fundingType || null,
        notes: body.notes || null,
      },
    });

    // Recalculate eligibility after document upload
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/documents?id=xxx
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify document belongs to user
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.userDocument.delete({
      where: { id: documentId },
    });

    // Recalculate eligibility after document deletion
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
