import { Maximize, Minimize, Pause, Play, SlidersHorizontal, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { LOCAL_LIMITS } from './limits';
import { AddMenu } from './AddMenu';
import { ToolbarButton } from './ToolbarButton';

const MB = 1024 * 1024;

// What happens with the user's files and where memes come from (hidden in full screen).
const PrivacyNote = () => (
  <p className="text-xs text-muted-foreground">
    Your files stay on this device — nothing is uploaded. Up to {LOCAL_LIMITS.maxFiles} files:{' '}
    images up to {LOCAL_LIMITS.maxBytes / MB} MB and {LOCAL_LIMITS.maxPixels / 1e6} MP (scaled down to {LOCAL_LIMITS.maxSide} px),{' '}
    and {LOCAL_LIMITS.maxVideos} videos up to {LOCAL_LIMITS.maxVideoBytes / MB} MB. Videos play muted: click one to hear it (one at a time).{' '}
    Memes load from{' '}
    <a href="https://imgflip.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">imgflip.com</a>{' '}
    only when you pick “Load random memes” from the arrow next to “Add files”.
  </p>
);

// Actions above the mosaic. `compact` (full screen) shrinks it to one row of icons.
export function Toolbar({ compact, add, playback, hasItems, onClear, optionsShown, onToggleOptions, onToggleFullscreen }) {
  return (
    <div className={twMerge('flex flex-wrap items-center', compact ? 'gap-2' : 'gap-3')}>
      <AddMenu compact={compact} {...add} />
      {playback.hasVideos && (
        <ToolbarButton
          icon={playback.playing ? Pause : Play}
          label={playback.playing ? 'Pause all' : 'Play all'}
          compact={compact}
          onClick={playback.togglePlaying}
        />
      )}
      {hasItems && <ToolbarButton icon={Trash2} label="Clear" compact={compact} onClick={onClear} />}
      <ToolbarButton
        icon={SlidersHorizontal}
        label={optionsShown ? 'Hide options' : 'Show options'}
        compact={compact}
        onClick={onToggleOptions}
        aria-expanded={optionsShown}
        aria-controls="mosaic-options"
      />
      <ToolbarButton
        icon={compact ? Minimize : Maximize}
        label={compact ? 'Exit full screen' : 'Full screen'}
        compact={compact}
        onClick={onToggleFullscreen}
      />
      {!compact && <PrivacyNote />}
    </div>
  );
}
