# God First Education & Tours - Dynamic Content Management System Implementation Plan

## Project Overview
Transform the static Next.js website into a dynamic platform with admin capabilities for content management and user engagement features. This plan enables regular updates to services/activities and provides user authentication with activity tracking.

---

## Current Tech Stack Analysis
- **Framework:** Next.js 16.0.3 (App Router)
- **Frontend:** React 19.2.0, TypeScript 5
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion, GSAP
- **UI Components:** Material-UI, Lucide Icons

---

## Architecture Overview

### 1. Backend & Database Layer
#### Database Options (Choose One)
**Option A: Supabase (Recommended)**
- PostgreSQL database with real-time capabilities
- Built-in authentication
- Row-level security
- Storage for images/files
- Free tier available

**Option B: MongoDB + Mongoose**
- Flexible schema for events/services
- Good for varying content structures
- Atlas free tier available

**Option C: Prisma + PostgreSQL (Vercel/Railway)**
- Type-safe database access
- Great with TypeScript
- Excellent migrations

#### Recommended Stack Components
```
Database: Supabase PostgreSQL
ORM: Prisma (for type safety)
Authentication: NextAuth.js v5 or Supabase Auth
File Storage: Supabase Storage or Cloudinary
```

---

## Phase 1: Database Schema Design

### User Tables
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  nationality VARCHAR(100),
  passport_number VARCHAR(50),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  preferences JSONB, -- travel preferences, interests, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events & Services Tables
```sql
-- Services (Dynamic version of current static services)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  tagline VARCHAR(100),
  description TEXT,
  full_description TEXT,
  icon_name VARCHAR(50), -- lucide icon name
  category VARCHAR(50), -- 'travel', 'education', 'visa', etc.
  color VARCHAR(20),
  image_url TEXT,
  features JSONB, -- array of features
  price_range VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events/Tours (Dynamic version of current static events)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  duration VARCHAR(50),
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'ended', 'cancelled'
  category VARCHAR(50), -- 'tour', 'education', 'admission'
  price DECIMAL(10,2),
  max_participants INT,
  current_participants INT DEFAULT 0,
  includes JSONB, -- what's included in the tour
  requirements JSONB, -- requirements for participants
  itinerary JSONB, -- day-by-day itinerary
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Images (Gallery for each event)
CREATE TABLE event_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Activity & Bookings Tables
```sql
-- User Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  service_id UUID REFERENCES services(id),
  booking_type VARCHAR(20), -- 'event', 'service', 'consultation'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  participants INT DEFAULT 1,
  total_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  special_requests TEXT,
  booking_date TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Activity Log
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50), -- 'booking', 'profile_update', 'login', etc.
  activity_data JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved/Wishlist Items
CREATE TABLE user_wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  service_id UUID REFERENCES services(id),
  item_type VARCHAR(20), -- 'event', 'service'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Testimonials & Gallery Tables
```sql
-- Testimonials (Make dynamic)
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  title VARCHAR(100),
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery/Masonry Images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200),
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  tags JSONB,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 2: Backend API Development

### API Routes Structure
```
app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── admin/
│   ├── events/
│   │   ├── route.ts (GET all, POST create)
│   │   └── [id]/route.ts (GET, PUT, DELETE)
│   ├── services/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── testimonials/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── gallery/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── users/
│       ├── route.ts
│       └── [id]/route.ts
├── events/
│   ├── route.ts (GET all events)
│   ├── [slug]/route.ts (GET single event)
│   └── featured/route.ts
├── services/
│   ├── route.ts
│   └── [slug]/route.ts
├── bookings/
│   ├── route.ts (GET user bookings, POST create)
│   └── [id]/route.ts (GET, PUT, DELETE)
├── user/
│   ├── profile/route.ts
│   ├── activities/route.ts
│   ├── wishlist/route.ts
│   └── bookings/route.ts
└── upload/route.ts (Image upload)
```

### Middleware for Authentication
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  // Protected admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Verify admin role from token
  }

  // Protected user routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

---

## Phase 3: Frontend Development

### Admin Dashboard Pages
```
app/admin/
├── layout.tsx (Admin layout with sidebar)
├── page.tsx (Dashboard overview)
├── events/
│   ├── page.tsx (List all events)
│   ├── new/page.tsx (Create event)
│   └── [id]/edit/page.tsx (Edit event)
├── services/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
├── bookings/
│   └── page.tsx (Manage bookings)
├── users/
│   └── page.tsx (User management)
├── testimonials/
│   └── page.tsx (Approve/manage)
├── gallery/
│   └── page.tsx (Upload/manage images)
└── settings/
    └── page.tsx (Site settings)
