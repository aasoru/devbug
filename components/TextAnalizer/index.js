'use client';

import { useState } from 'react';

import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';

import DataTable from '@/components/TextAnalizer/Table';

const TextAnalizer = () => {
  const [text, setText] = useState('');
  const [match, setMatch] = useState('');
  const [matchCounter, setMatchCounter] = useState(0);
  const [wordCounter, setWordCounter] = useState(0);
  const [characterCounter, setCharacterCounter] = useState(0);
  const [spacesCounter, setSpacesCounter] = useState(0);
  const [uniqueWordsCounter, setUniqueWordsCounter] = useState(0);

  const onChange = (e) => {
    const { value } = e.target;
    wordsHandle(value);
    spacesHandle(value);
    uniqueWordsHandle(value);

    const textWithoutSpaces = value.replace(/\s/g, '');
    setCharacterCounter(textWithoutSpaces.length);

    setText(value);
  };

  const wordsHandle = (text) => {
    const words = text.split(/\s+/).filter((word) => word.trim() !== '');
    setWordCounter(words.length);
  };

  const spacesHandle = (text) =>
    setSpacesCounter((text.match(/[ \t]/g) || []).length);

  const uniqueWordsHandle = (text) => {
    // Use Set to avoid words repetitions
    const uniqueWordsSet = new Set(
      text.split(/\s+/).filter((word) => word.trim() !== '')
    );

    setUniqueWordsCounter(uniqueWordsSet.size);
  };

  const matchSearch = (e) => {
    const { value } = e.target;
    setMatch(value);

    if (value.length === 0) setMatchCounter(0);
    else setMatchCounter(text.split(value).length - 1);
  };

  const data = [
    { title: 'Characters', value: characterCounter },
    { title: 'Spaces', value: spacesCounter },
    { title: 'Unique Words', value: uniqueWordsCounter },
    { title: 'Letter', value: text.length },
    { title: 'Words', value: wordCounter },
    { title: 'Lines', value: text.length > 0 ? text.split('\n').length : 0 },
    //{ title: 'Coincidences', value: matchCounter },
  ];

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
  ];
  return (
    <>
      <Textarea
        value={text}
        onChange={onChange}
        placeholder="Input your text... "
      />
      {/* <div className="py-2" />
        <Label>
          Search match
          <Input
            value={match}
            onChange={matchSearch}
            placeholder="Search for any value"
          />
        </Label> */}
      <div className="py-4" />
      <DataTable
        columns={columns}
        data={data}
        className="table-fixed text-center"
      />
      {/* <table className="table-fixed overflow-hidden w-full max-w-3xl mx-auto my-1 border-collapse ">
        <tbody>
          {data.map((item, key) => {
            return (
              <tr
                key={key}
                className="text-center align-middle bg-gray-500 border border-slate-200"
              >
                <td className="p-2.5 border border-slate-200">{item.title}</td>
                <td className="p-2.5 border border-slate-200">{item.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table> */}
    </>
  );
};

export default TextAnalizer;
