'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const LINE_H = '1.5rem';

// Lines in a text, counted without splitting it into an array (it can be megabytes).
const countLines = (text) => {
  let lines = 1;
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) lines++;
  return lines;
};

// Which lines of a scrolling textarea are on screen: follows its scroll and size.
function useVisibleLines(ref, lineCount) {
  const [view, setView] = useState({ scrollTop: 0, height: 0, lineHeight: 24, paddingTop: 8 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setView({ scrollTop: el.scrollTop, height: el.clientHeight, lineHeight: parseFloat(cs.lineHeight), paddingTop: parseFloat(cs.paddingTop) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [ref]);

  const first = Math.max(1, Math.floor((view.scrollTop - view.paddingTop) / view.lineHeight) + 1);
  const last = Math.min(lineCount, first + Math.ceil(view.height / view.lineHeight) + 1);
  // Where the first rendered number goes so it lines up with its line of text.
  const offset = view.paddingTop + (first - 1) * view.lineHeight - view.scrollTop;
  return { first, last, offset };
}

// A textarea for code, with line numbers. Fixed height (set with className) and its own
// scroll, like a code editor; lines don't wrap, so each number matches one line. Only the
// numbers on screen are rendered: a big JSON has hundreds of thousands of lines, and one
// element per line made pasting it take over a minute.
const CodeTextarea = ({ value = '', onChange, placeholder, readOnly, className }) => {
  const textareaRef = useRef(null);
  const lineCount = useMemo(() => countLines(value), [value]);
  const { first, last, offset } = useVisibleLines(textareaRef, lineCount);
  const numbers = [];
  for (let n = first; n <= last; n++) numbers.push(n);

  return (
    <div className={twMerge('flex overflow-hidden rounded-md border bg-background font-mono text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2', className)}>
      <div
        aria-hidden
        className="select-none overflow-hidden bg-muted/40 text-muted-foreground text-right border-r px-3 shrink-0"
        style={{ lineHeight: LINE_H, minWidth: `${String(lineCount).length + 3}ch` }}
      >
        {numbers.map((n, i) => (
          <div key={n} style={{ height: LINE_H, marginTop: i === 0 ? offset : undefined }}>{n}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        wrap="off"
        className="flex-1 resize-none bg-transparent outline-hidden px-3 py-2 min-w-0 h-full"
        style={{ lineHeight: LINE_H }}
      />
    </div>
  );
};

export default CodeTextarea;