```

### User Dashboard Pages
```
app/dashboard/
├── layout.tsx (User dashboard layout)
├── page.tsx (Dashboard home)
├── profile/page.tsx (Edit profile)
├── bookings/
│   ├── page.tsx (View bookings)
│   └── [id]/page.tsx (Booking details)
├── activities/page.tsx (Activity history)
└── wishlist/page.tsx (Saved items)
```

### Authentication Pages
```
app/
├── login/page.tsx
├── register/page.tsx
├── forgot-password/page.tsx
└── reset-password/page.tsx
```

### Update Existing Components
```typescript
// app/components/Events.tsx
// Fetch from API instead of static array
'use client';

import { useEffect, useState } from 'react';

export function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  // Rest of component...
}
```

---

## Phase 4: Admin Features

### Admin Dashboard Features

#### 1. Event Management
- Create/Edit/Delete events
- Upload event images
- Set event status (upcoming/ongoing/ended)
- Manage event capacity
- View event bookings
- Rich text editor for descriptions

#### 2. Service Management
- Manage service offerings
- Update pricing
- Toggle active/inactive
- Reorder display priority

#### 3. Booking Management
- View all bookings
- Confirm/cancel bookings
- Export booking data
- Send confirmation emails

#### 4. User Management
- View all users
- Assign roles (user/admin)
- View user activities
- Manage user accounts

#### 5. Content Management
- Approve testimonials
- Manage gallery images
- Update site settings
- Manage homepage content

#### 6. Analytics Dashboard
- Total bookings
- Revenue metrics
- User growth
- Popular events/services

---

## Phase 5: User Features

### User Dashboard Features

#### 1. Profile Management
- Edit personal information
- Upload profile picture
- Manage travel preferences
- Update emergency contacts

#### 2. Booking System
- Browse events/services
- Make bookings
- View booking history
- Download booking confirmations
- Cancel bookings (with policy)

#### 3. Activity Tracking
- View booking history
- Track upcoming trips
- View past experiences
- Download invoices

#### 4. Wishlist/Favorites
- Save events for later
- Receive notifications
- Quick booking from wishlist

#### 5. Notifications
- Email confirmations
- Event reminders
- Special offers
- Newsletter subscription

---

## Phase 6: Additional Features

### Payment Integration
```bash
# Install Stripe
npm install stripe @stripe/stripe-js
```

Create payment routes:
```typescript
// app/api/payments/create-checkout-session/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { bookingId, amount } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Event Booking',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/cancel`,
  });

  return Response.json({ sessionId: session.id });
}
```

### Email Notifications
```bash
# Install email service
npm install nodemailer
# or use
npm install @sendgrid/mail
```

### File Upload
```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return Response.json({ url: blob.url });
}
```

### Search & Filtering
- Search events by keyword
- Filter by date range
- Filter by category
- Filter by location
- Filter by price range

### Reviews & Ratings
- User reviews for completed events
- Star ratings
- Photo uploads from users
- Admin moderation

---

## Phase 7: Security & Optimization

### Security Measures
1. **Authentication**
   - JWT tokens with expiration
   - Refresh token rotation
   - Password hashing (bcrypt)
   - Rate limiting on auth endpoints

2. **Authorization**
   - Role-based access control (RBAC)
   - Row-level security (Supabase)
   - API route protection

3. **Data Validation**
   - Zod schema validation
   - Input sanitization
   - File upload validation

4. **API Security**
   - CORS configuration
   - CSRF protection
   - Rate limiting
   - Request size limits

### Performance Optimization
1. **Caching**
   - Redis for session storage
   - React Query for client-side caching
   - Next.js ISR for static content

2. **Image Optimization**
   - Next.js Image component
   - WebP format
   - Lazy loading
   - Responsive images

3. **Database Optimization**
   - Database indexes
   - Query optimization
   - Connection pooling

---

## Implementation Roadmap

### Week 1-2: Setup & Database
- [ ] Choose and setup database (Supabase recommended)
- [ ] Install Prisma and configure
- [ ] Create database schema
- [ ] Setup authentication (NextAuth.js)
- [ ] Configure file storage

### Week 3-4: Backend APIs
- [ ] Create auth endpoints
- [ ] Build admin API routes
- [ ] Build public API routes
- [ ] Implement middleware
- [ ] Setup validation schemas

### Week 5-6: Admin Dashboard
- [ ] Create admin layout
- [ ] Build event management UI
- [ ] Build service management UI
- [ ] Build user management UI
- [ ] Build analytics dashboard

### Week 7-8: User Features
- [ ] Create authentication pages
- [ ] Build user dashboard
- [ ] Implement booking system
- [ ] Create profile management
- [ ] Build wishlist feature

### Week 9-10: Integration & Testing
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] File upload functionality
- [ ] Testing all features
- [ ] Bug fixes

### Week 11-12: Deployment & Polish
- [ ] Security audit
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Documentation
- [ ] Deploy to production

---

## Required Dependencies

### Install Core Packages
```bash
# Database & ORM
npm install @prisma/client prisma
npm install @supabase/supabase-js  # if using Supabase

