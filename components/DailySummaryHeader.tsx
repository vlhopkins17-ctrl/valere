'use client';

export type DailyStats = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  workoutsToday: number;
};

export function DailySummaryHeader({ stats }: { stats: DailyStats }) {
  return (
    <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Today&apos;s Performance Summary
        </span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          {stats.workoutsToday} {stats.workoutsToday === 1 ? 'Workout' : 'Workouts'} Logged
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold">{stats.calories}</div>
          <div className="text-[11px] text-gray-500">Calories</div>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.protein}g</div>
          <div className="text-[11px] text-gray-500">Protein</div>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.carbs}g</div>
          <div className="text-[11px] text-gray-500">Carbs</div>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.fat}g</div>
          <div className="text-[11px] text-gray-500">Fat</div>
        </div>
      </div>
    </div>
  );
}
