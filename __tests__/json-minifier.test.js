import { describe, it, expect } from 'vitest';
import { minify, prettify } from '@/components/JsonMinifier/lib';

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
});
