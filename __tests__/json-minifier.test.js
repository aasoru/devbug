import { describe, it, expect } from 'vitest';
import { minify, prettify, sizeChange, utf8Bytes } from '@/components/JsonMinifier/lib';

describe('JSON Minifier', () => {
  describe('minify', () => {
    it('removes whitespace from JSON', () => {
      expect(minify('{ "a": 1 }')).toBe('{"a":1}');
    });

    it('handles nested objects', () => {
      expect(minify('{ "a": { "b": 2 } }')).toBe('{"a":{"b":2}}');
    });

    it('handles arrays', () => {
      expect(minify('[ 1, 2, 3 ]')).toBe('[1,2,3]');
    });

    it('throws on invalid JSON', () => {
      expect(() => minify('not json')).toThrow();
    });
  });

  describe('prettify', () => {
    it('formats minified JSON with 2-space indent', () => {
      expect(prettify('{"a":1}')).toBe('{\n  "a": 1\n}');
    });

    it('formats nested objects', () => {
      const result = prettify('{"a":{"b":2}}');
      expect(result).toBe('{\n  "a": {\n    "b": 2\n  }\n}');
    });

    it('throws on invalid JSON', () => {
      expect(() => prettify('not json')).toThrow();
    });
  });

  describe('round-trip', () => {
    it('prettify → minify returns original minified JSON', () => {
      const original = '{"a":1,"b":[1,2,3],"c":{"d":true}}';
      expect(minify(prettify(original))).toBe(original);
    });
  });
  describe('utf8Bytes', () => {
    it('matches TextEncoder: 1 to 4 bytes per character', () => {
      for (const str of ['', 'a', '{"a":1}', 'ñandú', '€', '中文', '😀', 'a😀b', '\ud800', '\udc00', 'x\udc00\ud800']) {
        expect(utf8Bytes(str)).toBe(new TextEncoder().encode(str).length);
      }
    });

    it('matches TextEncoder on random text across the whole BMP', () => {
      let seed = 1;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let n = 0; n < 500; n++) {
        const str = Array.from({ length: 20 }, () => String.fromCharCode(Math.floor(rnd() * 0x10000))).join('');
        expect(utf8Bytes(str)).toBe(new TextEncoder().encode(str).length);
      }
    });
  });

  describe('sizeChange', () => {
    it('is the whole percent saved, negative when larger', () => {
      expect(sizeChange(39, 31)).toBe(21);
      expect(sizeChange(39, 53)).toBe(-36);
      expect(sizeChange(7, 7)).toBe(0);
    });

    it('is null without both sizes', () => {
      expect(sizeChange(0, 10)).toBeNull();
      expect(sizeChange(10, 0)).toBeNull();
    });
  });
});
