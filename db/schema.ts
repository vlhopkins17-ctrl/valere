import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  vector,
  index,
} from 'drizzle-orm/pg-core';

// 1. Existing Qualitative Vector Memory (Preferences, Injuries, Goals)
export const memories = pgTable(
  'memories',
  {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ]
);

// 2. Structured Nutrition & Macro Logs
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  foodName: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  proteinGrams: real('protein_grams').notNull(),
  carbsGrams: real('carbs_grams').notNull(),
  fatGrams: real('fat_grams').notNull(),
  mealType: text('meal_type'), // e.g., breakfast, lunch, dinner, snack
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});

// 3. Structured Workout & Training Logs
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  exercise: text('exercise').notNull(),
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  weightLbs: real('weight_lbs'), // Nullable for bodyweight or cardio
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});