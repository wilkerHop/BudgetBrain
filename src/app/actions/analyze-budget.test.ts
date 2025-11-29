import { generateText } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { analyzeBudget } from './analyze-budget';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

// Mock tools to avoid import issues in test environment if needed, 
// but since we are mocking generateText, we just need to ensure analyzeBudget runs.
vi.mock('@/lib/ai/tools/search', () => ({ deepSearch: {} }));
vi.mock('@/lib/ai/tools/validator', () => ({ dealValidator: {} }));
vi.mock('@/lib/ai/config', () => ({ model: {}, SYSTEM_PROMPT: 'prompt' }));

describe('analyzeBudget Action', () => {
  it('should call generateText with correct prompt including budget', async () => {
    (generateText as any).mockResolvedValue({
      text: 'Analysis result',
      steps: [],
    });

    const result = await analyzeBudget('gaming mouse', 100);

    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('Budget: $100'),
    }));
    expect(result).toEqual({ result: 'Analysis result', steps: [] });
  });

  it('should handle errors', async () => {
    (generateText as any).mockRejectedValue(new Error('AI Error'));

    await expect(analyzeBudget('fail', 100)).rejects.toThrow('Failed to analyze budget');
  });
});
