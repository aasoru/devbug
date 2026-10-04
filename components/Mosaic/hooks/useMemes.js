'use client';

import { useEffect, useRef, useState } from 'react';

import { IMGFLIP_API, pickSafeMemes, SAFE_MEME_IDS } from '../memes';

export const MIN_MEMES = 1;
export const MAX_MEMES = SAFE_MEME_IDS.size; // can't show more memes than the reviewed ones
const DEFAULT_COUNT = 12;
const COUNT_DEBOUNCE_MS = 400;

// Random memes from imgflip.com, fetched only when asked (load). The templates are fetched once
// and kept; each load picks a new random set. status: 'idle' | 'loading' | 'ready' | 'error'.
// The count is typed by the user (countDraft) and applied once they pause, press Enter or leave
// the field, so typing "15" doesn't first reload a 1-meme mosaic.
export function useMemes() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [countDraft, setCountDraft] = useState(String(DEFAULT_COUNT));
  const templates = useRef(null);
  const countTimer = useRef(null);

  useEffect(() => () => clearTimeout(countTimer.current), []);

  const load = async (n = count) => {
    setStatus('loading');
    try {
      if (!templates.current) {
        const res = await fetch(IMGFLIP_API);
        const json = await res.json();
        if (!json.success) throw new Error('Imgflip API error');
        templates.current = json.data.memes;
      }
      setItems(pickSafeMemes(templates.current, n));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  const applyCount = (raw) => {
    clearTimeout(countTimer.current);
    const parsed = Number.parseInt(raw, 10);
    const next = Number.isNaN(parsed) ? count : Math.min(MAX_MEMES, Math.max(MIN_MEMES, parsed));
    setCountDraft(String(next));
    if (next === count) return;
    setCount(next);
    if (items.length) load(next);
  };

  const changeCount = (raw) => {
    setCountDraft(raw);
    clearTimeout(countTimer.current);
    countTimer.current = setTimeout(() => applyCount(raw), COUNT_DEBOUNCE_MS);
  };

  const clear = () => {
    setItems([]);
    setStatus('idle');
  };

  return { items, status, load, clear, countDraft, changeCount, applyCount };
}
