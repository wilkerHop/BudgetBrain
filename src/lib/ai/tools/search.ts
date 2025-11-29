/* eslint-disable @typescript-eslint/no-explicit-any */
import { tavily } from '@tavily/core';
import { tool } from 'ai';
import { z } from 'zod';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const searchSchema = z.object({
  query: z.string().describe('The search query'),
  search_depth: z.enum(['basic', 'advanced']).default('advanced'),
});

export const deepSearch = tool({
  description: 'Search the web for products, prices, and reviews.',
  parameters: searchSchema,
  execute: async ({ query, search_depth }: any) => {
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
} as any);
