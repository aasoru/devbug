'use client';

import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tile } from './Tile';

// The frame with the placed items. Files can be dropped on it; while empty, it's also a button
// that opens the file picker (only while empty: then a click on a video toggles its sound, and
// a meme opens imgflip.com).
export function MosaicFrame({ ref, size, items, layout, playback, busyMessage, onPickFiles, onDropFiles, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onDropFiles(e.dataTransfer.files);
  };

  return (
    <div
      ref={ref}
      data-testid="mosaic-frame"
      className={twMerge('relative mx-auto overflow-hidden rounded-md border bg-muted/40', dragging && 'ring-2 ring-ring')}
      style={{ width: size.width, height: size.height }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {items.length === 0 && (
        <button
          type="button"
          onClick={onPickFiles}
          disabled={Boolean(busyMessage)}
          className="absolute inset-0 flex cursor-pointer items-center justify-center p-4 text-center text-sm text-muted-foreground hover:bg-muted/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-default"
        >
          {busyMessage || 'Drop images or videos here, or press “Add files”. They stay on your device.'}
        </button>
      )}
      {layout.tiles.map((box) => (
        <Tile key={box.id} item={byId.get(box.id)} box={box} playback={playback} onRemove={onRemove} />
      ))}
    </div>
  );
}
