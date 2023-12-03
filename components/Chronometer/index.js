'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Chronometer = () => {
  const [time, setTime] = useState({
    ms: 0,
    s: 0,
    m: 0,
    h: 0,
  });

  const [interv, setInterv] = useState();
  const [status, setStatus] = useState(0); // Not started = 0 // started = 1 // stopped = 2

  const start = () => {
    run();
    setStatus(1);
    setInterv(setInterval(run, 10));
  };

  var updatedMs = time.ms,
    updatedS = time.s,
    updatedM = time.m,
    updatedH = time.h;

  const run = () => {
    if (updatedM === 60) {
      updatedH++;
      updatedM = 0;
    }
    if (updatedS === 60) {
      updatedM++;
      updatedS = 0;
    }
    if (updatedMs === 100) {
      updatedS++;
      updatedMs = 0;
    }
    updatedMs++;
    return setTime({ ms: updatedMs, s: updatedS, m: updatedM, h: updatedH });
  };

  const stop = () => {
    clearInterval(interv);
    setStatus(2);
  };

  const reset = () => {
    clearInterval(interv);
    setStatus(0);
    setTime({ ms: 0, s: 0, m: 0, h: 0 });
  };

  const resume = () => start();
  return (
    <>
      <div className="flex p-6 w-full text-center justify-center text-3xl font-mono">
        <span>{String('0' + time.m).slice(-2)}</span>
        <span>:</span>
        <span>{String('0' + time.s).slice(-2)}</span>
        <span>:</span>
        <span>{String('0' + time.ms).slice(-2)}</span>
      </div>

      <div className="flex grow gap-5 items-center justify-center">
        {status === 1 && (
          <>
            <Button onClick={stop}>Stop</Button>
            <Button onClick={reset}>Reset</Button>
          </>
        )}
        {status === 2 && (
          <>
            <Button onClick={resume}>Resume</Button>
            <Button onClick={reset}>Reset</Button>
          </>
        )}
        {status === 0 && (
          <>
            <Button onClick={start}>Start</Button>
            <Button onClick={reset}>Reset</Button>
          </>
        )}
      </div>
    </>
  );
};

export default Chronometer;
