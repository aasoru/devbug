'use client';

import { useRef, useState } from 'react';

import { DEFAULT_MEMES, IMGFLIP_API, pickSafeMemes } from '../memes';

// Random memes from imgflip.com, fetched only when asked (load). The templates are fetched once
// and kept; each load picks a new random set of `n` and remembers `n` as the next default.
// status: 'idle' | 'loading' | 'ready' | 'error'.
export function useMemes() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');
  const [count, setCount] = useState(DEFAULT_MEMES);
  const templates = useRef(null);

  const load = async (n) => {
    setCount(n);
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

  const clear = () => {
    setItems([]);
    setStatus('idle');
  };

  return { items, status, count, load, clear };
}
