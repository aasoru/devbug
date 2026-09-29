'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { encode, decode } from './lib';
import { useCopyToClipboard, copyLabel } from '@/hooks/useCopyToClipboard';
import CopyErrorAlert from '@/components/CopyErrorAlert';

const Base64 = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { copy: copyText, status: copyStatus, error: copyError, dismissError } = useCopyToClipboard();

  const process = (fn, errorMsg) => {
    if (!input.trim()) return;
    const result = fn(input);
    if (result === null) {
      setError(errorMsg);
      setOutput('');
    } else {
      setOutput(result);
      setError('');
    }
  };

  const copy = () => {
    if (output) copyText(output);
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => process(encode, 'Encoding failed.')}>Encode</Button>
        <Button variant="outline" onClick={() => process(decode, 'Invalid Base64 string.')}>Decode</Button>
        <Button variant="outline" onClick={copy} disabled={!output} className={copyStatus === 'error' ? 'text-destructive' : undefined}>
          {copyLabel(copyStatus)}
        </Button>
      </div>

      <CopyErrorAlert message={copyError} onDismiss={dismissError} className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Input</span>
          <Textarea
            className="min-h-48 font-mono text-sm"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); }}
            placeholder="Text or Base64..."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Output</span>
          <Textarea
            className="min-h-48 font-mono text-sm"
            value={error || output}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </>
  );
};

export default Base64;
