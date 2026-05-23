import { describe, it, expect } from 'vitest';
import { encode, decode } from '@/components/Base64/lib';

describe('Base64', () => {
  describe('encode', () => {
    it('encodes ASCII text', () => {
      expect(encode('hello')).toBe('aGVsbG8=');
    });

    it('encodes empty string', () => {
      expect(encode('')).toBe('');
    });

    it('encodes UTF-8 text', () => {
      const result = encode('Héllo');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('decode', () => {
    it('decodes Base64 to ASCII', () => {
      expect(decode('aGVsbG8=')).toBe('hello');
    });

    it('decodes Base64 with whitespace padding', () => {
      expect(decode('  aGVsbG8=  ')).toBe('hello');
    });

    it('returns null for invalid Base64', () => {
      expect(decode('not valid base64!!!')).toBeNull();
    });
  });

  describe('round-trip', () => {
    it('encode → decode returns original ASCII string', () => {
      const str = 'hello world 123';
      expect(decode(encode(str))).toBe(str);
    });

    it('encode → decode returns original UTF-8 string', () => {
      const str = 'Héllo wörld 🌍';
      expect(decode(encode(str))).toBe(str);
    });
  });
});
