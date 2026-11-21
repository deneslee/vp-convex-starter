import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createClientId } from './ids';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('createClientId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates a valid UUID v4 string using runtime Web Crypto', () => {
    const id = createClientId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('generates unique IDs across consecutive calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      ids.add(createClientId());
    }
    expect(ids.size).toBe(100);
  });

  it('delegates to globalThis.crypto.randomUUID when available', () => {
    const mockUuid = '11111111-2222-4333-8444-555555555555';
    const randomUUID = vi.fn(() => mockUuid);
    vi.stubGlobal('crypto', { randomUUID });

    expect(createClientId()).toBe(mockUuid);
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('falls back to RFC 4122 v4 formatting via getRandomValues when randomUUID is absent', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = i;
      }
      return bytes;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    const id = createClientId();
    expect(getRandomValues).toHaveBeenCalledTimes(1);
    expect(id).toMatch(UUID_V4_REGEX);
    expect(id).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
  });

  it('throws a descriptive error when Web Crypto API is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => createClientId()).toThrow(/Web Crypto API is unavailable/i);
  });
});
