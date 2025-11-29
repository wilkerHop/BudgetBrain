import { afterEach, describe, expect, it, vi } from 'vitest';
import { dealValidator } from './validator';

const { mockPage, mockBrowser } = vi.hoisted(() => {
  const page = {
    goto: vi.fn(),
    title: vi.fn(),
    content: vi.fn(),
  };
  const browser = {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn(),
  };
  return { mockPage: page, mockBrowser: browser };
});

vi.mock('puppeteer-core', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(mockBrowser),
  },
}));

describe('dealValidator Tool', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should validate deal successfully', async () => {
    mockPage.title.mockResolvedValue('Product Page');
    mockPage.content.mockResolvedValue('<html><body>Price: $199.99</body></html>');

    const result = await dealValidator.execute?.({ url: 'http://example.com/product' }, { toolCallId: '1', messages: [] });

    expect(result).toEqual({
      title: 'Product Page',
      price: '$199.99',
      verified: true,
      url: 'http://example.com/product',
    });
  });

  it('should handle scraping errors', async () => {
    mockPage.goto.mockRejectedValue(new Error('Navigation Error'));

    const result = await dealValidator.execute?.({ url: 'http://fail.com' }, { toolCallId: '1', messages: [] });
    
    expect(result).toEqual({ error: 'Failed to verify deal' });
  });
});
