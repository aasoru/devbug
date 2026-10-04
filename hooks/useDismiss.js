'use client';

import { useEffect, useEffectEvent } from 'react';

// Popups open right now, oldest first. Only the newest one answers Esc, so a menu inside a
// drawer closes alone, and the drawer stays.
const openPopups = [];

// Closes a popup (menu, drawer…) while it's open: on a pointer press outside `ref`'s element,
// or on Esc. Esc is caught in the capture phase and stopped, so it closes only the newest popup
// and not whatever else listens for it (e.g. a full screen overlay behind it).
// onDismiss receives the reason: 'outside' | 'escape'. With `ref` null, only Esc dismisses.
export function useDismiss(ref, open, onDismiss) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!open) return;
    const self = {};
    openPopups.push(self);
    const onPointer = (e) => {
      if (ref && !ref.current?.contains(e.target)) dismiss('outside');
    };
    const onKey = (e) => {
      if (e.key !== 'Escape' || openPopups.at(-1) !== self) return;
      e.stopPropagation();
      dismiss('escape');
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      openPopups.splice(openPopups.indexOf(self), 1);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [ref, open]);
}
