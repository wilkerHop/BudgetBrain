'use server';

import { model, SYSTEM_PROMPT } from '@/lib/ai/config';
import { deepSearch } from '@/lib/ai/tools/search';
import { dealValidator, ValidatorResult } from '@/lib/ai/tools/validator';
import { getCachedResult, setCachedResult } from '@/lib/cache';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { generateText } from 'ai';

export async function analyzeBudget(userRequest: string, budget: number) {
  try {
    // 1. Check Cache
    const cached = await getCachedResult(userRequest, budget);
    if (cached) {
      console.log('Cache hit for:', userRequest);
      return cached;
    }

    // 2. Call AI Agent with Retry Logic
    let text = '';
    let steps: unknown[] = [];
    
    for (let i = 0; i < 3; i++) {
      try {
        const response = await generateText({
          model,
          system: SYSTEM_PROMPT,
          prompt: `User Request: "${userRequest}"\nBudget: $${budget}\n\nExecute the following steps:\n1. Search for products matching the request.\n2. Verify the price of the top candidates.\n3. Filter out products that are strictly over budget (unless within 10% stretch).\n4. Provide a final recommendation with justification.`,
          tools: {
            deepSearch,
            dealValidator,
          },
          maxSteps: 5, // Allow multi-step reasoning
        } as unknown as Parameters<typeof generateText>[0]);
        
        text = response.text;
        steps = response.steps;
        break; // Success
      } catch (error: unknown) {
        console.error(`AI generation attempt ${i + 1} failed:`, error);
        if (i === 2) throw error; // Rethrow on last attempt
        
        // Wait with exponential backoff (2s, 4s, 8s)
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
      }
    }

    // 3. Save to Cache
    await setCachedResult(userRequest, budget, text, steps as unknown as Prisma.InputJsonValue);

    // 4. Persist to DB (DealDossier)
    // Create a placeholder user if not exists (for MVP)
    let user = await db.user.findUnique({ where: { email: 'guest@budgetbrain.ai' } });
    if (!user) {
      user = await db.user.create({ data: { email: 'guest@budgetbrain.ai' } });
    }

    const dossier = await db.dealDossier.create({
      data: {
        userId: user.id,
        query: userRequest,
        // We could parse 'steps' to find found products and save them as VettedProducts here
        // For now, we just save the dossier record.
      }
    });

    // Attempt to extract products from tool results to save VettedProducts
    // Attempt to extract products from tool results to save VettedProducts
    if (steps) {
      for (const step of steps) {
        // Type guard to check if step has toolResults
        if (typeof step === 'object' && step !== null && 'toolResults' in step) {
          const toolResults = (step as { toolResults: unknown[] }).toolResults;
          if (Array.isArray(toolResults)) {
            for (const result of toolResults) {
              if (
                typeof result === 'object' &&
                result !== null &&
                'toolName' in result &&
                'output' in result &&
                (result as { toolName: unknown }).toolName === 'dealValidator'
              ) {
                const val = (result as { output: unknown }).output as ValidatorResult; // ValidatorResult
                if ('url' in val && !('error' in val)) {
                   await db.vettedProduct.create({
                     data: {
                       dossierId: dossier.id,
                       name: val.title || 'Unknown',
                       price: parseFloat(val.price.replace(/[^0-9.]/g, '')) || 0,
                       currency: 'USD', // Assumption
                       url: val.url,
                       verificationScore: val.verified ? 100 : 0,
                       sentimentSummary: 'Pending analysis',
                       budgetGap: budget - (parseFloat(val.price.replace(/[^0-9.]/g, '')) || 0),
                     }
                   });
                }
              }
            }
          }
        }
      }
    }

    return { result: text, steps };
  } catch (error) {
    console.error('Budget analysis failed:', error);
    throw new Error('Failed to analyze budget');
  }
}
