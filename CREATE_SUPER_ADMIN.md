# Create Super Admin User

This guide explains how to create the first Super Admin user for Godfirst Education and Tours.

## Prerequisites

- Access to Supabase Dashboard
- Database credentials

## Steps to Create Super Admin

### 1. Sign Up Through the Application

First, create a regular user account through the signup page:
- Go to `/auth/signup`
- Fill in the form with your details:
  - First Name
  - Last Name
  - Email
  - Password
  - Phone (optional)
- Complete the signup process

This will create a user in both Supabase Auth and your database with the `USER` role.

### 2. Get Your User ID

You'll need your user ID to upgrade to Super Admin. You can find it in one of these ways:

**Option A: From Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user by email
3. Copy the User ID (UUID)

**Option B: Run SQL Query**
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

### 3. Upgrade User to Super Admin

Run the following SQL query in Supabase SQL Editor to upgrade your user to SUPER_ADMIN:

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from step 2
-- Replace 'your-email@example.com' with your actual email

UPDATE users
SET
  role = 'SUPER_ADMIN',
  email_verified = true,
  verification_token = NULL
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, email_verified
FROM users
WHERE email = 'your-email@example.com';
```

### 4. Alternative: Create Super Admin Directly

If you prefer to create a Super Admin user directly in the database (bypassing signup):

```sql
-- Step 1: First create the user in Supabase Auth through the dashboard or API
-- Then run this query with the Auth User ID

-- Replace these values:
-- - 'AUTH_USER_ID' with the ID from Supabase Auth
-- - 'admin@example.com' with your email
-- - 'Admin' and 'User' with your actual names

INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  email_verified,
  phone,
  verification_token,
  created_at,
  updated_at
) VALUES (
  'AUTH_USER_ID',  -- Must match Supabase Auth user ID
  'admin@example.com',
  '',  -- Empty because Supabase handles password
  'Admin',
  'User',
  'SUPER_ADMIN',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);
```

## Verify Super Admin Creation

After upgrading to Super Admin, verify by running:

```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  email_verified,
  created_at
FROM users
WHERE role = 'SUPER_ADMIN'
ORDER BY created_at DESC;
```

## User Roles Hierarchy

The system has three user roles:

1. **USER** - Regular users (default for all signups)
2. **ADMIN** - Administrators (can manage content and users)
3. **SUPER_ADMIN** - Super Administrators (full system access)

## Security Notes

⚠️ **Important Security Considerations:**

- Only create Super Admin users for trusted individuals
- Use strong passwords for Super Admin accounts
- Enable 2FA if available in Supabase
- Never share Super Admin credentials
- Regularly audit Super Admin accounts
- Only public signups create USER role - Admin roles must be manually assigned

## Email Verification

If you want to bypass email verification for the Super Admin:

```sql
UPDATE users
SET email_verified = true
WHERE email = 'your-email@example.com';
```

## Troubleshooting

### User Not Found
- Make sure you've completed the signup process
- Check that the email matches exactly (case-sensitive)
- Verify the user exists in Supabase Auth

### Login Issues After Upgrade
- Clear browser cache and cookies
- Make sure `email_verified` is set to `true`
- Try logging out and logging back in

### Permission Denied
- Verify you have access to Supabase SQL Editor
- Check database connection settings
- Ensure you have the correct permissions

## Next Steps

After creating your Super Admin:

1. Log in to the application
2. Access the admin dashboard (to be implemented)
3. Create additional admin users if needed
4. Configure system settings
5. Begin managing content and users

## Support

For issues or questions:
- Check application logs
- Review Supabase Auth logs
- Contact the development team

---

**Last Updated:** 2025-11-19
**Version:** 1.0
