# valere
personal health, fitness and nutrition tracker

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Authentication

Users sign up and sign in with email and password at `/signup` and `/login`. Meals, workouts, and memories are stored with a `user_id` and every query is filtered by the signed-in user (see `lib/auth` and `lib/fitness-data.ts`).

Set a session secret of at least 32 characters in `.env.local` and in your deployment environment:

```bash
SESSION_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
```

**Upgrading an existing database** (data logged before auth existed): run the one-time migration, which creates an owner account and assigns all existing rows to it:

```bash
node --env-file=.env.local scripts/migrate-add-users.mjs you@example.com
```

For a fresh database, `npx drizzle-kit push` is enough.

### Development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
