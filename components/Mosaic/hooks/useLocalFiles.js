'use client';

import { useEffect, useRef, useState } from 'react';

import { importFile } from '../localImages';
import { LOCAL_LIMITS, limitMessages, overLimit } from '../limits';

const release = (item) => URL.revokeObjectURL(item.url);

// The user's own images and videos, read locally (object URLs) and never uploaded. Files over
// the limits are skipped and explained in `notices`. Every object URL is released when its
// file is removed, on clear, and when leaving the page.
export function useLocalFiles() {
  const [items, setItems] = useState([]);
  const [importing, setImporting] = useState(false);
  const [notices, setNotices] = useState([]); // files that couldn't be added
  const latest = useRef([]); // the current items, for limits and cleanup outside render

  useEffect(() => { latest.current = items; }, [items]);
  useEffect(() => () => latest.current.forEach(release), []);

  const add = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setImporting(true);
    const all = [...latest.current]; // what's already there + what's added in this batch
    const added = [];
    const errors = [];
    const skipped = { files: 0, videos: 0 };
    for (const file of files) { // one at a time keeps memory bounded
      const limit = overLimit(file, all); // only successfully added files count
      if (limit) { skipped[limit]++; continue; }
      const result = await importFile(file);
      if (result.image) { added.push(result.image); all.push(result.image); }
      else errors.push(result.error);
    }
    setImporting(false);
    if (added.length) setItems((prev) => [...prev, ...added]);
    setNotices([...limitMessages(skipped), ...errors]);
  };

  const remove = (id) => {
    const item = items.find((x) => x.id === id);
    if (item) release(item);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clear = () => {
    items.forEach(release);
    setItems([]);
    setNotices([]);
  };

  return {
    items,
    importing,
    notices,
    full: items.length >= LOCAL_LIMITS.maxFiles,
    hasVideos: items.some((x) => x.kind === 'video'),
    add,
    remove,
    clear,
    dismissNotices: () => setNotices([]),
  };
}
