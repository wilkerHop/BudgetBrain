import { generateText } from 'ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeBudget } from './analyze-budget';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

// Mock tools to avoid import issues in test environment if needed, 
// but since we are mocking generateText, we just need to ensure analyzeBudget runs.
vi.mock('@/lib/ai/tools/search', () => ({ deepSearch: {} }));
vi.mock('@/lib/ai/tools/validator', () => ({ dealValidator: {} }));
vi.mock('@/lib/ai/config', () => ({ model: {}, SYSTEM_PROMPT: 'prompt' }));
vi.mock('@/lib/cache', () => ({
  getCachedResult: vi.fn(),
  setCachedResult: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    dealDossier: {
      create: vi.fn().mockResolvedValue({ id: 'dossier-id' }),
    },
    vettedProduct: {
      create: vi.fn(),
    },
  },
}));

describe('analyzeBudget Action', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (generateText as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call generateText with correct prompt including budget', async () => {
    (generateText as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      text: 'Analysis result',
      steps: [],
    });

    const { db } = await import('@/lib/db');
    (db.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-id' });

    const result = await analyzeBudget('gaming mouse', 100);

    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('Budget: $100'),
    }));
    expect(result).toEqual({ result: 'Analysis result', steps: [] });
  });

  it('should retry on error and eventually fail', async () => {
    (generateText as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('AI Error'));

    const promise = analyzeBudget('fail', 100);
    
    // Fast-forward through retries
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Failed to analyze budget');
    expect(generateText).toHaveBeenCalledTimes(3);
  });
});
