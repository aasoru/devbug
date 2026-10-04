'use client';

import { useMemo, useRef, useState } from 'react';

import { layoutMosaic } from './layout';
import { DEFAULT_OPTIONS } from './options';
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

const ROOT = {
  overlay: 'fixed inset-0 z-50 flex h-dvh flex-col gap-2 overflow-auto bg-background p-2 text-foreground',
  fullscreen: 'flex h-full flex-col gap-2 overflow-auto bg-background p-2 text-foreground',
  page: 'flex flex-col gap-4',
};

// Fits the user's files and random memes into one frame. Memes and files share the mosaic but
// are managed apart (loading other memes keeps the files, and the other way round).
const Mosaic = () => {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState(true);
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const fileInput = useRef(null);

  const memes = useMemes();
  const files = useLocalFiles();
  // Entering full screen hides the options so the mosaic gets the whole screen.
  const screen = useFullscreen(rootRef, () => setShowOptions(false));
  const size = useFrameSize(containerRef, screen.expanded, options.frame);

  const items = useMemo(() => [...files.items, ...memes.items], [files.items, memes.items]);
  const { gap, leftover, sizes, reorder } = options;
  const layout = useMemo(
    // Rows or columns, whichever leaves less empty space.
    () => layoutMosaic(items, { width: size.width, height: size.height, gap: Number(gap), leftover, sizes, reorder, flow: 'auto' }),
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

  return (
    <div ref={rootRef} data-testid="mosaic-root" className={screen.overlay ? ROOT.overlay : screen.fullscreen ? ROOT.fullscreen : ROOT.page}>
      <Toolbar
        compact={screen.expanded}
        add={{
          adding: files.importing,
          addDisabled: files.importing || files.full,
          onAddFiles: pickFiles,
          memesLoaded: memes.items.length > 0,
          loadingMemes: memes.status === 'loading',
          onLoadMemes: () => memes.load(),
        }}
        playback={{ ...playback, hasVideos: files.hasVideos }}
        hasItems={items.length > 0}
        onClear={clear}
        optionsShown={showOptions}
        onToggleOptions={() => setShowOptions((v) => !v)}
        onToggleFullscreen={screen.toggle}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        data-testid="mosaic-file-input"
        onChange={(e) => { files.add(e.target.files); e.target.value = ''; }}
      />

      {showOptions && <OptionsPanel options={options} onChange={setOption} memes={memes} />}

      {memes.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">Couldn&apos;t load memes from imgflip.com. Try again later.</p>
      )}
      <Notices notices={files.notices} onDismiss={files.dismissNotices} />
      {items.length > 0 && !screen.expanded && <Stats files={files.items.length} memes={memes.items.length} layout={layout} />}

      <div ref={containerRef} className={screen.expanded ? 'min-h-0 w-full flex-1' : 'w-full'}>
        <MosaicFrame
          ref={frameRef}
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
    </div>
  );
};

export default Mosaic;
