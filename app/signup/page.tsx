import type { Metadata } from 'next';
import { signup } from '@/app/actions/auth';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Create account — Valere',
};

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
