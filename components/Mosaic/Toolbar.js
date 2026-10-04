import { Maximize, Minimize, Pause, Play, SlidersHorizontal, Trash2 } from 'lucide-react';
import { formatSize, LOCAL_LIMITS } from './limits';
import { AddMenu } from './AddMenu';
import { ToolbarButton } from './ToolbarButton';

// What happens with the user's files and where memes come from (hidden in full screen).
const PrivacyNote = () => (
  <p className="text-xs text-muted-foreground">
    Your files stay on this device — nothing is uploaded. Up to {LOCAL_LIMITS.maxFiles} files:{' '}
    images up to {formatSize(LOCAL_LIMITS.maxBytes, 0)} and {LOCAL_LIMITS.maxPixels / 1e6} MP (scaled down to {LOCAL_LIMITS.maxSide} px),{' '}
    and {LOCAL_LIMITS.maxVideos} videos up to {formatSize(LOCAL_LIMITS.maxVideoBytes, 0)} and 4K. Videos play muted: tap one to hear it (one at a time), double-tap it to see it big with its controls.{' '}
    Memes load from{' '}
    <a href="https://imgflip.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">imgflip.com</a>{' '}
    only when you pick “Load random memes” from the arrow next to “Add files”.
  </p>
);

// Actions for the mosaic. In full screen they live in the bottom sheet (`expanded`), where the
// options are always shown, so there's no options toggle and no privacy note.
export function Toolbar({ expanded, add, playback, hasItems, onClear, optionsShown, onToggleOptions, onToggleFullscreen }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AddMenu {...add} />
      {playback.hasVideos && (
        <ToolbarButton
          icon={playback.playing ? Pause : Play}
          label={playback.playing ? 'Pause all' : 'Play all'}
          onClick={playback.togglePlaying}
        />
      )}
      {hasItems && <ToolbarButton icon={Trash2} label="Clear" onClick={onClear} />}
      {!expanded && (
        <ToolbarButton
          icon={SlidersHorizontal}
          label={optionsShown ? 'Hide options' : 'Show options'}
          onClick={onToggleOptions}
          aria-expanded={optionsShown}
          aria-controls="mosaic-options"
        />
      )}
      <ToolbarButton
        icon={expanded ? Minimize : Maximize}
        label={expanded ? 'Exit full screen' : 'Full screen'}
        onClick={onToggleFullscreen}
      />
      {!expanded && <PrivacyNote />}
    </div>
  );
}
