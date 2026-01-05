import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch testimonials (public can see approved, admins can see all)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = searchParams.get('admin') === 'true';

    // Check if user is authenticated and is admin
    let userRole = 'USER';
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true },
        });
        userRole = dbUser?.role || 'USER';
      }
    } catch {
      // Not authenticated, continue as public user
    }

    // Build query based on role
    const whereClause: any = {};
    
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      // Public users only see approved testimonials
      whereClause.isApproved = true;
    } else if (isAdmin) {
      // Admin view - get all testimonials
      const status = searchParams.get('status');
      if (status === 'pending') {
        whereClause.isApproved = false;
      } else if (status === 'approved') {
        whereClause.isApproved = true;
      }
      // else show all
    } else {
      // Admin accessing public view
      whereClause.isApproved = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, rating, title } = body;

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        userId: dbUser.id,
        name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Anonymous',
        title: title || null,
        content: content.trim(),
        rating: rating || null,
        avatarUrl: dbUser.avatarUrl,
        isApproved: false, // Requires admin approval
        isFeatured: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// PATCH - Update testimonial (admin only for approval, user can edit own)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, isApproved, isFeatured, content, rating, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN';
    const isOwner = existingTestimonial.userId === dbUser.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    // Only admins can approve or feature
    if (isAdmin) {
      if (typeof isApproved === 'boolean') {
        updateData.isApproved = isApproved;
      }
      if (typeof isFeatured === 'boolean') {
        updateData.isFeatured = isFeatured;
      }
    }

    // Users can edit their own content (but it will need re-approval)
    if (isOwner && !isAdmin) {
      if (content) {
        updateData.content = content.trim();
        updateData.isApproved = false; // Reset approval when user edits
      }
      if (rating) {
        updateData.rating = rating;
      }
      if (title !== undefined) {
        updateData.title = title;
      }
    }

    // Admins can edit anything
    if (isAdmin) {
      if (content) {
        updateData.content = content.trim();
      }
      if (rating !== undefined) {
        updateData.rating = rating;
      }
      if (title !== undefined) {
        updateData.title = title;
      }
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial (admin or owner)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    // Check if testimonial exists
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN';
    const isOwner = testimonial.userId === dbUser.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
