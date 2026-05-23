import { describe, it, expect } from 'vitest';
import { analyzeText } from '@/components/TextAnalizer/lib';

describe('Text Analyzer', () => {
  it('returns zeros for empty string', () => {
    const result = analyzeText('');
    expect(result.chars).toBe(0);
    expect(result.charsWithSpaces).toBe(0);
    expect(result.words).toBe(0);
    expect(result.uniqueWords).toBe(0);
    expect(result.spaces).toBe(0);
    expect(result.lines).toBe(0);
  });

  it('counts characters without spaces', () => {
    expect(analyzeText('hello world').chars).toBe(10);
  });

  it('counts characters including spaces', () => {
    expect(analyzeText('hello world').charsWithSpaces).toBe(11);
  });

  it('counts words', () => {
    expect(analyzeText('one two three').words).toBe(3);
  });

  it('counts unique words (case-sensitive)', () => {
    expect(analyzeText('hello hello world').uniqueWords).toBe(2);
  });

  it('counts spaces and tabs', () => {
    expect(analyzeText('a b\tc').spaces).toBe(2);
  });

  it('counts lines', () => {
    expect(analyzeText('line1\nline2\nline3').lines).toBe(3);
  });

  it('returns 1 line for single-line text', () => {
    expect(analyzeText('hello').lines).toBe(1);
  });

  it('counts pattern matches', () => {
    expect(analyzeText('foo bar foo baz foo', 'foo').matches).toBe(3);
  });

  it('returns null matches when no search term', () => {
    expect(analyzeText('hello world').matches).toBeNull();
  });

  it('returns 0 matches when pattern not found', () => {
    expect(analyzeText('hello world', 'xyz').matches).toBe(0);
  });
});
