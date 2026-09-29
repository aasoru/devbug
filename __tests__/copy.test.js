import { describe, it, expect } from 'vitest';
import { copyErrorMessage, copyLabel, COPY_ERRORS } from '@/hooks/useCopyToClipboard';

describe('copyErrorMessage', () => {
  it('explains HTTPS when the Clipboard API is unavailable', () => {
    const err = new Error('x');
    err.name = 'ClipboardUnavailable';
    expect(copyErrorMessage(err)).toBe(COPY_ERRORS.unavailable);
  });

  it('explains permissions when the browser blocks access', () => {
    const err = new Error('x');
    err.name = 'NotAllowedError';
    expect(copyErrorMessage(err)).toBe(COPY_ERRORS.blocked);
  });

  it('falls back to the blocked message for unknown errors', () => {
    expect(copyErrorMessage(new Error('x'))).toBe(COPY_ERRORS.blocked);
    expect(copyErrorMessage(undefined)).toBe(COPY_ERRORS.blocked);
  });
});

describe('copyLabel', () => {
  it('maps status to button text', () => {
    expect(copyLabel('idle')).toBe('Copy');
    expect(copyLabel('copied')).toBe('Copied!');
    expect(copyLabel('error')).toBe('Copy failed');
  });

  it('uses a custom idle label', () => {
    expect(copyLabel('idle', 'Copy payload')).toBe('Copy payload');
    expect(copyLabel('error', 'Copy payload')).toBe('Copy failed');
  });
});
