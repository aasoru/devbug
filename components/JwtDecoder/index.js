'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base64UrlDecode } from './lib';

const EXAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const formatDate = (unix) =>
  new Date(unix * 1000).toLocaleString();

const ExpiryBadge = ({ exp }) => {
  if (!exp) return null;
  const expired = Date.now() / 1000 > exp;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expired ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
      {expired ? 'Expired' : 'Valid'}
    </span>
  );
};

const Section = ({ title, data, badge }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
      {badge}
    </div>
    <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

const JwtDecoder = () => {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const parts = token.trim().split('.');
  const isValid = parts.length === 3;
  const header = isValid ? base64UrlDecode(parts[0]) : null;
  const payload = isValid ? base64UrlDecode(parts[1]) : null;
  const hasError = token.trim().length > 0 && (!isValid || !header || !payload);

  const copy = () => {
    if (!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Token</span>
        <Button variant="outline" size="sm" onClick={() => setToken(EXAMPLE_TOKEN)}>
          Load example
        </Button>
      </div>
      <Textarea
        className="font-mono text-sm min-h-24"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste your JWT token here..."
        spellCheck={false}
      />

      {hasError && (
        <p className="text-sm text-destructive mt-2">Invalid JWT token.</p>
      )}

      {header && payload && (
        <div className="flex flex-col gap-4 mt-4">
          <Section title="Header" data={header} />
          <Section
            title="Payload"
            data={payload}
            badge={<ExpiryBadge exp={payload.exp} />}
          />

          {(payload.iat || payload.exp || payload.nbf) && (
            <div className="text-sm text-muted-foreground flex flex-col gap-1">
              {payload.iat && <span>Issued at: <strong>{formatDate(payload.iat)}</strong></span>}
              {payload.nbf && <span>Not before: <strong>{formatDate(payload.nbf)}</strong></span>}
              {payload.exp && <span>Expires at: <strong>{formatDate(payload.exp)}</strong></span>}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={copy}>
              {copied ? 'Copied!' : 'Copy payload'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground flex flex-col gap-1">
            <p>Signature is not verified — validation requires the secret key.</p>
            <p>The header and payload are Base64URL-encoded JSON, not encrypted. Anyone can read them. Only the signature proves the token hasn&apos;t been tampered with.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default JwtDecoder;
