import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, UIMessage } from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import { memoryTools } from '@/lib/ai/memory-tools';
import path from 'path';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Point to your sibling google-calendar-mcp folder
  const mcpServerDir = path.resolve(process.cwd(), '../google-calendar-mcp');

  const mcpClient = await createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: 'node',
      args: ['--import', 'tsx', 'src/index.ts'],
      cwd: mcpServerDir,
    }),
  });

  try {
    const calendarTools = await mcpClient.tools();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are Muse, a personal executive assistant with long-term memory and Google Calendar access.
      - Today's date and time is ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} (America/New_York).
      - Always call 'recallMemories' before scheduling or answering personal questions so you respect the user's preferences (such as preferred meeting times).
      - Whenever the user shares a new personal preference, fact, or ongoing project detail, call 'saveMemory'.
      - Use 'list_upcoming_events' and 'create_calendar_event' to manage the user's schedule.`,
      messages: await convertToModelMessages(messages),
      tools: {
        ...memoryTools,
        ...calendarTools,
      },
      stopWhen: stepCountIs(6),
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
