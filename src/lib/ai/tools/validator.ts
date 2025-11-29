import { tool } from 'ai';
/* eslint-disable @typescript-eslint/no-explicit-any */
import puppeteer from 'puppeteer-core';
import { z } from 'zod';

const validatorSchema = z.object({
  url: z.string().describe('The URL of the product page'),
});

export const dealValidator = tool({
  description: 'Visit a product URL to verify the current price and availability.',
  parameters: validatorSchema,
  execute: async ({ url }: any) => {
    let browser;
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Basic scraping logic - this would need to be more robust for real e-commerce sites
      // For now, we'll extract the title and try to find a price
      const title = await page.title();
      const content = await page.content();
      
      // Very naive price extraction for demonstration
      const priceMatch = content.match(/[\$£€](\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
      const price = priceMatch ? priceMatch[0] : 'Price not found';

      return {
        title,
        price,
        verified: !!priceMatch,
        url,
      };
    } catch (error) {
      console.error('Browserless scraping error:', error);
      return { error: 'Failed to verify deal' };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
} as any);
