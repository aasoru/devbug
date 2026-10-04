'use client';

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';

import { unlockOrientation } from '../orientation';

// The Fullscreen API isn't available everywhere (iPhone Safari only allows it for videos).
// There, full screen falls back to an overlay covering the whole viewport instead.
const noSubscribe = () => () => {};
const useCanFullscreen = () => useSyncExternalStore(noSubscribe, () => Boolean(document.fullscreenEnabled), () => false);

// Full screen for `ref`'s element: the native API when available, otherwise an overlay that
// Esc closes and that locks the page behind it. onEnter runs each time full screen starts.
export function useFullscreen(ref, onEnter) {
  const [fullscreen, setFullscreen] = useState(false); // native Fullscreen API
  const [overlay, setOverlay] = useState(false); // fallback: fixed layer over the page
  const canFullscreen = useCanFullscreen();
  const entered = useEffectEvent(onEnter);

  // Native full screen also ends from the browser (Esc), so follow its events. A video opened in
  // its own full screen player (inside the mosaic) leaves the mosaic as it was — full screen or
  // not — or the mosaic would relayout under it, drop the video and the player would close.
  useEffect(() => {
    const onChange = () => {
      const element = document.fullscreenElement;
      if (element && element !== ref.current && ref.current?.contains(element)) return;
      const active = element === ref.current;
      setFullscreen(active);
      if (!active) return;
      unlockOrientation(); // let the phone rotate the full screen mosaic
      entered();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [ref]);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e) => { if (e.key === 'Escape') setOverlay(false); };
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [overlay]);

  const openOverlay = () => {
    setOverlay(true);
    onEnter();
  };

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (overlay) setOverlay(false);
    else if (canFullscreen) ref.current?.requestFullscreen().catch(openOverlay);
    else openOverlay();
  };

  return { fullscreen, overlay, expanded: fullscreen || overlay, toggle };
}
