'use client';

import { useEffect, useState } from 'react';

const videosIn = (ref) => ref.current?.querySelectorAll('video') ?? [];

// Videos inside `ref`'s element: all play (muted, looped) or all pause, and at most one has
// sound. `layout` is whatever changes when videos appear or move, so new ones follow too.
export function useVideoPlayback(ref, layout) {
  const [playing, setPlaying] = useState(true);
  const [audioId, setAudioId] = useState(null); // the one video with sound, if any

  useEffect(() => {
    videosIn(ref).forEach((v) => {
      if (playing) v.play().catch(() => {});
      else v.pause();
    });
  }, [ref, playing, layout]);

  // Clicking a video turns its sound on and mutes the rest; clicking it again mutes it.
  // `muted` is set on the elements right here, inside the click, because browsers only allow
  // unmuting as a direct response to a user gesture.
  const toggleAudio = (id) => {
    const next = audioId === id ? null : id;
    setAudioId(next);
    videosIn(ref).forEach((v) => { v.muted = v.dataset.id !== next; });
  };

  return {
    playing,
    audioId,
    togglePlaying: () => setPlaying((p) => !p),
    toggleAudio,
    forget: (id) => { if (audioId === id) setAudioId(null); }, // the video is gone
    reset: () => setAudioId(null),
  };
}
