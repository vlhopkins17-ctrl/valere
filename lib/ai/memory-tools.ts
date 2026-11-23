// these are the two tools the LLM will autonomously decide to call when
// you share facts or ask questions. They are bound to the signed-in user, so
// the model can never read or write another user's memories.

import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/db';
import { memories } from '@/db/schema';
import { generateEmbedding, findRelevantMemories } from './embedding';

export function createMemoryTools(userId: string) {
  return {
    saveMemory: tool({
      description:
        'Save a permanent fact, user preference, project detail, or important note to long-term memory whenever the user shares information worth remembering for future conversations.',
      inputSchema: z.object({
        content: z
          .string()
          .describe('A clear, standalone sentence describing the fact or preference to remember.'),
      }),
      execute: async ({ content }) => {
        const embedding = await generateEmbedding(content);
        await db.insert(memories).values({
          userId,
          content,
          embedding,
        });
        return `Saved to memory: "${content}"`;
      },
    }),

    recallMemories: tool({
      description:
        'Search long-term memory for facts, preferences, or past notes relevant to the user request. Always call this before answering questions about the user or their projects.',
      inputSchema: z.object({
        query: z
          .string()
          .describe('The search query or topic to look up in long-term memory.'),
      }),
      execute: async ({ query }) => {
        const results = await findRelevantMemories(userId, query);
        if (results.length === 0) {
          return 'No relevant memories found.';
        }
        return results.map((r) => `- ${r.content}`).join('\n');
      },
    }),
  };
}
