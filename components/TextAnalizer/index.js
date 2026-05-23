'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-4 py-3">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    <span className="text-2xl font-bold tabular-nums">{value}</span>
  </div>
);

const StatGroup = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>
    <div className="grid grid-cols-2 gap-2">{children}</div>
  </div>
);

const TextAnalizer = () => {
  const [text, setText] = useState('');
  const [match, setMatch] = useState('');

  const words = text.split(/\s+/).filter((w) => w.trim() !== '');
  const uniqueWords = new Set(words);
  const matchCount = match.length > 0 ? text.split(match).length - 1 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 flex flex-col gap-3">
        <Textarea
          className="min-h-64"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Input your text..."
        />
        <Input
          value={match}
          onChange={(e) => setMatch(e.target.value)}
          placeholder="Search for matches..."
        />
      </div>

      <div className="flex flex-col gap-5">
        <StatGroup title="Characters">
          <StatCard label="No spaces" value={text.replace(/\s/g, '').length} />
          <StatCard label="With spaces" value={text.length} />
        </StatGroup>

        <StatGroup title="Words">
          <StatCard label="Total" value={words.length} />
          <StatCard label="Unique" value={uniqueWords.size} />
        </StatGroup>

        <StatGroup title="Structure">
          <StatCard label="Spaces" value={(text.match(/[ \t]/g) || []).length} />
          <StatCard label="Lines" value={text.length > 0 ? text.split('\n').length : 0} />
        </StatGroup>

        {match.length > 0 && (
          <StatGroup title="Search">
            <StatCard label={`"${match}"`} value={matchCount} />
          </StatGroup>
        )}
      </div>
    </div>
  );
};

export default TextAnalizer;
