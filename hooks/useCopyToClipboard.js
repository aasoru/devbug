'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const COPY_ERRORS = {
  unavailable: "Clipboard access isn't available here (it requires HTTPS). Select the text and press Ctrl+C / ⌘C.",
  blocked: 'Your browser blocked clipboard access. Allow it in the site permissions, or select the text and press Ctrl+C / ⌘C.',
};

export const copyErrorMessage = (err) =>
  err?.name === 'ClipboardUnavailable' ? COPY_ERRORS.unavailable : COPY_ERRORS.blocked;

// status: 'idle' | 'copied' | 'error' (resets to idle after resetMs).
// error: descriptive message, kept until dismissed or the next successful copy.
export function useCopyToClipboard(resetMs = 2000) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = useCallback((next) => {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), resetMs);
  }, [resetMs]);

  const copy = useCallback(async (text) => {
    try {
      if (!navigator.clipboard?.writeText) {
        const err = new Error('Clipboard API unavailable');
        err.name = 'ClipboardUnavailable';
        throw err;
      }
      await navigator.clipboard.writeText(text);
      setError(null);
      flash('copied');
    } catch (err) {
      setError(copyErrorMessage(err));
      flash('error');
    }
  }, [flash]);

  const dismissError = useCallback(() => setError(null), []);

  return { copy, status, error, dismissError };
}

export const copyLabel = (status, idle = 'Copy') =>
  status === 'copied' ? 'Copied!' : status === 'error' ? 'Copy failed' : idle;
