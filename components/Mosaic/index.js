'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, ImagePlus, Maximize, Minimize, Pause, Play, SlidersHorizontal, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IMGFLIP_API, LOCAL_LIMITS, layoutMosaic, limitMessages, overLimit, pickSafeMemes, SAFE_MEME_IDS } from './lib';
import { importFile } from './localImages';

const FRAMES = [
  { value: '16:9', w: 16, h: 9 },
  { value: '4:3', w: 4, h: 3 },
  { value: '1:1', w: 1, h: 1 },
  { value: '3:4', w: 3, h: 4 },
  { value: '9:16', w: 9, h: 16 },
];
const SOURCES = [
  { value: 'memes', label: 'Random memes' },
  { value: 'local', label: 'My files' },
];
const MIN_COUNT = 1;
const MAX_COUNT = SAFE_MEME_IDS.size; // can't show more memes than the reviewed ones
const COUNT_DEBOUNCE_MS = 400;
const GAPS = [0, 4, 8, 16];
const SIZES = [
  { value: 'similar', label: 'Similar sizes' },
  { value: 'any', label: 'Least empty space' },
];
const LEFTOVER = [
  { value: 'center', label: 'Centered' },
  { value: 'distribute', label: 'Spread as spacing' },
  { value: 'end', label: 'At the end' },
];

// Native <select> (system picker on mobile, keyboard and screen readers work as usual), but with
// our own chevron: each browser draws and places the native arrow differently, often cramped.
const Select = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </span>
  </label>
);

