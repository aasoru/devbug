// Screen orientation while in full screen (Screen Orientation API). Seen on Chrome for Android:
// once the mosaic is full screen the orientation stays pinned. Where the API is missing (iPhone
// Safari) or refuses (not full screen, desktop), this does nothing.

// Lets the phone rotate freely again.
export function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // not supported here
  }
}
