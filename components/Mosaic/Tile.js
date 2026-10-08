import { Volume2, VolumeX, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const TILE = 'absolute transition-all duration-300';

// The image or video itself, filling its tile. A video in the full screen player shows its
// controls there, and taps go to them instead of toggling the sound.
function Picture({ item, playback }) {
  if (item.kind === 'video') {
    const inPlayer = playback.playerId === item.id;
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
        controls={inPlayer}
        onClick={inPlayer ? undefined : () => playback.tap(item.id)}
        className="h-full w-full cursor-pointer"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/local images with known size; next/image would proxy them through our server
    <img src={item.url} alt={item.name} width={item.width} height={item.height} referrerPolicy="no-referrer" className="h-full w-full" />
  );
}

// Sound on/off for one video: the keyboard-friendly twin of tapping the video, and the sign of
// which video plays sound. Only that video shows it; on muted ones it's invisible until reached
// with the keyboard. It never takes taps: they go to the video, which toggles the sound the same
// way — and a double tap anywhere on the video, this corner included, must open it.
function SoundButton({ item, playback }) {
  const on = playback.audioId === item.id;
  return (
    <button
      type="button"
      aria-label={`Sound for ${item.name}`}
      aria-pressed={on}
      onClick={() => playback.toggleAudio(item.id)}
      className={twMerge(
        'pointer-events-none absolute bottom-1 left-1 rounded-full p-1 text-white transition-opacity',
        on ? 'bg-primary text-primary-foreground' : 'bg-black/60 opacity-0 focus-visible:opacity-100'
      )}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

// One placed item. The user's files can be removed (and videos unmuted); memes link back to
// imgflip.com, as its terms require.
export function Tile({ item, box, playback, onRemove }) {
  const style = { left: box.x, top: box.y, width: box.width, height: box.height };

  if (item.source !== 'local') {
    return (
      <a href="https://imgflip.com" target="_blank" rel="noreferrer" title={item.name} className={twMerge(TILE, 'block')} style={style}>
        <Picture item={item} playback={playback} />
      </a>
    );
  }

  return (
    <div className={twMerge(TILE, 'group')} style={style}>
      <Picture item={item} playback={playback} />
      {item.kind === 'video' && <SoundButton item={item} playback={playback} />}
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={() => onRemove(item.id)}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
