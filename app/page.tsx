import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireUser } from '@/lib/auth';
import ChatApp from '@/components/ChatApp';

export default function Page() {
  return (
    <Suspense fallback={<div className="valere-page" />}>
      <AuthenticatedChat />
    </Suspense>
  );
}

// Reads the session cookie, so it must render behind a Suspense boundary
// when Cache Components is enabled. connection() keeps it out of prerendering
// and runtime prefetches entirely: iron-session checks the cookie's expiry
// against the current time, which Next.js rejects during a prerender.
async function AuthenticatedChat() {
  await connection();
  const user = await requireUser();
  return <ChatApp userEmail={user.email} />;
}
