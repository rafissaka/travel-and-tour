import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { notifyAdmins } from '@/lib/notifications';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// GET all applications for the current user (or all for admins)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    const applications = await prisma.application.findMany({
      where: isAdmin ? {} : { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        programId: true,
        programName: true,
        programCountry: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const isDraft = body.status === 'DRAFT' || !body.status;

    // Check for duplicate application to the same program
    if (body.programId) {
      const existingApplication = await prisma.application.findFirst({
        where: {
          userId: user.id,
          programId: body.programId,
        },
      });

      if (existingApplication) {
        return NextResponse.json(
          { error: 'You have already applied to this program' },
          { status: 400 }
        );
      }
    }

    // Only validate required fields if submitting (not saving as draft)
    if (!isDraft) {
      const requiredFields = [
        'programName',
        'programCountry',
        'firstName',
        'lastName',
        'dateOfBirth',
        'placeOfBirth',
        'nationality',
        'sex',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'motherName',
        'fatherName',
        'emergencyContactName',
        'emergencyContactPhone',
        'emergencyContactRelation',
        'passportNumber',
        'passportIssueDate',
        'passportExpiryDate',
        'passportIssueCountry'
      ];

      // Validate education array
      if (!body.education || !Array.isArray(body.education) || body.education.length === 0) {
        return NextResponse.json(
          { error: 'At least one education entry is required' },
          { status: 400 }
        );
      }

      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 }
          );
        }
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        // Program Details
        programName: body.programName || '',
        programCountry: body.programCountry || '',
        programUniversity: body.programUniversity || null,
        programStartDate: body.programStartDate ? new Date(body.programStartDate) : null,
        programEndDate: body.programEndDate ? new Date(body.programEndDate) : null,
        programDuration: body.programDuration || null,

        // Personal Information
        firstName: body.firstName || null,
        middleName: body.middleName || null,
        lastName: body.lastName || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        placeOfBirth: body.placeOfBirth || null,
        nationality: body.nationality || null,
        sex: body.sex || null,

        // Contact Information
        email: body.email || null,
        phone: body.phone || null,
        alternativePhone: body.alternativePhone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || null,

        // Family Information
        motherName: body.motherName || null,
        motherOccupation: body.motherOccupation || null,
        motherPhone: body.motherPhone || null,
        fatherName: body.fatherName || null,
        fatherOccupation: body.fatherOccupation || null,
        fatherPhone: body.fatherPhone || null,

        // Emergency Contact
        emergencyContactName: body.emergencyContactName || null,
        emergencyContactPhone: body.emergencyContactPhone || null,
        emergencyContactRelation: body.emergencyContactRelation || null,

        // Educational Background
        currentEducationLevel: body.currentEducationLevel || null,
        schoolName: body.schoolName || null,
        gradeLevel: body.gradeLevel || null,
        gpa: body.gpa || null,
        education: body.education || null,

        // Work Experience
        workExperience: body.workExperience || null,

        // Home Address
        homeNumber: body.homeNumber || null,
        streetAddress: body.streetAddress || null,
        postalAddress: body.postalAddress || null,

        // Passport Information
        passportNumber: body.passportNumber || null,
        passportIssueDate: body.passportIssueDate ? new Date(body.passportIssueDate) : null,
        passportExpiryDate: body.passportExpiryDate ? new Date(body.passportExpiryDate) : null,
        passportIssueCountry: body.passportIssueCountry || null,

        // Additional Information
        previousTravel: body.previousTravel || false,
        previousTravelDetails: body.previousTravelDetails || null,
        medicalConditions: body.medicalConditions || null,
        specialRequirements: body.specialRequirements || null,
        motivation: body.motivation || null,

        // Documents
        passportCopyUrl: body.passportCopyUrl || null,
        photoUrl: body.photoUrl || null,
        birthCertificateUrl: body.birthCertificateUrl || null,
        transcriptUrl: body.transcriptUrl || null,
        wassceUrl: body.wassceUrl || null,
        medicalResultsUrl: body.medicalResultsUrl || null,
        additionalDocuments: body.additionalDocuments || null,

        // Program ID
        programId: body.programId || null,

        // Status
        status: body.status || 'DRAFT',
        submittedAt: body.submittedAt ? new Date(body.submittedAt) : null,

        // User
        userId: user.id,
      },
    });

    // Send notification if application is submitted (not draft)
    if (application.status === 'SUBMITTED') {
      // Notify admins about new application
      await notifyAdmins(
        'New Application Submitted',
        `New application for ${application.programName} from ${user.email}`,
        `/profile/applications`
      );
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// PATCH update application
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
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

    // Check if application belongs to user OR user is admin
    const existing = await prisma.application.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow editing all applications (removed draft-only restriction)

    // Convert date strings to Date objects
    const dataToUpdate: any = { ...updateData };

    // Remove fields that shouldn't be updated directly
    delete dataToUpdate.id;
    delete dataToUpdate.userId;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;
    delete dataToUpdate.user;
    delete dataToUpdate.program;
    delete dataToUpdate.programId; // programId should not be updated this way

    const dateFields = ['programStartDate', 'programEndDate', 'dateOfBirth', 'passportIssueDate', 'passportExpiryDate', 'submittedAt'];

    for (const field of dateFields) {
      if (dataToUpdate[field]) {
        dataToUpdate[field] = new Date(dataToUpdate[field]);
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: dataToUpdate,
    });

    // Send notification if draft was submitted
    if (existing.status === 'DRAFT' && dataToUpdate.status === 'SUBMITTED') {
      await notifyAdmins(
        'New Application Submitted',
        `Application for ${application.programName} has been submitted`,
        `/profile/applications`
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE application
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
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Check if application belongs to user
    const existing = await prisma.application.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Can only delete draft applications
    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft applications can be deleted' },
        { status: 400 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
