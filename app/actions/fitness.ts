'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function saveConfirmedMeal(data: {
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealType?: string;
}) {
  const rows = await sql`
    INSERT INTO meals (food_name, calories, protein_grams, carbs_grams, fat_grams, meal_type)
    VALUES (${data.foodName}, ${data.calories}, ${data.proteinGrams}, ${data.carbsGrams}, ${data.fatGrams}, ${data.mealType ?? null})
    RETURNING id, food_name, calories, protein_grams
  `;
  return rows[0];
}

export async function saveConfirmedWorkout(data: {
  exercise: string;
  sets: number;
  reps: number;
  weightLbs?: number;
  durationMinutes?: number;
  notes?: string;
}) {
  const rows = await sql`
    INSERT INTO workouts (exercise, sets, reps, weight_lbs, duration_minutes, notes)
    VALUES (${data.exercise}, ${data.sets}, ${data.reps}, ${data.weightLbs ?? null}, ${data.durationMinutes ?? null}, ${data.notes ?? null})
    RETURNING id, exercise, sets, reps, weight_lbs
  `;
  return rows[0];
}

export async function getDailySummary() {
  const [macroRow] = await sql`
    SELECT
      COALESCE(SUM(calories), 0)::int AS calories,
      COALESCE(SUM(protein_grams), 0)::float AS protein,
      COALESCE(SUM(carbs_grams), 0)::float AS carbs,
      COALESCE(SUM(fat_grams), 0)::float AS fat
    FROM meals
    WHERE logged_at >= CURRENT_DATE
  `;

  const [workoutRow] = await sql`
    SELECT COUNT(*)::int AS count
    FROM workouts
    WHERE logged_at >= CURRENT_DATE
  `;

  return {
    calories: macroRow?.calories ?? 0,
    protein: Math.round(macroRow?.protein ?? 0),
    carbs: Math.round(macroRow?.carbs ?? 0),
    fat: Math.round(macroRow?.fat ?? 0),
    workoutsToday: workoutRow?.count ?? 0,
  };
}
