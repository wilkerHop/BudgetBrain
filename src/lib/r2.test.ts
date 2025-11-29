import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublicUrl, uploadImage } from './r2';

// Mock S3Client
vi.mock('@aws-sdk/client-s3', () => {
  const sendMock = vi.fn();
  return {
    S3Client: vi.fn(() => ({
      send: sendMock,
    })),
    PutObjectCommand: vi.fn(),
  };
});

describe('R2 Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload image successfully', async () => {
    const key = 'test-image.jpg';
    const body = Buffer.from('test');
    const contentType = 'image/jpeg';

    const result = await uploadImage(key, body, contentType);
    expect(result).toBe(key);
  });

  it('should generate public URL if domain is set', () => {
    process.env.R2_PUBLIC_DOMAIN = 'https://assets.example.com';
    const key = 'test.jpg';
    expect(getPublicUrl(key)).toBe('https://assets.example.com/test.jpg');
  });

  it('should return null for public URL if domain is not set', () => {
    delete process.env.R2_PUBLIC_DOMAIN;
    const key = 'test.jpg';
    expect(getPublicUrl(key)).toBeNull();
  });
});