// Space available for the frame: the container's width and a height cap — 75% of the window
// normally, or all the container's height when expanded (where it fills the rest of the screen).
function useBox(ref, expanded) {
  const [box, setBox] = useState({ width: 0, maxHeight: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBox({
      width: el.clientWidth,
      maxHeight: expanded ? el.clientHeight : Math.max(320, Math.round(window.innerHeight * 0.75)),
    });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, [ref, expanded]);
  return box;
}

// The Fullscreen API isn't available everywhere (iPhone Safari only allows it for videos).
// There, "Full screen" falls back to an overlay covering the whole viewport instead.
const noop = () => () => {};
const useCanFullscreen = () => useSyncExternalStore(noop, () => Boolean(document.fullscreenEnabled), () => false);

const Mosaic = () => {
  const [source, setSource] = useState('memes');
  const [frame, setFrame] = useState('16:9');
  const [count, setCount] = useState(12);
  const [countDraft, setCountDraft] = useState('12'); // what the user is typing
  const countTimer = useRef(null);
  const [gap, setGap] = useState('4');
  const [leftover, setLeftover] = useState('center');
  const [sizes, setSizes] = useState('similar');

  // Memes (imgflip) and the user's own images are kept apart: switching source keeps both.
  const [memes, setMemes] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const templates = useRef(null);
  const [localImages, setLocalImages] = useState([]);
  const [importing, setImporting] = useState(false);
  const [notices, setNotices] = useState([]); // files that couldn't be added
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(true); // videos: all play (muted, looped) or all pause
  const [audioId, setAudioId] = useState(null); // the one video with sound, if any
  const frameRef = useRef(null);
  const fileInput = useRef(null);
  const localRef = useRef([]); // latest local images, for limits and cleanup outside render

  const images = source === 'local' ? localImages : memes;

  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false); // native Fullscreen API
  const [overlay, setOverlay] = useState(false); // fallback: fixed layer over the page
  const expanded = fullscreen || overlay;
  const [showOptions, setShowOptions] = useState(true);
  const canFullscreen = useCanFullscreen();
  const box = useBox(containerRef, expanded);

  // Entering full screen hides the options so the mosaic gets the whole screen;
  // they can still be opened there. Esc (handled by the browser) exits too.
  useEffect(() => {
    const onChange = () => {
      const isFs = document.fullscreenElement === rootRef.current;
      setFullscreen(isFs);
      if (isFs) setShowOptions(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const openOverlay = () => { setOverlay(true); setShowOptions(false); };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (overlay) setOverlay(false);
    else if (canFullscreen) rootRef.current?.requestFullscreen().catch(openOverlay);
    else openOverlay();
  };

  // Overlay: Esc closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!overlay) return;
    const onKey = (e) => { if (e.key === 'Escape') setOverlay(false); };
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { html.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [overlay]);

  // Keep the ref in sync, and release every local image when leaving the page.
  useEffect(() => { localRef.current = localImages; }, [localImages]);
  useEffect(() => () => localRef.current.forEach((img) => URL.revokeObjectURL(img.url)), []);

  const size = useMemo(() => {
    const f = FRAMES.find((x) => x.value === frame);
    const width = Math.min(box.width, (box.maxHeight * f.w) / f.h);
    return { width: Math.floor(width), height: Math.floor((width * f.h) / f.w) };
  }, [box, frame]);

  const layout = useMemo(
    () => layoutMosaic(images, { ...size, gap: Number(gap), leftover, sizes }),
    [images, size, gap, leftover, sizes]
  );

  const load = async (n = count) => {
    setStatus('loading');
    try {
      if (!templates.current) {
        const res = await fetch(IMGFLIP_API);
        const json = await res.json();
        if (!json.success) throw new Error('Imgflip API error');
        templates.current = json.data.memes;
      }
      setMemes(pickSafeMemes(templates.current, n));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  // Apply the typed count (clamped) once the user pauses, presses Enter or leaves the field,
  // so typing "15" doesn't first reload a 1-image mosaic.
  const applyCount = (raw) => {
    clearTimeout(countTimer.current);
    const parsed = Number.parseInt(raw, 10);
    const next = Number.isNaN(parsed) ? count : Math.min(MAX_COUNT, Math.max(MIN_COUNT, parsed));
    setCountDraft(String(next));
    if (next === count) return;
    setCount(next);
    if (memes.length) load(next);
  };

  const onCountChange = (raw) => {
    setCountDraft(raw);
    clearTimeout(countTimer.current);
    countTimer.current = setTimeout(() => applyCount(raw), COUNT_DEBOUNCE_MS);
  };

  useEffect(() => () => clearTimeout(countTimer.current), []);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setImporting(true);
    const all = [...localRef.current]; // what's already there + what's added in this batch
    const added = [];
    const errors = [];
    const skipped = { files: 0, videos: 0 };
    for (const file of files) { // one at a time keeps memory bounded
      const limit = overLimit(file, all); // only successfully added files count
      if (limit) { skipped[limit]++; continue; }
      const result = await importFile(file);
      if (result.image) { added.push(result.image); all.push(result.image); }
      else errors.push(result.error);
    }
    setImporting(false);
    if (added.length) setLocalImages((prev) => [...prev, ...added]);
    setNotices([...limitMessages(skipped), ...errors]);
  };

  const removeImage = (id) => {
    const img = localImages.find((x) => x.id === id);
    if (img) URL.revokeObjectURL(img.url);
    if (audioId === id) setAudioId(null);
    setLocalImages((prev) => prev.filter((x) => x.id !== id));
  };

  const clearImages = () => {
    localImages.forEach((img) => URL.revokeObjectURL(img.url));
    setLocalImages([]);
    setAudioId(null);
    setNotices([]);
  };

  const dropHandlers = source === 'local' ? {
    onDragOver: (e) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); },
  } : {};

  // Sound for one video at a time: clicking a video turns its sound on and mutes the rest;
  // clicking it again mutes it. `muted` is set on the elements right here, inside the click,
  // because browsers only allow unmuting as a direct response to a user gesture.
  const toggleAudio = (id) => {
    const next = audioId === id ? null : id;
    setAudioId(next);
    frameRef.current?.querySelectorAll('video').forEach((v) => { v.muted = v.dataset.id !== next; });
  };

  // Keep every video in sync with the Play all / Pause all state (also new ones as they appear).
  useEffect(() => {
    frameRef.current?.querySelectorAll('video').forEach((v) => {
      if (playing) v.play().catch(() => {});
      else v.pause();
    });
  }, [playing, layout]);

  const bandLabel = { none: 'none', bottom: 'vertical', side: 'horizontal' }[layout.band];
  const full = localImages.length >= LOCAL_LIMITS.maxFiles;
  const hasVideos = source === 'local' && localImages.some((x) => x.kind === 'video');

  return (
    <div
      ref={rootRef}
      data-testid="mosaic-root"
      className={
        overlay ? 'fixed inset-0 z-50 flex h-dvh flex-col gap-3 overflow-auto bg-background p-4 text-foreground'
          : fullscreen ? 'flex h-full flex-col gap-3 overflow-auto bg-background p-4 text-foreground'
            : 'flex flex-col gap-4'
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        {source === 'memes' ? (
          <Button onClick={() => load()} disabled={status === 'loading'}>
            {status === 'loading' ? 'Loading…' : memes.length ? 'Load other memes' : 'Load random memes'}
          </Button>
        ) : (
          <>
            <Button onClick={() => fileInput.current?.click()} disabled={importing || full}>
              <ImagePlus className="h-4 w-4 mr-2" aria-hidden="true" />
              {importing ? 'Adding…' : 'Add files'}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              data-testid="mosaic-file-input"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            {hasVideos && (
              <Button variant="outline" onClick={() => setPlaying((p) => !p)}>
                {playing
                  ? <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                  : <Play className="h-4 w-4 mr-2" aria-hidden="true" />}
                {playing ? 'Pause all' : 'Play all'}
              </Button>
            )}
            {localImages.length > 0 && (
              <Button variant="outline" onClick={clearImages}>
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Clear
              </Button>
            )}
          </>
        )}
        <Button
          variant="outline"
          onClick={() => setShowOptions((v) => !v)}
          aria-expanded={showOptions}
          aria-controls="mosaic-options"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
          {showOptions ? 'Hide options' : 'Show options'}
        </Button>
        <Button variant="outline" onClick={toggleFullscreen}>
          {expanded
            ? <Minimize className="h-4 w-4 mr-2" aria-hidden="true" />
            : <Maximize className="h-4 w-4 mr-2" aria-hidden="true" />}
          {expanded ? 'Exit full screen' : 'Full screen'}
        </Button>
        {!expanded && (
          <p className="text-xs text-muted-foreground">
            {source === 'memes' ? (
              <>
                Images load from{' '}
                <a href="https://imgflip.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">imgflip.com</a>{' '}
                only when you press the button. Nothing loads until then.
              </>
            ) : (
              <>
                Your files stay on this device — nothing is uploaded. Up to {LOCAL_LIMITS.maxFiles} files:{' '}
                images up to {LOCAL_LIMITS.maxBytes / (1024 * 1024)} MB and {LOCAL_LIMITS.maxPixels / 1e6} MP (scaled down to {LOCAL_LIMITS.maxSide} px),{' '}
                and {LOCAL_LIMITS.maxVideos} videos up to {LOCAL_LIMITS.maxVideoBytes / (1024 * 1024)} MB. Videos play muted: click one to hear it (one at a time).
              </>
            )}
          </p>
        )}
      </div>

      {showOptions && (
        <div id="mosaic-options" className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <Select label="Source" value={source} onChange={setSource} options={SOURCES} />
          <Select label="Frame" value={frame} onChange={setFrame} options={FRAMES.map((f) => ({ value: f.value, label: f.value }))} />
          {source === 'memes' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Images</span>
              <Input
                type="number"
                inputMode="numeric"
                min={MIN_COUNT}
                max={MAX_COUNT}
                step={1}
                value={countDraft}
                onChange={(e) => onCountChange(e.target.value)}
                onBlur={(e) => applyCount(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyCount(e.currentTarget.value); }}
              />
            </label>
          )}
          <Select label="Gap" value={gap} onChange={setGap} options={GAPS.map((g) => ({ value: String(g), label: `${g}px` }))} />
          <Select label="Sizes" value={sizes} onChange={setSizes} options={SIZES} />
          <Select label="Leftover space" value={leftover} onChange={setLeftover} options={LEFTOVER} />
        </div>
      )}

      {source === 'memes' && status === 'error' && (
        <p role="alert" className="text-sm text-destructive">Couldn&apos;t load memes from imgflip.com. Try again later.</p>
      )}

      {source === 'local' && notices.length > 0 && (
        <div role="alert" data-testid="mosaic-notices" className="relative rounded-md border border-destructive/50 p-3 pr-10 text-sm text-destructive dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <ul className="list-disc pl-5">
            {notices.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
          <button type="button" aria-label="Dismiss" onClick={() => setNotices([])} className="absolute right-3 top-3 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="mosaic-stats">
          {source === 'local' && `${localImages.length}/${LOCAL_LIMITS.maxFiles} files · `}
          {layout.rows} {layout.rows === 1 ? 'row' : 'rows'} · empty space {(layout.empty * 100).toFixed(1)}% ({bandLabel})
        </p>
      )}

      <div ref={containerRef} className={expanded ? 'min-h-0 w-full flex-1' : 'w-full'}>
        <div
          ref={frameRef}
          data-testid="mosaic-frame"
          className={twMerge('relative mx-auto overflow-hidden rounded-md border bg-muted/40', dragging && 'ring-2 ring-ring')}
          style={{ width: size.width, height: size.height }}
          {...dropHandlers}
        >
          {images.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
              {source === 'memes'
                ? 'Press “Load random memes” to fill the mosaic.'
                : 'Drop images or videos here, or press “Add files”. They stay on your device.'}
            </p>
          )}
          {layout.tiles.map((t) => {
            const img = images.find((m) => m.id === t.id);
            const style = { left: t.x, top: t.y, width: t.width, height: t.height };
            const picture = img.kind === 'video' ? (
              // Muted + playsInline: required for autoplay (iPhone Safari won't autoplay otherwise).
              <video
                src={img.url}
                data-id={img.id}
                aria-label={img.name}
                muted={audioId !== img.id}
                loop
                playsInline
                autoPlay={playing}
                preload="auto"
                onClick={() => toggleAudio(img.id)}
                className="h-full w-full cursor-pointer"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- remote/local images with known size; next/image would proxy them through our server
              <img src={img.url} alt={img.name} width={img.width} height={img.height} referrerPolicy="no-referrer" className="h-full w-full" />
            );
            if (img.source === 'local') {
              return (
                <div key={t.id} className="group absolute transition-all duration-300" style={style}>
                  {picture}
                  {img.kind === 'video' && (
                    <button
                      type="button"
                      aria-label={`Sound for ${img.name}`}
                      aria-pressed={audioId === img.id}
                      onClick={() => toggleAudio(img.id)}
                      className={twMerge(
                        'absolute bottom-1 left-1 rounded-full p-1 text-white',
                        audioId === img.id ? 'bg-primary text-primary-foreground' : 'bg-black/60'
                      )}
                    >
                      {audioId === img.id ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${img.name}`}
                    onClick={() => removeImage(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            }
            return (
              <a key={t.id} href="https://imgflip.com" target="_blank" rel="noreferrer" title={img.name} className="absolute block transition-all duration-300" style={style}>
                {picture}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Mosaic;
