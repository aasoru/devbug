'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Laugh } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDismiss } from '@/hooks/useDismiss';
import { ToolbarButton } from './ToolbarButton';

// Split button: "Add files", plus an arrow that opens a menu with the other source (memes).
// Built by hand (no Radix): focus moves into the menu when it opens; Esc or a click outside
// closes it, and Esc gives focus back to the arrow.
export function AddMenu({ compact, adding, addDisabled, onAddFiles, memesLoaded, loadingMemes, onLoadMemes }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const arrow = useRef(null);
  const menu = useRef(null);

  useDismiss(root, open, (reason) => {
    setOpen(false);
    if (reason === 'escape') arrow.current?.focus();
  });

  useEffect(() => {
    if (open) menu.current?.querySelector('[role="menuitem"]')?.focus();
  }, [open]);

  const loadMemes = () => {
    setOpen(false);
    onLoadMemes();
  };

  return (
    <div ref={root} className="relative inline-flex">
      <ToolbarButton
        icon={ImagePlus}
        label={adding ? 'Adding…' : 'Add files'}
        compact={compact}
        variant="default"
        onClick={onAddFiles}
        disabled={addDisabled}
        className="rounded-r-none"
      />
      <Button
        ref={arrow}
        onClick={() => setOpen((v) => !v)}
        aria-label="More ways to add"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="mosaic-add-menu"
        className="rounded-l-none border-l border-primary-foreground/20 px-2"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Button>
      {open && (
        <div ref={menu} id="mosaic-add-menu" role="menu" className="absolute left-0 top-full z-10 mt-1 min-w-max rounded-md border bg-background p-1 shadow-md">
          <button
            type="button"
            role="menuitem"
            onClick={loadMemes}
            disabled={loadingMemes}
            className="flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-hidden disabled:opacity-50"
          >
            <Laugh className="h-4 w-4 mr-2" aria-hidden="true" />
            {memesLoaded ? 'Load other memes' : 'Load random memes'}
          </button>
        </div>
      )}
    </div>
  );
}
