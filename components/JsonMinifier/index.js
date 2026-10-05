'use client';

import { useMemo, useState } from 'react';
import CodeTextarea from '@/components/ui/code-textarea';
import { Button } from '@/components/ui/button';
import { minify, prettify, sizeChange, utf8Bytes } from './lib';
import { useCopyToClipboard, copyLabel } from '@/hooks/useCopyToClipboard';
import CopyErrorAlert from '@/components/CopyErrorAlert';

const JsonMinifier = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { copy: copyText, status: copyStatus, error: copyError, dismissError } = useCopyToClipboard();

  const process = (indent) => {
    if (!input.trim()) return;
    try {
      setOutput(indent === null ? minify(input) : prettify(input, indent));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => {
    if (output) copyText(output);
  };

  // Counted only when each text changes (not on every render, e.g. the copy button's state):
  // a big JSON has millions of characters.
  const inputBytes = useMemo(() => utf8Bytes(input), [input]);
  const outputBytes = useMemo(() => utf8Bytes(output), [output]);
  const savings = sizeChange(inputBytes, outputBytes);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={() => process(null)}>Minify</Button>
        <Button variant="outline" onClick={() => process(2)}>Prettify</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>
          {copyLabel(copyStatus)}
        </Button>
      </div>

      <CopyErrorAlert message={copyError} onDismiss={dismissError} className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Input {inputBytes > 0 && `· ${inputBytes} bytes`}
          </span>
          <CodeTextarea
            className="min-h-[500px]"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); }}
            placeholder='Paste your JSON here...'
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Output {outputBytes > 0 && `· ${outputBytes} bytes`}
            {savings !== null && savings > 0 && (
              <span className="text-green-700 dark:text-green-400 ml-1">({savings}% smaller)</span>
            )}
            {savings !== null && savings < 0 && (
              <span className="text-muted-foreground ml-1">({Math.abs(savings)}% larger)</span>
            )}
          </span>
          <CodeTextarea
            className="min-h-[500px]"
            value={error ? error : output}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </>
  );
};

export default JsonMinifier;
