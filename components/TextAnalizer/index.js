'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DataTable from '@/components/TextAnalizer/Table';

const TextAnalizer = () => {
  const [text, setText] = useState('');
  const [match, setMatch] = useState('');

  const words = text.split(/\s+/).filter((w) => w.trim() !== '');
  const uniqueWords = new Set(words);
  const matchCount = match.length > 0 ? text.split(match).length - 1 : 0;

  const data = [
    { stat: 'Characters', count: text.replace(/\s/g, '').length },
    { stat: 'Characters (with spaces)', count: text.length },
    { stat: 'Words', count: words.length },
    { stat: 'Unique words', count: uniqueWords.size },
    { stat: 'Spaces', count: (text.match(/[ \t]/g) || []).length },
    { stat: 'Lines', count: text.length > 0 ? text.split('\n').length : 0 },
    ...(match.length > 0 ? [{ stat: `Matches "${match}"`, count: matchCount }] : []),
  ];

  const columns = [
    { accessorKey: 'stat', header: 'Stat' },
    { accessorKey: 'count', header: 'Count' },
  ];

  return (
    <>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Input your text..."
      />
      <div className="py-2" />
      <Input
        value={match}
        onChange={(e) => setMatch(e.target.value)}
        placeholder="Search for matches..."
      />
      <div className="py-4" />
      <DataTable columns={columns} data={data} className="table-fixed text-center" />
    </>
  );
};

export default TextAnalizer;
