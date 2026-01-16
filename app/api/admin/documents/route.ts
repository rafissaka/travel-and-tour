import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { DocumentType } from '@prisma/client';

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
 * GET /api/admin/documents
 * Get all user documents for verification (Admin only)
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
    const verified = searchParams.get('verified');
    const documentType = searchParams.get('type');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {};

    if (verified === 'true') {
      where.isVerified = true;
    } else if (verified === 'false') {
      where.isVerified = false;
    }

    if (documentType && Object.values(DocumentType).includes(documentType as DocumentType)) {
      where.documentType = documentType;
    }

    if (userId) {
      where.userId = userId;
    }

    // Fetch documents with user information
    const documents = await prisma.userDocument.findMany({
      where,
      include: {
        userAcademicProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get statistics
    const stats = {
      total: await prisma.userDocument.count(),
      verified: await prisma.userDocument.count({ where: { isVerified: true } }),
      pending: await prisma.userDocument.count({ where: { isVerified: false } }),
      byType: {} as Record<string, number>,
    };

    // Count by document type
    for (const type of Object.values(DocumentType)) {
      const count = await prisma.userDocument.count({
        where: { documentType: type },
      });
      if (count > 0) {
        stats.byType[type] = count;
      }
    }

    return NextResponse.json({
      documents,
      stats,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/documents?id=xxx
 * Verify or update document status (Admin only)
 */
export async function PATCH(request: NextRequest) {
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
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find document
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (body.isVerified !== undefined) {
      updateData.isVerified = body.isVerified;
      if (body.isVerified) {
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = user.id;
      } else {
        updateData.verifiedAt = null;
        updateData.verifiedBy = null;
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Update document
    const updatedDocument = await prisma.userDocument.update({
      where: { id: documentId },
      data: updateData,
      include: {
        userAcademicProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
