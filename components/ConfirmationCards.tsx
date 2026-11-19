'use client';

import { useState } from 'react';
import { saveConfirmedMeal, saveConfirmedWorkout } from '@/app/actions/fitness';

export function MealConfirmationCard({
  toolCallId,
  initialData,
  onComplete,
}: {
  toolCallId: string;
  initialData?: {
    foodName: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    mealType?: string;
  };
  onComplete: (toolCallId: string, output: string) => void;
}) {
  const [form, setForm] = useState({
    foodName: initialData?.foodName ?? '',
    calories: initialData?.calories ?? 0,
    proteinGrams: initialData?.proteinGrams ?? 0,
    carbsGrams: initialData?.carbsGrams ?? 0,
    fatGrams: initialData?.fatGrams ?? 0,
    mealType: initialData?.mealType,
  });
  const [status, setStatus] = useState<'pending' | 'saving' | 'saved' | 'cancelled'>('pending');

  const handleConfirm = async () => {
    setStatus('saving');
    try {
      const saved = await saveConfirmedMeal(form);
      setStatus('saved');
      onComplete(
        toolCallId,
        `User confirmed and saved meal #${saved.id}: ${form.foodName} (${form.calories} kcal, ${form.proteinGrams}g protein, ${form.carbsGrams}g carbs, ${form.fatGrams}g fat).`
      );
    } catch {
      setStatus('pending');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
    onComplete(toolCallId, 'User cancelled logging this meal.');
  };

  if (status === 'saved') {
    return (
      <div className="my-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-sm">
        <div className="font-semibold text-emerald-700 dark:text-emerald-300">
          ✓ Meal Logged: {form.foodName}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {form.calories} kcal • {form.proteinGrams}g P • {form.carbsGrams}g C • {form.fatGrams}g F
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="my-3 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500">
        ✕ Meal log cancelled ({form.foodName})
      </div>
    );
  }

  return (
    <div className="my-3 p-4 rounded-xl border border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Confirm Meal Log
        </span>
        {form.mealType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {form.mealType}
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Food / Meal</label>
        <input
          type="text"
          value={form.foodName}
          onChange={(e) => setForm({ ...form, foodName: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Calories</label>
          <input
            type="number"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
          <input
            type="number"
            value={form.proteinGrams}
            onChange={(e) => setForm({ ...form, proteinGrams: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
          <input
            type="number"
            value={form.carbsGrams}
            onChange={(e) => setForm({ ...form, carbsGrams: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
          <input
            type="number"
            value={form.fatGrams}
            onChange={(e) => setForm({ ...form, fatGrams: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === 'saving'}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={status === 'saving'}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving...' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  );
}

export function WorkoutConfirmationCard({
  toolCallId,
  initialData,
  onComplete,
}: {
  toolCallId: string;
  initialData?: {
    exercise: string;
    sets: number;
    reps: number;
    weightLbs?: number;
    durationMinutes?: number;
    notes?: string;
  };
  onComplete: (toolCallId: string, output: string) => void;
}) {
  const [form, setForm] = useState({
    exercise: initialData?.exercise ?? '',
    sets: initialData?.sets ?? 1,
    reps: initialData?.reps ?? 1,
    weightLbs: initialData?.weightLbs,
    durationMinutes: initialData?.durationMinutes,
    notes: initialData?.notes,
  });
  const [status, setStatus] = useState<'pending' | 'saving' | 'saved' | 'cancelled'>('pending');

  const handleConfirm = async () => {
    setStatus('saving');
    try {
      const saved = await saveConfirmedWorkout(form);
      setStatus('saved');
      onComplete(
        toolCallId,
        `User confirmed and saved workout #${saved.id}: ${form.exercise} (${form.sets}x${form.reps}${
          form.weightLbs ? ` @ ${form.weightLbs} lbs` : ''
        }).`
      );
    } catch {
      setStatus('pending');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
    onComplete(toolCallId, 'User cancelled logging this workout.');
  };

  if (status === 'saved') {
    return (
      <div className="my-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-sm">
        <div className="font-semibold text-emerald-700 dark:text-emerald-300">
          ✓ Workout Logged: {form.exercise}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {form.sets} sets × {form.reps} reps {form.weightLbs ? `@ ${form.weightLbs} lbs` : ''}
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="my-3 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500">
        ✕ Workout log cancelled ({form.exercise})
      </div>
    );
  }

  return (
    <div className="my-3 p-4 rounded-xl border border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
        Confirm Workout Log
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Exercise</label>
        <input
          type="text"
          value={form.exercise}
          onChange={(e) => setForm({ ...form, exercise: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sets</label>
          <input
            type="number"
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Reps</label>
          <input
            type="number"
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Weight (lbs)</label>
          <input
            type="number"
            value={form.weightLbs ?? ''}
            onChange={(e) =>
              setForm({ ...form, weightLbs: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === 'saving'}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={status === 'saving'}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving...' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  );
}
