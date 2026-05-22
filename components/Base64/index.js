'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const encode = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const decode = (str) => {
  try {
    const binary = atob(str.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

const Base64 = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Input</span>
          <Textarea
            className="min-h-[200px] font-mono text-sm"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); }}
            placeholder="Text or Base64..."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Output</span>
          <Textarea
            className="min-h-[200px] font-mono text-sm"
            value={error || output}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      <div className="flex gap-2 mt-4">
        <Button onClick={() => process(encode, 'Encoding failed.')}>Encode</Button>
        <Button variant="outline" onClick={() => process(decode, 'Invalid Base64 string.')}>Decode</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </>
  );
};

export default Base64;
