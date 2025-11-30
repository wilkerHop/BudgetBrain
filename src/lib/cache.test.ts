import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCachedResult, setCachedResult } from './cache';

const { mockFindUnique, mockUpsert } = vi.hoisted(() => {
  return {
    mockFindUnique: vi.fn(),
    mockUpsert: vi.fn(),
  };
});

vi.mock('./db', () => ({
  db: {
    queryCache: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
    },
  },
}));

describe('Cache Library', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFindUnique.mockClear();
    mockUpsert.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getCachedResult', () => {
    it('should return null if no cache entry found', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await getCachedResult('test query', 100);
      expect(result).toBeNull();
    });

    it('should return null if cache entry is stale (> 24h)', async () => {
      const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      mockFindUnique.mockResolvedValue({
        createdAt: staleDate,
        result: 'cached result',
        steps: [],
      });
      const result = await getCachedResult('test query', 100);
      expect(result).toBeNull();
    });

    it('should return result if cache entry is fresh', async () => {
      const freshDate = new Date();
      mockFindUnique.mockResolvedValue({
        createdAt: freshDate,
        result: 'cached result',
        steps: [],
      });
      const result = await getCachedResult('test query', 100);
      expect(result).toEqual({
        result: 'cached result',
        steps: [],
      });
    });
  });

  describe('setCachedResult', () => {
    it('should upsert cache entry', async () => {
      await setCachedResult('test query', 100, 'result', []);
      expect(mockUpsert).toHaveBeenCalled();
    });
  });
});
