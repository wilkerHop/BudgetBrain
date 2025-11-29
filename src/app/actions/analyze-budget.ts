'use server';

import { model, SYSTEM_PROMPT } from '@/lib/ai/config';
import { deepSearch } from '@/lib/ai/tools/search';
import { dealValidator } from '@/lib/ai/tools/validator';
import { generateText } from 'ai';

// const prisma = new PrismaClient();

export async function analyzeBudget(userRequest: string, budget: number) {
  try {
    const { text, steps } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `User Request: "${userRequest}"\nBudget: $${budget}\n\nExecute the following steps:\n1. Search for products matching the request.\n2. Verify the price of the top candidates.\n3. Filter out products that are strictly over budget (unless within 10% stretch).\n4. Provide a final recommendation with justification.`,
      tools: {
        deepSearch,
        dealValidator,
      },
      // @ts-expect-error maxSteps is missing from type definition but supported
      maxSteps: 5, // Allow multi-step reasoning
    });

    // In a real app, we would parse the result and save structured data to DB
    // For now, we'll just save the raw text result to a DealDossier
    
    // Note: We need a user ID. For this MVP action, we'll assume a placeholder or pass it in.
    // const dossier = await prisma.dealDossier.create({
    //   data: {
    //     userId: 'placeholder-user-id',
    //     query: userRequest,
    //     // ... other fields
    //   }
    // });

    return { result: text, steps };
  } catch (error) {
    console.error('Budget analysis failed:', error);
    throw new Error('Failed to analyze budget');
  }
}
