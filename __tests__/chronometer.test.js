import { describe, it, expect } from 'vitest';
import { formatTime } from '@/components/Chronometer/lib';

describe('formatTime', () => {
  it('shows minutes, seconds and hundredths', () => {
    expect(formatTime(0)).toBe('00:00.00');
    expect(formatTime(1500)).toBe('00:01.50');
    expect(formatTime(61_234)).toBe('01:01.23');
  });

  it('drops (never rounds up) partial hundredths', () => {
    expect(formatTime(999)).toBe('00:00.99');
    expect(formatTime(1009)).toBe('00:01.00');
  });

  it('adds hours from the first hour', () => {
    expect(formatTime(3_599_999)).toBe('59:59.99');
    expect(formatTime(3_600_000)).toBe('01:00:00.00');
    expect(formatTime(3_723_450)).toBe('01:02:03.45');
  });
});
