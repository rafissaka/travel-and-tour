import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to book a consultation.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'serviceId',
      'contactFullName',
      'contactEmail',
      'contactPhone',
      'contactResidence',
      'travelers',
      'destinationClarity',
      'travelStartDate',
      'travelEndDate',
      'tripDuration',
      'tripType',
      'mustDoActivities',
      'accommodationStyle',
      'transportMethod',
      'yellowFever',
      'malariaPlan',
      'totalBudget',
      'spendingStyle',
      'referralSource',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate travelers array
    if (!Array.isArray(body.travelers) || body.travelers.length === 0) {
      return NextResponse.json(
        { error: 'At least one traveler is required' },
        { status: 400 }
      );
    }

    // Calculate fee estimate
    let feeEstimate = 0;
    body.travelers.forEach((traveler: any) => {
      if (traveler.travelerType === 'Infant (0-1)') {
        feeEstimate += 250;
      } else {
        feeEstimate += 500;
      }
    });

    // Create consultation booking
    const consultation = await prisma.consultationBooking.create({
      data: {
        userId: user.id,
        serviceId: body.serviceId,
        contactFullName: body.contactFullName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactResidence: body.contactResidence,
        travelers: body.travelers,
        travelerCount: body.travelers.length,
        feeEstimate,
        destinationClarity: body.destinationClarity,
        destinationDetails: body.destinationDetails || null,
        travelStartDate: new Date(body.travelStartDate),
        travelEndDate: new Date(body.travelEndDate),
        tripDuration: body.tripDuration,
        tripType: body.tripType,
        mustDoActivities: body.mustDoActivities,
        accommodationStyle: body.accommodationStyle,
        transportMethod: body.transportMethod,
        carSeatNeeds: body.carSeatNeeds || null,
        driverRequirement: body.driverRequirement || null,
        yellowFever: body.yellowFever,
        malariaPlan: body.malariaPlan,
        dietaryRestrictions: body.dietaryRestrictions || null,
        totalBudget: body.totalBudget,
        spendingStyle: body.spendingStyle,
        referralSource: body.referralSource,
        paymentStatus: 'PENDING',
      },
      include: {
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    // Notify admins
    await notifyAdmins(
      'New Consultation Request',
      `New ${consultation.service.title} consultation request from ${body.contactFullName} for ${body.travelers.length} traveler(s). Fee: GHS ${feeEstimate}`,
      `/profile/bookings`
    );

    // Return consultation with payment info
    return NextResponse.json({
      success: true,
      consultation: {
        id: consultation.id,
        feeEstimate,
        travelerCount: body.travelers.length,
        contactEmail: body.contactEmail,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating consultation booking:', error);
    return NextResponse.json(
      { error: 'Failed to create consultation booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const consultationId = searchParams.get('id');

    if (consultationId) {
      // Get specific consultation
      const consultation = await prisma.consultationBooking.findUnique({
        where: { id: consultationId },
        include: {
          service: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!consultation) {
        return NextResponse.json(
          { error: 'Consultation not found' },
          { status: 404 }
        );
      }

      // Check authorization
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && consultation.userId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      return NextResponse.json(consultation);
    }

    // Get user's consultations or all (for admins)
    const where = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      ? {}
      : { userId: user.id };

    const consultations = await prisma.consultationBooking.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(consultations);

  } catch (error) {
    console.error('Error fetching consultation bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultation bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    // Get consultation to check authorization
    const consultation = await prisma.consultationBooking.findUnique({
      where: { id },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    // Only allow user to edit their own consultations
    if (consultation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Only allow editing if payment is completed
    if (consultation.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'You can only edit paid consultations' },
        { status: 403 }
      );
    }

    // Prevent changing number of travelers after payment (security check)
    if (updateData.travelers && Array.isArray(updateData.travelers)) {
      if (updateData.travelers.length !== consultation.travelerCount) {
        return NextResponse.json(
          { error: 'Cannot change the number of travelers after payment. You paid for ' + consultation.travelerCount + ' traveler(s).' },
          { status: 403 }
        );
      }
      // Keep the same fee and traveler count since payment was already made
      updateData.travelerCount = consultation.travelerCount;
      updateData.feeEstimate = consultation.feeEstimate;
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.contactFullName) dataToUpdate.contactFullName = updateData.contactFullName;
    if (updateData.contactEmail) dataToUpdate.contactEmail = updateData.contactEmail;
    if (updateData.contactPhone) dataToUpdate.contactPhone = updateData.contactPhone;
    if (updateData.contactResidence) dataToUpdate.contactResidence = updateData.contactResidence;
    if (updateData.travelers) dataToUpdate.travelers = updateData.travelers;
    if (updateData.travelerCount) dataToUpdate.travelerCount = updateData.travelerCount;
    if (updateData.feeEstimate !== undefined) dataToUpdate.feeEstimate = updateData.feeEstimate;
    if (updateData.destinationClarity) dataToUpdate.destinationClarity = updateData.destinationClarity;
    if (updateData.destinationDetails !== undefined) dataToUpdate.destinationDetails = updateData.destinationDetails;
    if (updateData.travelStartDate) dataToUpdate.travelStartDate = new Date(updateData.travelStartDate);
    if (updateData.travelEndDate) dataToUpdate.travelEndDate = new Date(updateData.travelEndDate);
    if (updateData.tripDuration) dataToUpdate.tripDuration = updateData.tripDuration;
    if (updateData.tripType) dataToUpdate.tripType = updateData.tripType;
    if (updateData.mustDoActivities !== undefined) dataToUpdate.mustDoActivities = updateData.mustDoActivities;
    if (updateData.accommodationStyle) dataToUpdate.accommodationStyle = updateData.accommodationStyle;
    if (updateData.transportMethod) dataToUpdate.transportMethod = updateData.transportMethod;
    if (updateData.carSeatNeeds !== undefined) dataToUpdate.carSeatNeeds = updateData.carSeatNeeds;
    if (updateData.driverRequirement !== undefined) dataToUpdate.driverRequirement = updateData.driverRequirement;
    if (updateData.yellowFever) dataToUpdate.yellowFever = updateData.yellowFever;
    if (updateData.malariaPlan) dataToUpdate.malariaPlan = updateData.malariaPlan;
    if (updateData.dietaryRestrictions !== undefined) dataToUpdate.dietaryRestrictions = updateData.dietaryRestrictions;
    if (updateData.totalBudget) dataToUpdate.totalBudget = updateData.totalBudget;
    if (updateData.spendingStyle) dataToUpdate.spendingStyle = updateData.spendingStyle;

    // Update consultation
    const updatedConsultation = await prisma.consultationBooking.update({
      where: { id },
      data: dataToUpdate,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      consultation: updatedConsultation,
    });

  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json(
      { error: 'Failed to update consultation' },
      { status: 500 }
    );
  }
}
