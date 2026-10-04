'use client';

import { useEffect, useRef, useState } from 'react';

import { unlockOrientation } from '../orientation';

const DOUBLE_TAP_MS = 300;

const videosIn = (ref) => ref.current?.querySelectorAll('video') ?? [];
const videoById = (ref, id) => [...videosIn(ref)].find((v) => v.dataset.id === id);

// Opens the system's full screen player for a video: the Fullscreen API, or on iPhone Safari
// (which only allows full screen for videos) its own player. onFail: it couldn't open.
// The orientation is left to the browser: forcing landscape here fought Chrome for Android's own
// handling and threw the user out of full screen (portrait phone, wide video).
const openPlayer = (video, onFail) => {
  if (video.requestFullscreen) video.requestFullscreen().catch(onFail);
  else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  else onFail();
};

// Videos inside `ref`'s element: all play (muted, looped) or all pause, and at most one has
// sound. A double tap opens one in the system's full screen player. `layout` is whatever
// changes when videos appear or move, so new ones follow too.
export function useVideoPlayback(ref, layout) {
  const [playing, setPlaying] = useState(true);
  const [audioId, setAudioId] = useState(null); // the one video with sound, if any
  // The video in the full screen player, if any, and whether it had sound before (kept on leaving).
  const [player, setPlayer] = useState(null); // { id, keepSound }
  const lastTap = useRef({ id: null, time: 0, hadSound: false });

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

  // Leaving the player (back, its close button, Esc) returns to the mosaic keeping the video's
  // sound only if it had it before the double tap and still has it (it may have been muted with
  // the player's controls); otherwise it's muted.
  useEffect(() => {
    const video = player && videoById(ref, player.id);
    if (!video) return;
    let closed = false; // leaving nested full screen fires fullscreenchange more than once
    const close = () => {
      if (closed) return;
      closed = true;
      setPlayer(null);
      unlockOrientation();
      if (player.keepSound && !video.muted) return; // it's already the one unmuted video
      setAudioId(null);
      video.muted = true;
    };
    const onFullscreenChange = () => { if (document.fullscreenElement !== video) close(); };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    video.addEventListener('webkitendfullscreen', close); // iPhone Safari's player
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      video.removeEventListener('webkitendfullscreen', close);
    };
  }, [ref, player]);

  const toggleAudio = (id) => setSound(audioId === id ? null : id);

  // One tap toggles the video's sound (and mutes the rest). A second tap on the same video
  // within DOUBLE_TAP_MS opens it in the full screen player with sound — undoing the first tap,
  // so at most there's a blip of sound in between, and single taps never wait.
  const tap = (id) => {
    const now = performance.now();
    const { id: lastId, time, hadSound } = lastTap.current;
    const double = lastId === id && now - time < DOUBLE_TAP_MS;
    lastTap.current = double ? { id: null, time: 0, hadSound: false } : { id, time: now, hadSound: audioId === id };
    if (!double) {
      toggleAudio(id);
      return;
    }
    setSound(id);
    setPlayer({ id, keepSound: hadSound });
    const video = videoById(ref, id);
    if (video) openPlayer(video, () => setPlayer(null));
  };

  return {
    playing,
    audioId,
    playerId: player?.id ?? null,
    togglePlaying: () => setPlaying((p) => !p),
    toggleAudio,
    tap,
    forget: (id) => { if (audioId === id) setAudioId(null); }, // the video is gone
    reset: () => setAudioId(null),
  };
}
