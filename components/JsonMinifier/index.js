'use client';

import { useState } from 'react';
import CodeTextarea from '@/components/ui/code-textarea';
import { Button } from '@/components/ui/button';
import { minify, prettify } from './lib';

const JsonMinifier = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;
  const savings = inputBytes > 0 && outputBytes > 0
    ? Math.round((1 - outputBytes / inputBytes) * 100)
    : null;

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => process(null)}>Minify</Button>
        <Button variant="outline" onClick={() => process(2)}>Prettify</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

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
              <span className="text-green-500 ml-1">({savings}% smaller)</span>
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
