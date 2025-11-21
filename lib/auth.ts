import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch user from database to get role and other info
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  // Return combined user with role from database
  return {
    ...user,
    ...dbUser,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}
