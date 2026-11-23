import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';
import { SESSION_COOKIE_NAME } from './constants';

export type SessionData = {
  userId?: string;
};

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) {
    throw new Error('SESSION_PASSWORD must be set to a random string of at least 32 characters.');
  }

  return {
    cookieName: SESSION_COOKIE_NAME,
    password,
    ttl: THIRTY_DAYS_IN_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
