//handles converting text into vectors and finding the closest 
// matching memories in Postgres using cosine similarity.

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { memories } from '@/db/schema';

const embeddingModel = openai.embedding('text-embedding-3-small');

export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

export async function findRelevantMemories(userQuery: string) {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  // Calculate cosine similarity (1 - cosineDistance)
  const similarity = sql<number>`1 - (${cosineDistance(
    memories.embedding,
    userQueryEmbedded
  )})`;

  const similarMemories = await db
    .select({ content: memories.content, similarity })
    .from(memories)
    .where(gt(similarity, 0.5)) // Only return reasonably relevant matches
    .orderBy((t) => desc(t.similarity))
    .limit(5);

  return similarMemories;
}
