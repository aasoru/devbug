'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const pad = (n) => String(n).padStart(2, '0');

const formatTime = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`
    : `${pad(m)}:${pad(s)}.${pad(cs)}`;
};

const Chronometer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);
  const startRef = useRef(0);
  const accRef = useRef(0);

  const start = () => {
    startRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(accRef.current + Date.now() - startRef.current);
    }, 10);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    accRef.current += Date.now() - startRef.current;
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    accRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const lap = () => setLaps((prev) => [...prev, elapsed]);

  return (
    <>
      <div className="flex p-6 w-full text-center justify-center text-5xl font-mono">
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4 items-center justify-center">
        {!running ? (
          <Button onClick={start}>{elapsed === 0 ? 'Start' : 'Resume'}</Button>
        ) : (
          <>
            <Button onClick={stop}>Stop</Button>
            <Button onClick={lap} variant="outline">Lap</Button>
          </>
        )}
        <Button onClick={reset} variant="outline" disabled={elapsed === 0}>
          Reset
        </Button>
      </div>

      {laps.length > 0 && (
        <ul className="mt-6 w-full max-w-xs mx-auto divide-y text-sm font-mono">
          {laps.map((lapTime, i) => (
            <li key={i} className="flex justify-between py-1.5 px-2">
              <span className="text-muted-foreground">Lap {i + 1}</span>
              <span>{formatTime(lapTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Chronometer;
