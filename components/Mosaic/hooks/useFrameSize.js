'use client';

import { useEffect, useState } from 'react';

import { FRAMES } from '../options';

const NORMAL_HEIGHT_SHARE = 0.75; // outside full screen, the frame takes up to 75% of the window
const MIN_HEIGHT = 320;

// Space available in `ref`'s element: its width and a height cap — a share of the window
// normally, or all the element's height when expanded (where it fills the rest of the screen).
// The window's size gives the "Screen" frame its shape.
function useAvailableSpace(ref, expanded) {
  const [space, setSpace] = useState({ width: 0, maxHeight: 0, windowWidth: 16, windowHeight: 9 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSpace({
      width: el.clientWidth,
      maxHeight: expanded ? el.clientHeight : Math.max(MIN_HEIGHT, Math.round(window.innerHeight * NORMAL_HEIGHT_SHARE)),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, expanded]);

  return space;
}

// Frame size in px for the chosen frame option, as large as the available space allows.
export function useFrameSize(ref, expanded, frame) {
  const space = useAvailableSpace(ref, expanded);
  if (frame === 'screen' && expanded) return { width: Math.floor(space.width), height: Math.floor(space.maxHeight) };
  const { w, h } = frame === 'screen' ? { w: space.windowWidth, h: space.windowHeight } : FRAMES.find((f) => f.value === frame);
  const width = Math.min(space.width, (space.maxHeight * w) / h);
  return { width: Math.floor(width), height: Math.floor((width * h) / w) };
}
