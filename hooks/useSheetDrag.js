'use client';

import { useRef } from 'react';

const OPEN_DISTANCE = 30; // px dragged up on the handle to open
const CLOSE_DISTANCE = 80; // px dragged down on the grip to close
const TAP_SLOP = 8; // below this it's a tap (handled by onClick), not a drag

// Drag gestures for a bottom sheet, with Pointer Events (touch, pen and mouse alike):
// dragging the closed sheet's handle up opens it; dragging the open sheet's grip down moves the
// sheet with the finger and closes it past CLOSE_DISTANCE (otherwise it snaps back).
// Spread `handlers` on the handle and the grip; call `wasDrag()` in their onClick so the click
// that ends a drag isn't also taken as a tap.
export function useSheetDrag(sheetRef, { open, onOpen, onClose }) {
  const startY = useRef(null);
  const dragged = useRef(false);

  const follow = (dy) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.style.transition = dy ? 'none' : '';
    sheet.style.transform = dy ? `translateY(${dy}px)` : '';
  };

  const end = (e) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    startY.current = null;
    follow(0);
    dragged.current = Math.abs(dy) >= TAP_SLOP;
    if (!open && dy <= -OPEN_DISTANCE) onOpen();
    else if (open && dy >= CLOSE_DISTANCE) onClose();
  };

  const handlers = {
    onPointerDown: (e) => {
      startY.current = e.clientY;
      dragged.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      if (startY.current !== null && open) follow(Math.max(0, e.clientY - startY.current));
    },
    onPointerUp: end,
    onPointerCancel: () => {
      startY.current = null;
      follow(0);
    },
  };

  const wasDrag = () => {
    const was = dragged.current;
    dragged.current = false;
    return was;
  };

  return { handlers, wasDrag };
}
