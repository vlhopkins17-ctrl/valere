import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

// Optimistic check only: sends visitors without a session cookie to /login.
// The real authorization happens in lib/auth (getCurrentUser / requireUser),
// which every page, Server Action, and Route Handler that touches user data calls.
const PUBLIC_PATHS = new Set(['/login', '/signup']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Pages only: API routes return 401 themselves; skip static assets and images.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
