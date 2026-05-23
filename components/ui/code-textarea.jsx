'use client';

import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const LINE_H = '1.5rem';

const CodeTextarea = ({ value = '', onChange, placeholder, readOnly, className }) => {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = Math.max(value.split('\n').length, 1);

  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex overflow-hidden rounded-md border bg-background font-mono text-sm">
      <div
        ref={gutterRef}
        aria-hidden
        className="select-none overflow-hidden bg-muted/40 text-muted-foreground text-right border-r px-3 py-2 shrink-0 min-w-12"
        style={{ lineHeight: LINE_H }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ height: LINE_H }}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className={twMerge(
          'flex-1 resize-none bg-transparent outline-none px-3 py-2 min-w-0',
          className
        )}
        style={{ lineHeight: LINE_H }}
      />
    </div>
  );
};

export default CodeTextarea;