# Authentication
npm install next-auth@beta bcryptjs
npm install @types/bcryptjs -D

# Validation
npm install zod

# Forms
npm install react-hook-form @hookform/resolvers

# State Management
npm install @tanstack/react-query zustand

# File Upload
npm install @vercel/blob

# Payment
npm install stripe @stripe/stripe-js

# Email
npm install nodemailer
npm install @types/nodemailer -D

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit

# Date Handling
npm install date-fns

# Utilities
npm install clsx class-variance-authority
```

---

## Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Upload
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Migration Strategy

### Phase 1: Parallel Development
1. Keep existing static pages working
2. Build new dynamic features alongside
3. Test thoroughly before switching

### Phase 2: Data Migration
1. Create seed script to migrate static data
2. Import existing events into database
3. Import existing services into database

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Migrate events from Events.tsx
  const events = [
    {
      title: 'Accra - Cape Coast Tour',
      slug: 'accra-cape-coast-tour',
      // ... rest of data
    },
    // ... more events
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
}

main();
```

### Phase 3: Gradual Rollout
1. Start with admin dashboard (limited access)
2. Add user authentication
3. Enable booking system
4. Switch to dynamic content
5. Retire static data

---

## Testing Strategy

### Unit Tests
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### E2E Tests
```bash
npm install -D playwright
```

Test scenarios:
- User registration/login
- Admin event creation
- Booking flow
- Payment processing
- File uploads

---

## Monitoring & Analytics

### Setup Monitoring
```bash
npm install @vercel/analytics
npm install @sentry/nextjs
```

### Track Metrics
- User signups
- Bookings completed
- Page views
- Error rates
- API response times

---

## Support & Maintenance

### Documentation
- API documentation
- Admin user guide
- User manual
- Developer setup guide

### Backup Strategy
- Daily database backups
- Image storage backups
- Configuration backups

### Update Schedule
- Security updates: Immediate
- Feature updates: Monthly
- Content updates: As needed

---

## Conclusion

This implementation plan transforms your static God First Education & Tours website into a fully dynamic, manageable platform. The admin can easily update content, manage bookings, and track user activities, while users enjoy personalized experiences with authentication, booking capabilities, and activity tracking.

**Estimated Timeline:** 10-12 weeks for full implementation
**Budget Consideration:** Most services have free tiers suitable for MVP
**Scalability:** Architecture supports growth from startup to enterprise scale

Start with Phase 1 (Database setup) and progress systematically through each phase for best results.
