'use client';

import { Button } from '@/components/ui/button';
import { useStopwatch } from './hooks/useStopwatch';
import { formatTime } from './lib';

const Chronometer = () => {
  const { elapsed, running, laps, start, stop, reset, lap } = useStopwatch();

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
