'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export type AuthFormState = { error?: string; email?: string } | undefined;

const emailField = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

const signupSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(200, 'Password is too long.'),
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password.').max(200),
});

// Used so a login for an unknown email takes as long as one with a wrong password.
let dummyHash: Promise<string> | undefined;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };
}

async function startSession(userId: string) {
  const session = await getSession();
  session.userId = userId;
  await session.save();
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = readCredentials(formData);
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, email: raw.email };
  }

  const { email, password } = parsed.data;
  const [created] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!created) {
    return { error: 'An account with that email already exists. Try signing in.', email: raw.email };
  }

  await startSession(created.id);
  redirect('/');
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = readCredentials(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, email: raw.email };
  }

  const { email, password } = parsed.data;
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  dummyHash ??= hashPassword('valere-timing-equalizer');
  const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));

  if (!user || !valid) {
    return { error: 'Incorrect email or password.', email: raw.email };
  }

  await startSession(user.id);
  redirect('/');
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
