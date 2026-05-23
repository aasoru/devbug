import { describe, it, expect } from 'vitest';
import { bitsToOctal, bitsToSymbol, toChmodString } from '@/lib/chmod';

describe('CHMOD', () => {
  describe('bitsToOctal', () => {
    it('returns 7 for rwx', () => {
      expect(bitsToOctal(true, true, true)).toBe(7);
    });

    it('returns 6 for rw-', () => {
      expect(bitsToOctal(true, true, false)).toBe(6);
    });

    it('returns 5 for r-x', () => {
      expect(bitsToOctal(true, false, true)).toBe(5);
    });

    it('returns 4 for r--', () => {
      expect(bitsToOctal(true, false, false)).toBe(4);
    });

    it('returns 2 for -w-', () => {
      expect(bitsToOctal(false, true, false)).toBe(2);
    });

    it('returns 1 for --x', () => {
      expect(bitsToOctal(false, false, true)).toBe(1);
    });

    it('returns 0 for ---', () => {
      expect(bitsToOctal(false, false, false)).toBe(0);
    });
  });

  describe('bitsToSymbol', () => {
    it('returns "rwx" for all permissions', () => {
      expect(bitsToSymbol(true, true, true)).toBe('rwx');
    });

    it('returns "r--" for read-only', () => {
      expect(bitsToSymbol(true, false, false)).toBe('r--');
    });

    it('returns "---" for no permissions', () => {
      expect(bitsToSymbol(false, false, false)).toBe('---');
    });

    it('returns "rw-" for read-write', () => {
      expect(bitsToSymbol(true, true, false)).toBe('rw-');
    });
  });

  describe('toChmodString', () => {
    it('builds 755 string', () => {
      expect(toChmodString(7, 5, 5)).toBe('755');
    });

    it('builds 644 string', () => {
      expect(toChmodString(6, 4, 4)).toBe('644');
    });

    it('builds 777 string', () => {
      expect(toChmodString(7, 7, 7)).toBe('777');
    });

    it('builds 000 string', () => {
      expect(toChmodString(0, 0, 0)).toBe('000');
    });
  });
});
