// Data Access Layer for authentication. Every server-side read or write of
// user data must take the user id from here, never from client input.
import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from './session';

export type CurrentUser = {
  id: string;
  email: string;
};

/** Returns the signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { userId } = await getSession();
  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
});

/** Returns the signed-in user, or redirects to /login. Use in pages and Server Actions. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
