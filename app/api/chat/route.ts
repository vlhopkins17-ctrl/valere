import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, tool, UIMessage } from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';
import { memoryTools } from '@/lib/ai/memory-tools';
import { z } from 'zod';
import { langfuseSpanProcessor } from '@/instrumentation';

export const maxDuration = 60;

export async function POST(req: Request) {
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | undefined;

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const fitnessMcpUrl = process.env.FITNESS_MCP_URL;

    if (!fitnessMcpUrl) {
      return Response.json(
        { error: 'The fitness service is not configured.' },
        { status: 500 },
      );
    }

    const client = await createMCPClient({
      transport: {
        type: 'http',
        url: fitnessMcpUrl,
      },
    });
    mcpClient = client;

    const allMcpTools = await client.tools();

    // Keep read-only lookup tools from MCP; replace direct write tools with HITL confirmation cards
    const { log_meal, log_workout, ...readOnlyFitnessTools } = allMcpTools;

    const hitlTools = {
      confirm_meal_log: tool({
        description:
          'Propose a meal log to the user for visual confirmation and editing before saving to the database. Always call lookup_nutrition_facts first.',
        inputSchema: z.object({
          foodName: z.string().describe('Name or description of the meal'),
          calories: z.number().int().describe('Estimated total calories'),
          proteinGrams: z.number().describe('Protein in grams'),
          carbsGrams: z.number().describe('Carbohydrates in grams'),
          fatGrams: z.number().describe('Fat in grams'),
          mealType: z.string().optional().describe('breakfast, lunch, dinner, or snack'),
        }),
        // No execute function: pauses execution and renders MealConfirmationCard in React!
      }),

      confirm_workout_log: tool({
        description:
          'Propose a workout log to the user for visual confirmation and editing before saving to the database.',
        inputSchema: z.object({
          exercise: z.string().describe('Exercise name'),
          sets: z.number().int().default(1).describe('Number of sets'),
          reps: z.number().int().default(1).describe('Reps per set'),
          weightLbs: z.number().optional().describe('Weight used in pounds'),
          durationMinutes: z.number().int().optional().describe('Duration in minutes'),
          notes: z.string().optional().describe('Optional form or recovery notes'),
        }),
        // No execute function: pauses execution and renders WorkoutConfirmationCard in React!
      }),
    };

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are Valere, an expert personal AI fitness, nutrition, and athletic performance coach with long-term memory.
      - Today's date and time is ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} (America/New_York).
      - Always call 'recallMemories' before giving advice or logging sessions so you respect the user's goals, injuries, and dietary preferences.
      - Whenever the user shares a new preference, injury note, or macro target, call 'saveMemory'.
      - When the user wants to log food, first call 'lookup_nutrition_facts' to verify macros, then call 'confirm_meal_log' to show them an interactive confirmation card.
      - When the user wants to log exercise, call 'confirm_workout_log' to show them an interactive confirmation card.
      - Use 'get_daily_macros' and 'get_recent_workouts' to check totals and suggest progressive overload.`,
      messages: await convertToModelMessages(messages),
      tools: {
        ...memoryTools,
        ...readOnlyFitnessTools,
        ...hitlTools,
      },
      stopWhen: stepCountIs(8),
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'valere-coach-agent',
      },
      onFinish: async () => {
        await client.close();
        await langfuseSpanProcessor.forceFlush();
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('Chat stream failed:', error);
        return 'Unable to generate a response. Please try again.';
      },
    });
  } catch (error) {
    console.error('Chat request failed:', error);

    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch (closeError) {
        console.error('Failed to close the fitness service connection:', closeError);
      }
    }

    return Response.json(
      { error: 'Unable to start the chat. Please try again.' },
      { status: 500 },
    );
  }
}
