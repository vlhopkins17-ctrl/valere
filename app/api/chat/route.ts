import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, UIMessage } from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import { memoryTools } from '@/lib/ai/memory-tools';
import path from 'path';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Point to your sibling fitness-mcp folder
  const mcpServerDir = path.resolve(process.cwd(), '../fitness-mcp');

  const mcpClient = await createMCPClient({
    transport: {
      type: 'http',
      url: process.env.FITNESS_MCP_URL!,
    },
  });

  try {
    // Fetch all 5 tools from your fitness-mcp server
    const fitnessTools = await mcpClient.tools();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are Valere, an expert personal AI fitness, nutrition, and athletic performance coach with long-term memory.
      - Today's date and time is ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} (America/New_York).
      - Always call 'recallMemories' before giving workout advice, meal recommendations, or logging sessions so you respect the user's goals, injuries, and dietary preferences.
      - Whenever the user shares a new personal preference, injury note, or macro target, call 'saveMemory'.
      - When the user mentions eating food, first call 'lookup_nutrition_facts' to verify macros, then call 'log_meal' to save it to the database.
      - Use 'get_daily_macros', 'log_workout', and 'get_recent_workouts' to track progress and recommend progressive overload.`,
      messages: await convertToModelMessages(messages),
      tools: {
        ...memoryTools,
        ...fitnessTools,
      },
      stopWhen: stepCountIs(8),
      onFinish: async () => {
        await mcpClient.close();
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    await mcpClient.close();
    throw error;
  }
}
