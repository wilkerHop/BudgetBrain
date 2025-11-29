import { tavily } from '@tavily/core';
import { tool } from 'ai';
import { z } from 'zod';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const searchSchema = z.object({
  query: z.string().describe('The search query'),
  search_depth: z.enum(['basic', 'advanced']).default('advanced'),
});

export type SearchResult = Awaited<ReturnType<typeof tvly.search>>['results'];

export const deepSearch = tool<z.infer<typeof searchSchema>, SearchResult>({
  description: 'Search the web for products, prices, and reviews.',
  inputSchema: searchSchema,
  execute: async ({ query, search_depth }) => {
    try {
      const response = await tvly.search(query, {
        search_depth,
        include_domains: ['amazon.com', 'bestbuy.com', 'reddit.com', 'rtings.com', 'tomshardware.com'],
      });
      return response.results;
    } catch (error) {
      console.error('Tavily search error:', error);
      return [];
    }
  },
});
