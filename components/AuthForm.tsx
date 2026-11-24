'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import type { AuthFormState } from '@/app/actions/auth';

type AuthFormProps = {
  mode: 'login' | 'signup';
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

const copy = {
  login: {
    title: 'Sign in to Valere',
    submit: 'Sign in',
    pending: 'Signing in…',
    switchPrompt: 'New to Valere?',
    switchLabel: 'Create an account',
    switchHref: '/signup',
    passwordAutocomplete: 'current-password',
  },
  signup: {
    title: 'Create your Valere account',
    submit: 'Create account',
    pending: 'Creating account…',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
    switchHref: '/login',
    passwordAutocomplete: 'new-password',
  },
} as const;

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const text = copy[mode];

  return (
    <div className="valere-page">
      <main className="valere-main">
        <section className="valere-auth" aria-labelledby="auth-title">
          <Image
            src="/brand/wordmark-integrated-on-light.svg"
            alt=""
            aria-hidden="true"
            width={168}
            height={34}
            className="valere-auth-logo valere-logo-light"
          />
          <Image
            src="/brand/wordmark-integrated-on-dark.svg"
            alt=""
            aria-hidden="true"
            width={168}
            height={34}
            className="valere-auth-logo valere-logo-dark"
          />
          <p className="valere-tagline">Be well. Be strong.</p>
          <h1 id="auth-title" className="valere-auth-title">
            {text.title}
          </h1>

          <form className="valere-auth-form" action={formAction}>
            <label className="valere-auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="valere-auth-input"
              autoComplete="email"
              defaultValue={state?.email}
              required
            />

            <label className="valere-auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="valere-auth-input"
              autoComplete={text.passwordAutocomplete}
              minLength={mode === 'signup' ? 8 : undefined}
              required
            />

            {state?.error && (
              <p className="valere-auth-error" role="alert">
                {state.error}
              </p>
            )}

            <button className="valere-auth-submit" type="submit" disabled={pending}>
              {pending ? text.pending : text.submit}
            </button>
          </form>

          <p className="valere-auth-switch">
            {text.switchPrompt} <Link href={text.switchHref}>{text.switchLabel}</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
