import { describe, it, expect } from 'vitest';
import { base64UrlDecode, decodeToken } from '@/components/JwtDecoder/lib';

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('JWT Decoder', () => {
  describe('base64UrlDecode', () => {
    it('decodes a standard base64url header', () => {
      const result = base64UrlDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result).toEqual({ alg: 'HS256', typ: 'JWT' });
    });

    it('handles base64url characters (- and _)', () => {
      const result = base64UrlDecode('eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
      expect(result).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    });

    it('returns null for invalid input', () => {
      expect(base64UrlDecode('not-valid-json!!!')).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('decodes a valid JWT into header and payload', () => {
      const result = decodeToken(SAMPLE_TOKEN);
      expect(result).not.toBeNull();
      expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
      expect(result.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    });

    it('returns null for a token with wrong number of parts', () => {
      expect(decodeToken('only.two')).toBeNull();
      expect(decodeToken('one')).toBeNull();
    });

    it('returns null for a token with invalid base64url parts', () => {
      expect(decodeToken('invalid.parts.here')).toBeNull();
    });

    it('handles whitespace around the token', () => {
      const result = decodeToken(`  ${SAMPLE_TOKEN}  `);
      expect(result).not.toBeNull();
    });
  });
});
