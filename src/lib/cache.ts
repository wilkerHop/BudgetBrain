import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { db } from './db';

function generateQueryHash(query: string, budget: number): string {
  const normalizedQuery = query.toLowerCase().trim();
  // Bucket budget to nearest $10 to increase cache hits
  const bucketedBudget = Math.floor(budget / 10) * 10;
  return crypto.createHash('sha256').update(`${normalizedQuery}-${bucketedBudget}`).digest('hex');
}

export async function getCachedResult(query: string, budget: number) {
  const hash = generateQueryHash(query, budget);
  const cacheEntry = await db.queryCache.findUnique({
    where: { queryHash: hash },
  });

  if (cacheEntry) {
    // Check if cache is fresh (e.g., < 24 hours)
    const isFresh = (Date.now() - cacheEntry.createdAt.getTime()) < 24 * 60 * 60 * 1000;
    if (isFresh) {
      return {
        result: cacheEntry.result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        steps: cacheEntry.steps as unknown as any[], // Cast JSON to unknown then to expected type (or define Step type)
      };
    }
  }
  return null;
}

export async function setCachedResult(query: string, budget: number, result: string, steps: Prisma.InputJsonValue) {
  const hash = generateQueryHash(query, budget);
  
  await db.queryCache.upsert({
    where: { queryHash: hash },
    update: {
      result,
      steps,
      updatedAt: new Date(),
    },
    create: {
      queryHash: hash,
      query,
      budget,
      result,
      steps,
    },
  });
}
