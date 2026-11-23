// User-scoped replacements for the fitness MCP server's read tools. The MCP
// versions query the shared tables without a user filter, so they would leak
// other users' logs into the conversation.

import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { countTodayWorkouts, getRecentWorkouts, getTodayMacros } from '@/lib/fitness-data';

export function createFitnessTools(userId: string) {
  return {
    get_daily_macros: tool({
      description:
        'Calculate total calories, protein, carbs, and fat the user has logged today, plus how many workouts they have logged today.',
      inputSchema: z.object({}),
      execute: async () => {
        const [macros, workoutsToday] = await Promise.all([
          getTodayMacros(userId),
          countTodayWorkouts(userId),
        ]);
        return { ...macros, workoutsToday };
      },
    }),

    get_recent_workouts: tool({
      description:
        "Fetch the user's last 10 logged workouts to review training history and suggest progressive overload.",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await getRecentWorkouts(userId, 10);
        return rows.map((w) => ({ ...w, loggedAt: w.loggedAt.toISOString() }));
      },
    }),
  };
}
