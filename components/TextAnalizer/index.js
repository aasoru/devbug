'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardDescription } from '@/components/ui/card';

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-4 py-3">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    <span className="text-2xl font-bold tabular-nums">{value}</span>
  </div>
);

const StatTitle = ({ className, children }) => (
  <span className={twMerge('text-xs font-semibold text-muted-foreground uppercase tracking-widest', className)}>
    {children}
  </span>
);

const StatGrid = ({ children }) => <div className="grid grid-cols-2 gap-2">{children}</div>;

const StatGroup = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <StatTitle>{title}</StatTitle>
    <StatGrid>{children}</StatGrid>
  </div>
);

// Two-row grid on md+: [description | "Characters"] then [textarea | stat cards],
// so the description lines up with the first stat title and the textarea with the first cards.
// On mobile, `order` keeps the natural reading order: description, textarea, stats.
const TextAnalizer = ({ description }) => {
  const [text, setText] = useState('');
  const [match, setMatch] = useState('');

  const words = text.split(/\s+/).filter((w) => w.trim() !== '');
  const uniqueWords = new Set(words);
  const matchCount = match.length > 0 ? text.split(match).length - 1 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
      <CardDescription className="order-1 md:col-span-2 md:self-baseline">
        {description}
      </CardDescription>

      <StatTitle className="order-3 mt-4 md:order-none md:mt-0 md:col-start-3 md:row-start-1 md:self-baseline">
        Characters
      </StatTitle>

      <div className="order-2 mt-2 md:order-none md:mt-0 md:col-span-2 md:row-start-2 flex flex-col gap-3">
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

      <div className="order-4 md:order-none md:col-start-3 md:row-start-2 flex flex-col gap-5">
        <StatGrid>
          <StatCard label="No spaces" value={text.replace(/\s/g, '').length} />
          <StatCard label="With spaces" value={text.length} />
        </StatGrid>

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
