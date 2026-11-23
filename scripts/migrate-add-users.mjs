// One-time migration: adds the users table, creates an owner account, and
// assigns every existing meal, workout, and memory to that owner before
// making user_id NOT NULL. Runs in a single transaction; safe to abort.
//
// Usage:
//   node --env-file=.env.local scripts/migrate-add-users.mjs you@example.com
//
// You'll be prompted for the owner's password (min 8 characters).
// Constraint and index names match db/schema.ts so `drizzle-kit push` sees no diff afterwards.

import { neon } from '@neondatabase/serverless';
import { randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

// Must match lib/auth/password.ts
async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: node --env-file=.env.local scripts/migrate-add-users.mjs you@example.com');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question(`Password for ${email}: `);
rl.close();
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const ownerId = randomUUID();
const passwordHash = await hashPassword(password);

const scopedTable = (table, indexSql) => [
  sql.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS user_id uuid`),
  sql.query(`UPDATE ${table} SET user_id = $1 WHERE user_id IS NULL`, [ownerId]),
  sql.query(`ALTER TABLE ${table} ALTER COLUMN user_id SET NOT NULL`),
  sql.query(
    `ALTER TABLE ${table} ADD CONSTRAINT ${table}_user_id_users_id_fk
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
  ),
  sql.query(indexSql),
];

const results = await sql.transaction([
  sql.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      password_hash text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      CONSTRAINT users_email_unique UNIQUE (email)
    )`),
  sql.query(`INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`, [
    ownerId,
    email,
    passwordHash,
  ]),
  ...scopedTable('meals', 'CREATE INDEX IF NOT EXISTS meals_user_logged_at_idx ON meals (user_id, logged_at)'),
  ...scopedTable('workouts', 'CREATE INDEX IF NOT EXISTS workouts_user_logged_at_idx ON workouts (user_id, logged_at)'),
  ...scopedTable('memories', 'CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories (user_id)'),
  sql.query(`
    SELECT (SELECT count(*) FROM meals WHERE user_id = $1) AS meals,
           (SELECT count(*) FROM workouts WHERE user_id = $1) AS workouts,
           (SELECT count(*) FROM memories WHERE user_id = $1) AS memories`, [ownerId]),
]);

console.log(`Created ${email} and assigned existing rows:`, results.at(-1)[0]);
