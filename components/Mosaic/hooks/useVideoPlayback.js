'use client';

import { useEffect, useRef, useState } from 'react';

const DOUBLE_TAP_MS = 300;

const videosIn = (ref) => ref.current?.querySelectorAll('video') ?? [];

// Videos inside `ref`'s element: all play (muted, looped) or all pause, and at most one has
// sound. One video can be shown big (focused), with its controls. `layout` is whatever changes
// when videos appear or move, so new ones follow too.
export function useVideoPlayback(ref, layout) {
  const [playing, setPlaying] = useState(true);
  const [audioId, setAudioId] = useState(null); // the one video with sound, if any
  const [focusedId, setFocusedId] = useState(null); // the video shown big, if any
  const lastTap = useRef({ id: null, time: 0 });

  useEffect(() => {
    videosIn(ref).forEach((v) => {
      if (playing) v.play().catch(() => {});
      else v.pause();
    });
  }, [ref, playing, layout]);

  // `muted` is set on the elements right here, inside the tap, because browsers only allow
  // unmuting as a direct response to a user gesture.
  const setSound = (id) => {
    setAudioId(id);
    videosIn(ref).forEach((v) => { v.muted = v.dataset.id !== id; });
  };

  const toggleAudio = (id) => setSound(audioId === id ? null : id);

  const focus = (id) => {
    setFocusedId(id);
    setSound(id);
  };

  const unfocus = () => {
    setFocusedId(null);
    setSound(null);
  };

  // One tap toggles the video's sound (and mutes the rest). A second tap on the same video
  // within DOUBLE_TAP_MS shows it big with sound — undoing the first tap, so at most there's a
  // blip of sound in between, and single taps never wait.
  const tap = (id) => {
    const now = performance.now();
    const double = lastTap.current.id === id && now - lastTap.current.time < DOUBLE_TAP_MS;
    lastTap.current = double ? { id: null, time: 0 } : { id, time: now };
    if (double) focus(id);
    else toggleAudio(id);
  };

  return {
    playing,
    audioId,
    focusedId,
    togglePlaying: () => setPlaying((p) => !p),
    toggleAudio,
    tap,
    unfocus,
    forget: (id) => { // the video is gone
      if (audioId === id) setAudioId(null);
      if (focusedId === id) setFocusedId(null);
    },
    reset: () => {
      setAudioId(null);
      setFocusedId(null);
    },
  };
}
