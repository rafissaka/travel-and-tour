# Authentication System Setup

## Overview
This authentication system uses **Supabase Auth** for authentication and **Prisma ORM** with PostgreSQL for data management.

## Features Implemented

### 1. User Roles
- **USER**: Regular users (default)
- **ADMIN**: Administrators created by super_admin
- **SUPER_ADMIN**: First user to register (only one)

### 2. Authentication Features
- ✅ User Registration (Signup)
- ✅ User Login
- ✅ User Logout
- ✅ Email Verification
- ✅ Password Reset
- ✅ Role-based Access Control (RBAC)
- ✅ Protected Routes (Middleware)
- ✅ Session Management
- ✅ Activity Logging

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database - Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.txpzmxwjxnzhuxofsmgy:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.txpzmxwjxnzhuxofsmgy:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://txpzmxwjxnzhuxofsmgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Migration
Run the following commands to set up your database:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# (Optional) View your database
npx prisma studio
```

### 3. Supabase Configuration
In your Supabase dashboard:

1. **Enable Email Auth**:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates if needed

2. **Set Redirect URLs**:
   - Go to Authentication > URL Configuration
   - Add these redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

3. **Email Templates** (Optional):
   - Go to Authentication > Email Templates
   - Customize verification and password reset emails

## API Endpoints

### Authentication Endpoints

#### 1. Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "emailVerified": true
  },
  "session": { ... }
}
```

#### 3. Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### 4. Get Current User
```http
GET /api/auth/me
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "emailVerified": true,
    "profile": { ... }
  }
}
```

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent. Please check your inbox."
}
```

#### 6. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "password": "newsecurepassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

## Client-Side Usage

### Using in Client Components

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      console.error(data.error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Using in Server Components

```typescript
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/check-role';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

## Role-Based Access Control

### Protecting API Routes

```typescript
import { requireRole } from '@/lib/auth/check-role';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Only allow ADMIN and SUPER_ADMIN
    const user = await requireRole(['ADMIN', 'SUPER_ADMIN']);

    // Your protected logic here
    return NextResponse.json({ data: 'Secret admin data' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
}
```

### Checking Roles in Components

```typescript
import { getCurrentUser } from '@/lib/auth/check-role';

export default async function AdminPanel() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel Content</div>;
}
```

## Protected Routes

The middleware automatically protects these routes:
- `/admin/*` - Requires authentication (admin role check needed)
- `/dashboard/*` - Requires authentication
- `/api/admin/*` - Requires authentication

## User Roles Flow

1. **First User Registration**:
   - First user to register automatically becomes `SUPER_ADMIN`
   - Has full access to the system

2. **Creating Admins**:
   - Only `SUPER_ADMIN` can create `ADMIN` users
   - Admins can manage content but not other admins

3. **Regular Users**:
   - All subsequent signups are `USER` role by default
   - Can book events, manage profile, view content

## Database Schema

### User Table
- `id`: UUID (matches Supabase Auth user ID)
- `email`: String (unique)
- `passwordHash`: String (empty, Supabase handles passwords)
- `firstName`: String (optional)
- `lastName`: String (optional)
- `phone`: String (optional)
- `role`: Enum (USER, ADMIN, SUPER_ADMIN)
- `emailVerified`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Related Tables
- `user_profiles`: Extended user information
- `user_activities`: Activity logging
- `bookings`: User bookings
- `user_wishlists`: Saved items

## Testing

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Security Features

1. **Password Security**: Managed by Supabase (bcrypt hashing)
2. **Session Management**: JWT tokens handled by Supabase
3. **CSRF Protection**: Built into Next.js
4. **Rate Limiting**: Should be added (recommended)
5. **Email Verification**: Required before full access
6. **Activity Logging**: All login attempts logged

## Next Steps

1. Create authentication UI pages:
   - `/login` - Login page
   - `/signup` - Registration page
   - `/forgot-password` - Password reset request
   - `/reset-password` - Password reset form
   - `/verify-email` - Email verification page

2. Create admin panel:
   - `/admin` - Admin dashboard
   - `/admin/users` - User management
   - `/admin/events` - Event management

3. Add rate limiting for authentication endpoints
4. Implement 2FA (Two-Factor Authentication)
5. Add social authentication (Google, GitHub, etc.)

## Troubleshooting

### Common Issues

1. **"Invalid or expired token"**
   - Check if email verification is enabled in Supabase
   - Verify redirect URLs are correctly configured

2. **"Unauthorized" errors**
   - Ensure cookies are enabled
   - Check if session has expired
   - Verify middleware is running

3. **Database connection errors**
   - Verify DATABASE_URL and DIRECT_URL are correct
   - Check if Supabase database is accessible
   - Run `npx prisma migrate dev` to ensure schema is up to date

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
