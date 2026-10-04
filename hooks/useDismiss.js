'use client';

import { useEffect, useEffectEvent } from 'react';

// Closes a popup (menu, dropdown…) while it's open: on a pointer press outside `ref`'s element,
// or on Esc. Esc is caught in the capture phase and stopped, so it closes only the popup and not
// whatever else listens for it (e.g. a full screen overlay behind the menu).
// onDismiss receives the reason: 'outside' | 'escape'.
export function useDismiss(ref, open, onDismiss) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!ref.current?.contains(e.target)) dismiss('outside');
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      dismiss('escape');
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [ref, open]);
}
