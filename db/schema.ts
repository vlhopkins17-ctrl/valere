import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  vector,
  index,
  uuid,
} from 'drizzle-orm/pg-core';

// 0. Accounts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(), // stored lowercased
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const ownerId = () =>
  uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' });

// 1. Existing Qualitative Vector Memory (Preferences, Injuries, Goals)
export const memories = pgTable(
  'memories',
  {
    id: serial('id').primaryKey(),
    userId: ownerId(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
    index('memories_user_id_idx').on(table.userId),
  ]
);

// 2. Structured Nutrition & Macro Logs
export const meals = pgTable(
  'meals',
  {
    id: serial('id').primaryKey(),
    userId: ownerId(),
    foodName: text('food_name').notNull(),
    calories: integer('calories').notNull(),
    proteinGrams: real('protein_grams').notNull(),
    carbsGrams: real('carbs_grams').notNull(),
    fatGrams: real('fat_grams').notNull(),
    mealType: text('meal_type'), // e.g., breakfast, lunch, dinner, snack
    loggedAt: timestamp('logged_at').defaultNow().notNull(),
  },
  (table) => [index('meals_user_logged_at_idx').on(table.userId, table.loggedAt)]
);

// 3. Structured Workout & Training Logs
export const workouts = pgTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    userId: ownerId(),
    exercise: text('exercise').notNull(),
    sets: integer('sets').notNull(),
    reps: integer('reps').notNull(),
    weightLbs: real('weight_lbs'), // Nullable for bodyweight or cardio
    durationMinutes: integer('duration_minutes'),
    notes: text('notes'),
    loggedAt: timestamp('logged_at').defaultNow().notNull(),
  },
  (table) => [index('workouts_user_logged_at_idx').on(table.userId, table.loggedAt)]
);
