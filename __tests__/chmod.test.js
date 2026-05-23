import { describe, it, expect } from 'vitest';
import {
  bitsToOctal, bitsToSymbol, toChmodString,
  toOctalString, toPermString, parseOctal, parseSymbolic, describePerms,
  EMPTY_PERMS,
} from '@/lib/chmod';

describe('CHMOD', () => {
  describe('bitsToOctal', () => {
    it('returns 7 for rwx', () => expect(bitsToOctal(true, true, true)).toBe(7));
    it('returns 6 for rw-', () => expect(bitsToOctal(true, true, false)).toBe(6));
    it('returns 5 for r-x', () => expect(bitsToOctal(true, false, true)).toBe(5));
    it('returns 4 for r--', () => expect(bitsToOctal(true, false, false)).toBe(4));
    it('returns 2 for -w-', () => expect(bitsToOctal(false, true, false)).toBe(2));
    it('returns 1 for --x', () => expect(bitsToOctal(false, false, true)).toBe(1));
    it('returns 0 for ---', () => expect(bitsToOctal(false, false, false)).toBe(0));
  });

  describe('bitsToSymbol', () => {
    it('returns "rwx"', () => expect(bitsToSymbol(true, true, true)).toBe('rwx'));
    it('returns "r--"', () => expect(bitsToSymbol(true, false, false)).toBe('r--'));
    it('returns "---"', () => expect(bitsToSymbol(false, false, false)).toBe('---'));
    it('returns "rw-"', () => expect(bitsToSymbol(true, true, false)).toBe('rw-'));
  });

  describe('toChmodString', () => {
    it('builds 755', () => expect(toChmodString(7, 5, 5)).toBe('755'));
    it('builds 644', () => expect(toChmodString(6, 4, 4)).toBe('644'));
    it('builds 777', () => expect(toChmodString(7, 7, 7)).toBe('777'));
    it('builds 000', () => expect(toChmodString(0, 0, 0)).toBe('000'));
  });

  describe('toOctalString', () => {
    it('returns 3-digit string without special bits', () => {
      expect(toOctalString({ ...EMPTY_PERMS, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } })).toBe('755');
    });

    it('returns 4-digit string with setuid', () => {
      expect(toOctalString({ ...EMPTY_PERMS, special: { setuid: true, setgid: false, sticky: false }, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } })).toBe('4755');
    });

    it('returns 4-digit string with sticky bit', () => {
      expect(toOctalString({ ...EMPTY_PERMS, special: { setuid: false, setgid: false, sticky: true }, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } })).toBe('1755');
    });
  });

  describe('toPermString', () => {
    it('returns symbolic for 755', () => {
      expect(toPermString({ ...EMPTY_PERMS, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } })).toBe('rwxr-xr-x');
    });

    it('uses "s" for setuid with execute', () => {
      const perms = { ...EMPTY_PERMS, special: { setuid: true, setgid: false, sticky: false }, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } };
      expect(toPermString(perms)[2]).toBe('s');
    });

    it('uses "S" for setuid without execute', () => {
      const perms = { ...EMPTY_PERMS, special: { setuid: true, setgid: false, sticky: false }, owner: { read: true, write: true, execute: false }, group: { read: false, write: false, execute: false }, other: { read: false, write: false, execute: false } };
      expect(toPermString(perms)[2]).toBe('S');
    });

    it('uses "t" for sticky with execute', () => {
      const perms = { ...EMPTY_PERMS, special: { setuid: false, setgid: false, sticky: true }, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, other: { read: true, write: false, execute: true } };
      expect(toPermString(perms)[8]).toBe('t');
    });
  });

  describe('parseOctal', () => {
    it('parses 755', () => {
      const p = parseOctal('755');
      expect(p.owner).toEqual({ read: true, write: true, execute: true });
      expect(p.group).toEqual({ read: true, write: false, execute: true });
      expect(p.other).toEqual({ read: true, write: false, execute: true });
    });

    it('parses 644', () => {
      const p = parseOctal('644');
      expect(p.owner).toEqual({ read: true, write: true, execute: false });
      expect(p.group).toEqual({ read: true, write: false, execute: false });
    });

    it('parses 4755 with setuid', () => {
      const p = parseOctal('4755');
      expect(p.special.setuid).toBe(true);
      expect(p.special.setgid).toBe(false);
    });

    it('parses 1755 with sticky', () => {
      const p = parseOctal('1755');
      expect(p.special.sticky).toBe(true);
    });

    it('returns null for invalid input', () => {
      expect(parseOctal('abc')).toBeNull();
      expect(parseOctal('999')).toBeNull();
    });
  });

  describe('parseSymbolic', () => {
    it('parses rwxr-xr-x', () => {
      const p = parseSymbolic('rwxr-xr-x');
      expect(p.owner).toEqual({ read: true, write: true, execute: true });
      expect(p.group).toEqual({ read: true, write: false, execute: true });
      expect(p.other).toEqual({ read: true, write: false, execute: true });
    });

    it('parses with file type prefix (-rwxr-xr-x)', () => {
      const p = parseSymbolic('-rwxr-xr-x');
      expect(p.owner.execute).toBe(true);
    });

    it('detects setuid from "s"', () => {
      const p = parseSymbolic('rwsr-xr-x');
      expect(p.special.setuid).toBe(true);
      expect(p.owner.execute).toBe(true);
    });

    it('detects sticky from "t"', () => {
      const p = parseSymbolic('rwxr-xr-t');
      expect(p.special.sticky).toBe(true);
      expect(p.other.execute).toBe(true);
    });

    it('returns null for invalid input', () => {
      expect(parseSymbolic('invalid')).toBeNull();
      expect(parseSymbolic('rwxr-x')).toBeNull();
    });
  });

  describe('describePerms', () => {
    it('describes full permissions', () => {
      const lines = describePerms({ ...EMPTY_PERMS, owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: false }, other: { read: false, write: false, execute: false } });
      expect(lines[0]).toBe('Owner can read, write and execute');
      expect(lines[1]).toBe('Group can read');
      expect(lines[2]).toBe('Others has no access');
    });

    it('includes special bits in description', () => {
      const lines = describePerms({ ...EMPTY_PERMS, special: { setuid: true, setgid: false, sticky: true } });
      expect(lines[3]).toContain('setuid');
      expect(lines[3]).toContain('sticky bit');
    });
  });
});
