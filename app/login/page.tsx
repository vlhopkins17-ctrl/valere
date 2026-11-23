import type { Metadata } from 'next';
import { login } from '@/app/actions/auth';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Sign in — Valere',
};

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
