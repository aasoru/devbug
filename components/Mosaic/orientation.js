// Screen orientation while in full screen (Screen Orientation API). Seen on Chrome for Android:
// once the mosaic is full screen the orientation stays pinned, and a wide video opened inside it
// doesn't turn to landscape (it does when opened from the normal page). Where the API is
// missing (iPhone Safari) or refuses (not full screen, desktop), these do nothing.

// Turns the screen to landscape, e.g. for a wide video in its player.
export function lockLandscape() {
  screen.orientation?.lock?.('landscape').catch(() => {});
}

// Lets the phone rotate freely again.
export function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // not supported here
  }
}
