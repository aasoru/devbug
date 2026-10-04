import { Minimize2, Volume2, VolumeX, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useDismiss } from '@/hooks/useDismiss';

const TILE = 'absolute transition-all duration-300';
const CORNER_BUTTON = 'absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white';

// The image or video itself, filling its tile. A focused video shows its own controls, and taps
// go to them instead of toggling the sound.
function Picture({ item, playback, focused }) {
  if (item.kind === 'video') {
    return (
      // Muted + playsInline: required for autoplay (iPhone Safari won't autoplay otherwise).
      <video
        src={item.url}
        data-id={item.id}
        aria-label={item.name}
        muted={playback.audioId !== item.id}
        loop
        playsInline
        autoPlay={playback.playing}
        preload="auto"
        controls={focused}
        onClick={focused ? undefined : () => playback.tap(item.id)}
        className={twMerge('h-full w-full', !focused && 'cursor-pointer')}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/local images with known size; next/image would proxy them through our server
    <img src={item.url} alt={item.name} width={item.width} height={item.height} referrerPolicy="no-referrer" className="h-full w-full" />
  );
}

// Sound on/off for one video (the keyboard-friendly twin of clicking the video). Only the video
// with sound shows it; on muted ones it's invisible until reached with the keyboard.
function SoundButton({ item, playback }) {
  const on = playback.audioId === item.id;
  return (
    <button
      type="button"
      aria-label={`Sound for ${item.name}`}
      aria-pressed={on}
      onClick={() => playback.toggleAudio(item.id)}
      className={twMerge(
        'absolute bottom-1 left-1 rounded-full p-1 text-white transition-opacity',
        on ? 'bg-primary text-primary-foreground' : 'bg-black/60 opacity-0 focus-visible:opacity-100'
      )}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

// Back from the big video to the mosaic (Esc too); its sound goes off.
function UnfocusButton({ item, playback }) {
  useDismiss(null, true, playback.unfocus);
  return (
    <button type="button" aria-label={`Back to the mosaic from ${item.name}`} onClick={playback.unfocus} className={CORNER_BUTTON}>
      <Minimize2 className="h-4 w-4" />
    </button>
  );
}

// One placed item. The user's files can be removed (and videos unmuted, or shown big over the
// whole frame); memes link back to imgflip.com, as its terms require.
export function Tile({ item, box, playback, onRemove }) {
  const focused = playback.focusedId === item.id;
  const style = focused
    ? { left: 0, top: 0, width: '100%', height: '100%' } // the frame's inside, within its border
    : { left: box.x, top: box.y, width: box.width, height: box.height };

  if (item.source !== 'local') {
    return (
      <a href="https://imgflip.com" target="_blank" rel="noreferrer" title={item.name} className={twMerge(TILE, 'block')} style={style}>
        <Picture item={item} playback={playback} />
      </a>
    );
  }

  return (
    <div className={twMerge(TILE, 'group', focused && 'z-10 bg-black')} style={style}>
      <Picture item={item} playback={playback} focused={focused} />
      {focused ? (
        <UnfocusButton item={item} playback={playback} />
      ) : (
        <>
          {item.kind === 'video' && <SoundButton item={item} playback={playback} />}
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => onRemove(item.id)}
            className={twMerge(CORNER_BUTTON, 'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100')}
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
