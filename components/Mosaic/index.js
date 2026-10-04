'use client';

import { useMemo, useRef, useState } from 'react';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { layoutMosaic } from './layout';
import { DEFAULT_OPTIONS, gapPx } from './options';
import { useFrameSize } from './hooks/useFrameSize';
import { useFullscreen } from './hooks/useFullscreen';
import { useLocalFiles } from './hooks/useLocalFiles';
import { useMemes } from './hooks/useMemes';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { MosaicFrame } from './MosaicFrame';
import { Notices } from './Notices';
import { OptionsPanel } from './OptionsPanel';
import { Stats } from './Stats';
import { Toolbar } from './Toolbar';

// In full screen the mosaic goes edge to edge; the controls wait in a bottom sheet.
const ROOT = {
  overlay: 'fixed inset-0 z-50 h-dvh overflow-hidden bg-background text-foreground',
  fullscreen: 'relative h-full overflow-hidden bg-background text-foreground',
  page: 'flex flex-col gap-4',
};

// Fits the user's files and random memes into one frame. Memes and files share the mosaic but
// are managed apart (loading other memes keeps the files, and the other way round).
const Mosaic = () => {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false); // the bottom sheet, in full screen
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const fileInput = useRef(null);

  const memes = useMemes();
  const files = useLocalFiles();
  // Full screen starts with the controls tucked away, so the mosaic gets the whole screen.
  const screen = useFullscreen(rootRef, () => setControlsOpen(false));
  const size = useFrameSize(containerRef, screen.expanded, options.frame);

  const items = useMemo(() => [...files.items, ...memes.items], [files.items, memes.items]);
  const { gap, leftover, sizes, reorder } = options;
  const layout = useMemo(
    // Rows or columns, whichever leaves less empty space.
    () => layoutMosaic(items, { width: size.width, height: size.height, gap: gapPx(gap), leftover, sizes, reorder, flow: 'auto' }),
    [items, size.width, size.height, gap, leftover, sizes, reorder]
  );
  const playback = useVideoPlayback(frameRef, layout);

  const pickFiles = () => fileInput.current?.click();
  const setOption = (key, value) => setOptions((prev) => ({ ...prev, [key]: value }));

  const remove = (id) => {
    files.remove(id);
    playback.forget(id);
  };

  // Clear empties the whole mosaic: the user's files and the memes.
  const clear = () => {
    files.clear();
    memes.clear();
    playback.reset();
  };

  const busyMessage = memes.status === 'loading' ? 'Loading memes…' : files.importing ? 'Adding…' : null;

  const controls = (
    <div className="flex flex-col gap-4">
      <Toolbar
        expanded={screen.expanded}
        add={{
          adding: files.importing,
          addDisabled: files.importing || files.full,
          onAddFiles: pickFiles,
          memes,
        }}
        playback={{ ...playback, hasVideos: files.hasVideos }}
        hasItems={items.length > 0}
        onClear={clear}
        optionsShown={showOptions}
        onToggleOptions={() => setShowOptions((v) => !v)}
        onToggleFullscreen={screen.toggle}
      />
      {(showOptions || screen.expanded) && <OptionsPanel options={options} onChange={setOption} />}
      {memes.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">Couldn&apos;t load memes from imgflip.com. Try again later.</p>
      )}
      <Notices notices={files.notices} onDismiss={files.dismissNotices} />
    </div>
  );

  return (
    <div ref={rootRef} data-testid="mosaic-root" className={screen.overlay ? ROOT.overlay : screen.fullscreen ? ROOT.fullscreen : ROOT.page}>
      {!screen.expanded && controls}
      {items.length > 0 && !screen.expanded && <Stats files={files.items.length} memes={memes.items.length} layout={layout} />}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        data-testid="mosaic-file-input"
        onChange={(e) => { files.add(e.target.files); e.target.value = ''; }}
      />

      <div ref={containerRef} className={screen.expanded ? 'flex h-full w-full items-center' : 'w-full'}>
        <MosaicFrame
          ref={frameRef}
          bare={screen.expanded}
          size={size}
          items={items}
          layout={layout}
          playback={playback}
          busyMessage={busyMessage}
          onPickFiles={pickFiles}
          onDropFiles={files.add}
          onRemove={remove}
        />
      </div>

      {screen.expanded && (
        <BottomSheet open={controlsOpen} onOpenChange={setControlsOpen} label="Mosaic controls" handleLabel="Show controls">
          {controls}
        </BottomSheet>
      )}
    </div>
  );
};

export default Mosaic;
