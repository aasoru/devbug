'use client';

import { useEffect, useRef, useState } from 'react';

// A stopwatch: elapsed ms, running or not, and laps. Time comes from performance.now()
// (monotonic: unaffected by system clock changes), so the display is only a view of it.
// While running, the display updates once per animation frame — as often as the screen can
// show, no more, and not at all in a hidden tab (the time is still right when it comes back).
// Leaving the page cancels the frame loop: nothing keeps running in the background.
export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startedAt = useRef(0); // performance.now() when the current run started
  const before = useRef(0); // ms counted by previous runs

  const now = () => before.current + performance.now() - startedAt.current;

  useEffect(() => {
    if (!running) return;
    let frame;
    const tick = () => {
      setElapsed(now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const start = () => {
    startedAt.current = performance.now();
    setRunning(true);
  };

  const stop = () => {
    before.current = now();
    setElapsed(before.current);
    setRunning(false);
  };

  const reset = () => {
    before.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const lap = () => setLaps((prev) => [...prev, now()]);

  return { elapsed, running, laps, start, stop, reset, lap };
}
