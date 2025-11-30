
import { tool } from 'ai';
import { SafeSearchType, search } from 'duck-duck-scrape';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().describe('The search query'),
  search_depth: z.enum(['basic', 'advanced']).default('advanced'),
});

export type SearchResult = {
  title: string;
  url: string;
  description: string;
}[];

export const deepSearch = tool<z.infer<typeof searchSchema>, SearchResult>({
  description: 'Search the web for products, prices, and reviews.',
  inputSchema: searchSchema,
  execute: async ({ query }) => {
    // Retry logic
    for (let i = 0; i < 3; i++) {
      try {
        const response = await search(query, {
          safeSearch: SafeSearchType.MODERATE,
        });

        if (!response.results || response.results.length === 0) {
           continue;
        }

        return response.results.map(r => ({
          title: r.title,
          url: r.url,
          description: r.description,
        })).slice(0, 10); // Limit to top 10
      } catch (error) {
        console.error(`DuckDuckGo search attempt ${i + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    return [];
  },
});
