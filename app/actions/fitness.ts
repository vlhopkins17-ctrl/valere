'use server';

import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import {
  countTodayWorkouts,
  getTodayMacros,
  insertMeal,
  insertWorkout,
} from '@/lib/fitness-data';

// Server Actions are public endpoints: validate input and take the owner from
// the session, never from the client payload.
const mealSchema = z.object({
  foodName: z.string().trim().min(1).max(200),
  calories: z.number().int().min(0).max(20000),
  proteinGrams: z.number().min(0).max(2000),
  carbsGrams: z.number().min(0).max(2000),
  fatGrams: z.number().min(0).max(2000),
  mealType: z.string().trim().max(50).optional(),
});

const workoutSchema = z.object({
  exercise: z.string().trim().min(1).max(200),
  sets: z.number().int().min(0).max(1000),
  reps: z.number().int().min(0).max(10000),
  weightLbs: z.number().min(0).max(5000).optional(),
  durationMinutes: z.number().int().min(0).max(1440).optional(),
  notes: z.string().max(2000).optional(),
});

export async function saveConfirmedMeal(data: z.input<typeof mealSchema>) {
  const user = await requireUser();
  return insertMeal(user.id, mealSchema.parse(data));
}

export async function saveConfirmedWorkout(data: z.input<typeof workoutSchema>) {
  const user = await requireUser();
  return insertWorkout(user.id, workoutSchema.parse(data));
}

export async function getDailySummary() {
  const user = await requireUser();
  const [macros, workoutsToday] = await Promise.all([
    getTodayMacros(user.id),
    countTodayWorkouts(user.id),
  ]);
  return { ...macros, workoutsToday };
}
