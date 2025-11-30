import { SafeSearchType } from 'duck-duck-scrape';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deepSearch } from './search';

const { mockSearch } = vi.hoisted(() => {
  return { mockSearch: vi.fn() };
});

vi.mock('duck-duck-scrape', () => ({
  search: mockSearch,
  SafeSearchType: { MODERATE: 1 },
}));

describe('deepSearch Tool', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSearch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute search with correct parameters', async () => {
    mockSearch.mockResolvedValue({ results: [{ title: 'Test Product', url: 'http://example.com', description: 'Desc' }] });

    const result = await deepSearch.execute?.({ query: 'gaming monitor', search_depth: 'advanced' }, { toolCallId: '1', messages: [] });
    
    expect(mockSearch).toHaveBeenCalledWith('gaming monitor', {
      safeSearch: SafeSearchType.MODERATE,
    });
    expect(result).toEqual([{ title: 'Test Product', url: 'http://example.com', description: 'Desc' }]);
  });

  it('should retry on failure and eventually return empty array', async () => {
    mockSearch.mockRejectedValue(new Error('API Error'));

    const promise = deepSearch.execute?.({ query: 'fail', search_depth: 'advanced' }, { toolCallId: '1', messages: [] });
    
    // Fast-forward through retries
    await vi.runAllTimersAsync();
    
    const result = await promise;

    expect(mockSearch).toHaveBeenCalledTimes(3);
    expect(result).toEqual([]);
  });
});
