'use client';

import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useEffect, useState } from 'react';
import { MealConfirmationCard, WorkoutConfirmationCard } from '@/components/ConfirmationCards';
import { DailySummaryHeader, DailyStats } from '@/components/DailySummaryHeader';
import { getDailySummary } from '@/app/actions/fitness';

export default function ChatPage() {
  const { messages, sendMessage, addToolOutput, status } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workoutsToday: 0,
  });

  const refreshStats = async () => {
    const latest = await getDailySummary();
    setStats(latest);
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-xl py-8 mx-auto stretch px-4">
      <h1 className="text-2xl font-bold mb-4">Valere — AI Fitness & Nutrition Coach</h1>

      <DailySummaryHeader stats={stats} />

      <div className="space-y-4 mb-24">
        {messages.map((m) => (
          <div key={m.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-1">
              {m.role === 'user' ? 'You' : 'Valere'}
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {m.parts.map((part: any, i: number) => {
                if (part.type === 'text') {
                  return <span key={i}>{part.text}</span>;
                }

                if (part.type === 'tool-confirm_meal_log') {
                  if (!part.input || part.state === 'input-streaming') {
                    return (
                      <div
                        key={part.toolCallId}
                        className="my-2 p-3 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-500/30 text-blue-600 dark:text-blue-400"
                      >
                        Preparing meal confirmation card...
                      </div>
                    );
                  }

                  return (
                    <MealConfirmationCard
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      initialData={part.input}
                      onComplete={async (id, output) => {
                        await refreshStats();
                        addToolOutput({ tool: 'confirm_meal_log', toolCallId: id, output });
                      }}
                    />
                  );
                }

                if (part.type === 'tool-confirm_workout_log') {
                  if (!part.input || part.state === 'input-streaming') {
                    return (
                      <div
                        key={part.toolCallId}
                        className="my-2 p-3 text-xs font-mono bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-400"
                      >
                        Preparing workout confirmation card...
                      </div>
                    );
                  }

                  return (
                    <WorkoutConfirmationCard
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      initialData={part.input}
                      onComplete={async (id, output) => {
                        await refreshStats();
                        addToolOutput({ tool: 'confirm_workout_log', toolCallId: id, output });
                      }}
                    />
                  );
                }

                if (part.type.startsWith('tool-')) {
                  return (
                    <div
                      key={i}
                      className="my-2 p-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded text-blue-600 dark:text-blue-400"
                    >
                      ⚙ Calling tool: {part.type.replace('tool-', '')}...
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex gap-2"
      >
        <input
          className="flex-1 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
          value={input}
          placeholder="Log a meal or workout (e.g., 'I had 2 eggs and toast' or '3x10 squats at 135 lbs')..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={status !== 'ready'}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
