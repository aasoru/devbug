'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ContentCopyIcon from '@/public/images/icons/content-copy.svg';
import {
  EMPTY_PERMS, PRESETS,
  toOctalString, toPermString, describePerms,
  parseOctal, parseSymbolic,
} from '@/lib/chmod';

const ENTITIES = [
  { key: 'owner', label: 'Owner (u)' },
  { key: 'group', label: 'Group (g)' },
  { key: 'other', label: 'Others (o)' },
];

const BITS = [
  { key: 'read',    label: 'Read',    value: 4 },
  { key: 'write',   label: 'Write',   value: 2 },
  { key: 'execute', label: 'Execute', value: 1 },
];

const SPECIAL = [
  { key: 'setuid', label: 'Setuid', value: 4000 },
  { key: 'setgid', label: 'Setgid', value: 2000 },
  { key: 'sticky', label: 'Sticky', value: 1000 },
];

export default function ChmodCalculator() {
  const [perms, setPerms] = useState(EMPTY_PERMS);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState(false);
  const [copied, setCopied] = useState(false);

  const applyPerms = (next) => {
    setPerms(next);
    setInput(toOctalString(next));
    setInputError(false);
  };

  const toggle = (entity, bit) =>
    applyPerms({ ...perms, [entity]: { ...perms[entity], [bit]: !perms[entity][bit] } });

  const handleInput = (raw) => {
    setInput(raw);
    if (!raw.trim()) { setPerms(EMPTY_PERMS); setInputError(false); return; }
    const parsed = parseOctal(raw) || parseSymbolic(raw);
    if (parsed) { setPerms(parsed); setInputError(false); }
    else setInputError(true);
  };

  const octal = toOctalString(perms);
  const symbolic = toPermString(perms);
  const description = describePerms(perms);
  const chmodCmd = `chmod ${octal} path`;

  const handleCopy = () => {
    navigator.clipboard.writeText(chmodCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card>
        <CardTitle>CHMOD Generator</CardTitle>
        <div className="py-4" />
        <CardDescription>
          Calculate Unix file permissions. Toggle bits or type a permission string (e.g. <code>755</code> or <code>rwxr-xr-x</code>) to update the values.
        </CardDescription>

        <CardContent>
          <div className="flex flex-col gap-6 mt-2">

            {/* Presets + input */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p) => (
                  <Button key={p.label} variant="outline" size="sm" onClick={() => applyPerms(parseOctal(p.value))}>
                    {p.label}
                  </Button>
                ))}
              </div>
              <Input
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="755 or rwxr-xr-x"
                className={inputError ? 'border-destructive' : ''}
              />
              {inputError && <p className="text-xs text-destructive">Invalid permission string.</p>}
            </div>

            {/* Permission table */}
            <table className="w-full max-w-2xl mx-auto">
              <thead>
                <tr>
                  <th className="text-center p-2" />
                  {ENTITIES.map((e) => (
                    <th key={e.key} className="text-center p-2 font-medium">{e.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BITS.map((bit) => (
                  <tr key={bit.key}>
                    <td className="text-center align-middle p-2 text-sm text-muted-foreground">
                      {bit.label} ({bit.value})
                    </td>
                    {ENTITIES.map((entity) => (
                      <td key={entity.key} className="text-center align-middle p-2">
                        <Checkbox
                          className="h-8 w-8 mx-auto"
                          checked={perms[entity.key][bit.key]}
                          onClick={() => toggle(entity.key, bit.key)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Special bits */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Special bits</span>
              <div className="flex justify-center gap-8">
                {SPECIAL.map((bit) => (
                  <div key={bit.key} className="flex flex-col items-center gap-2">
                    <Checkbox
                      className="h-8 w-8 mx-auto"
                      checked={perms.special[bit.key]}
                      onClick={() => toggle('special', bit.key)}
                    />
                    <span className="text-sm text-muted-foreground">{bit.label}</span>
                    <span className="text-xs text-muted-foreground">{bit.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl font-mono font-bold tracking-widest">{octal}</span>
              <span className="text-3xl font-mono text-muted-foreground">{symbolic}</span>
            </div>

            {/* Human-readable description */}
            <div className="flex flex-col items-center gap-1">
              {description.map((line, i) => (
                <span key={i} className="text-sm text-muted-foreground">{line}</span>
              ))}
            </div>

            {/* Copy command */}
            <div className="flex w-full max-w-sm mx-auto items-center gap-2">
              <Input value={chmodCmd} readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleCopy}>
                      <ContentCopyIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

          </div>
        </CardContent>
      </Card>
    </>
  );
}
