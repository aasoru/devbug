'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Laugh } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDismiss } from '@/hooks/useDismiss';
import { MAX_MEMES, MIN_MEMES, memeCount } from './memes';
import { ToolbarButton } from './ToolbarButton';

// The arrow's popover: how many memes, and the button that loads them (Enter works too).
// A small non-modal dialog rather than a menu: ARIA menus can't contain a text field.
function MemesForm({ ref, count, loaded, loading, onLoad }) {
  const [draft, setDraft] = useState(String(count));
  const submit = (e) => {
    e.preventDefault();
    onLoad(memeCount(draft, count));
  };
  return (
    <form
      ref={ref}
      id="mosaic-add-menu"
      role="dialog"
      aria-label="Load memes"
      noValidate // out-of-range numbers are clamped (memeCount), not blocked by the browser
      onSubmit={submit}
      className="absolute left-0 top-full z-10 mt-1 flex min-w-max items-end gap-2 rounded-md border bg-background p-3 shadow-md"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Memes</span>
        <Input
          type="number"
          inputMode="numeric"
          min={MIN_MEMES}
          max={MAX_MEMES}
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-20"
        />
      </label>
      <Button type="submit" disabled={loading}>
        <Laugh className="h-4 w-4 mr-2" aria-hidden="true" />
        {loaded ? 'Load other memes' : 'Load random memes'}
      </Button>
    </form>
  );
}

// Split button: "Add files", plus an arrow that opens the other source (memes) with how many
// to load. Built by hand (no Radix): the number field gets focus (selected, ready to type);
// Esc or a click outside closes it, and Esc gives focus back to the arrow.
export function AddMenu({ compact, adding, addDisabled, onAddFiles, memes }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const arrow = useRef(null);
  const form = useRef(null);

  useDismiss(root, open, (reason) => {
    setOpen(false);
    if (reason === 'escape') arrow.current?.focus();
  });

  useEffect(() => {
    if (open) form.current?.querySelector('input')?.select();
  }, [open]);

  const load = (n) => {
    setOpen(false);
    memes.load(n);
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
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mosaic-add-menu"
        className="rounded-l-none border-l border-primary-foreground/20 px-2"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Button>
      {open && (
        <MemesForm
          ref={form}
          count={memes.count}
          loaded={memes.items.length > 0}
          loading={memes.status === 'loading'}
          onLoad={load}
        />
      )}
    </div>
  );
}
