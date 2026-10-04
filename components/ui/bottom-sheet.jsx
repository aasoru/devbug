"use client"

import { useEffect, useId, useRef } from "react"
import { twMerge } from "tailwind-merge"

import { useDismiss } from "@/hooks/useDismiss"
import { useSheetDrag } from "@/hooks/useSheetDrag"

const PILL = "rounded-full group-focus-visible:ring-2 group-focus-visible:ring-ring"

// A bottom sheet laid over its positioned parent (`relative`/`fixed`). Not a portal on purpose:
// in native full screen only the full screen element's subtree is shown.
// Closed: a handle at the bottom (big enough to hit, raised off the edge); tap it (or Enter) or
// drag it up to open. Open: a translucent, blurred panel, so what's behind still shows through.
// To close: tap or drag the grip down, press Esc, or tap the backdrop. The backdrop takes
// that tap, so it doesn't also reach what's underneath (a link, a video's sound).
export function BottomSheet({ open, onOpenChange, label, handleLabel, children }) {
  const id = useId()
  const root = useRef(null) // backdrop + sheet: a tap on either isn't "outside"
  const sheet = useRef(null)
  const handle = useRef(null)
  const drag = useSheetDrag(sheet, { open, onOpen: () => onOpenChange(true), onClose: () => onOpenChange(false) })

  useDismiss(root, open, (reason) => {
    onOpenChange(false)
    if (reason === "escape") handle.current?.focus()
  })

  useEffect(() => {
    if (open) sheet.current?.querySelector("button, input, select, a[href]")?.focus()
  }, [open])

  const tap = (next) => () => {
    if (!drag.wasDrag()) onOpenChange(next)
  }

  return (
    <>
      <button
        ref={handle}
        type="button"
        aria-label={handleLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={tap(true)}
        {...drag.handlers}
        className="group absolute bottom-0 left-1/2 z-10 flex h-12 w-32 -translate-x-1/2 touch-none items-end justify-center pb-4 focus-visible:outline-hidden"
      >
        <span className={twMerge(PILL, "h-2 w-16 bg-white/80 shadow-sm ring-1 ring-black/30")} />
      </button>
      <div ref={root} className="contents">
        <div
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
          className={twMerge("absolute inset-0 z-20 bg-black/20 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")}
        />
        <div
          ref={sheet}
          id={id}
          role="dialog"
          aria-label={label}
          inert={!open}
          className={twMerge(
            "absolute inset-x-0 bottom-0 z-30 flex max-h-[85%] flex-col rounded-t-2xl border-t bg-background/70 shadow-lg backdrop-blur-md transition-all duration-300",
            open ? "visible translate-y-0" : "invisible translate-y-full"
          )}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={tap(false)}
            {...drag.handlers}
            className="group flex shrink-0 touch-none justify-center py-3 focus-visible:outline-hidden"
          >
            <span className={twMerge(PILL, "h-1.5 w-12 bg-muted-foreground/40")} />
          </button>
          <div className="overflow-y-auto px-4 pb-4">{children}</div>
        </div>
      </div>
    </>
  )
}
