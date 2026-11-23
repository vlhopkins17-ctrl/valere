// User-scoped queries for meals and workouts. Every function takes the owner's
// id as its first argument; callers must get it from the session (lib/auth),
// never from client or model input.
import 'server-only';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { meals, workouts } from '@/db/schema';

export type NewMeal = {
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealType?: string;
};

export type NewWorkout = {
  exercise: string;
  sets: number;
  reps: number;
  weightLbs?: number;
  durationMinutes?: number;
  notes?: string;
};

const startOfToday = sql`CURRENT_DATE`;

export async function insertMeal(userId: string, data: NewMeal) {
  const [row] = await db
    .insert(meals)
    .values({
      userId,
      foodName: data.foodName,
      calories: data.calories,
      proteinGrams: data.proteinGrams,
      carbsGrams: data.carbsGrams,
      fatGrams: data.fatGrams,
      mealType: data.mealType ?? null,
    })
    .returning({ id: meals.id });
  return row;
}

export async function insertWorkout(userId: string, data: NewWorkout) {
  const [row] = await db
    .insert(workouts)
    .values({
      userId,
      exercise: data.exercise,
      sets: data.sets,
      reps: data.reps,
      weightLbs: data.weightLbs ?? null,
      durationMinutes: data.durationMinutes ?? null,
      notes: data.notes ?? null,
    })
    .returning({ id: workouts.id });
  return row;
}

export async function getTodayMacros(userId: string) {
  const [row] = await db
    .select({
      calories: sql<number>`COALESCE(SUM(${meals.calories}), 0)::int`,
      protein: sql<number>`COALESCE(SUM(${meals.proteinGrams}), 0)::float`,
      carbs: sql<number>`COALESCE(SUM(${meals.carbsGrams}), 0)::float`,
      fat: sql<number>`COALESCE(SUM(${meals.fatGrams}), 0)::float`,
    })
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.loggedAt, startOfToday)));

  return {
    calories: row?.calories ?? 0,
    protein: Math.round(row?.protein ?? 0),
    carbs: Math.round(row?.carbs ?? 0),
    fat: Math.round(row?.fat ?? 0),
  };
}

export async function countTodayWorkouts(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), gte(workouts.loggedAt, startOfToday)));
  return row?.count ?? 0;
}

export async function getRecentWorkouts(userId: string, limit = 10) {
  return db
    .select({
      exercise: workouts.exercise,
      sets: workouts.sets,
      reps: workouts.reps,
      weightLbs: workouts.weightLbs,
      durationMinutes: workouts.durationMinutes,
      notes: workouts.notes,
      loggedAt: workouts.loggedAt,
    })
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.loggedAt))
    .limit(limit);
}
