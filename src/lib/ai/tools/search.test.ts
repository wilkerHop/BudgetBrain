import { describe, expect, it, vi } from 'vitest';
import { deepSearch } from './search';

const { mockSearch } = vi.hoisted(() => {
  return { mockSearch: vi.fn() };
});

vi.mock('@tavily/core', () => ({
  tavily: () => ({
    search: mockSearch,
  }),
}));

describe('deepSearch Tool', () => {
  it('should execute search with correct parameters', async () => {
    mockSearch.mockResolvedValue({ results: [{ title: 'Test Product', url: 'http://example.com' }] });

    const result = await deepSearch.execute?.({ query: 'gaming monitor', search_depth: 'basic' }, { toolCallId: '1', messages: [] });
    
    expect(mockSearch).toHaveBeenCalledWith('gaming monitor', {
      search_depth: 'basic',
      include_domains: expect.any(Array),
    });
    expect(result).toEqual([{ title: 'Test Product', url: 'http://example.com' }]);
  });

  it('should handle search errors', async () => {
    mockSearch.mockRejectedValue(new Error('API Error'));

    await expect(deepSearch.execute?.({ query: 'fail', search_depth: 'basic' }, { toolCallId: '1', messages: [] }))
      .resolves.toEqual([]);
  });
});
