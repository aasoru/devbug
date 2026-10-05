'use client';

import { useState } from 'react';

import { CopyCommand } from './CopyCommand';
import { EMPTY_PERMS, parseOctal, parsePerms, togglePerm, toOctalString } from './lib';
import { PermissionInput } from './PermissionInput';
import { PermissionOutput } from './PermissionOutput';
import { PermissionTable } from './PermissionTable';
import { SpecialBits } from './SpecialBits';

// The bits and the text field stay in sync both ways: toggling a bit or picking a preset
// rewrites the field (as octal); typing a valid string updates the bits; an invalid one is
// flagged and leaves the bits as they were; an empty field clears them.
const ChmodGenerator = () => {
  const [perms, setPerms] = useState(EMPTY_PERMS);
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);

  const applyPerms = (next) => {
    setPerms(next);
    setInput(toOctalString(next));
    setInvalid(false);
  };

  const toggle = (entity, bit) => applyPerms(togglePerm(perms, entity, bit));

  const type = (raw) => {
    setInput(raw);
    if (!raw.trim()) {
      setPerms(EMPTY_PERMS);
      setInvalid(false);
      return;
    }
    const parsed = parsePerms(raw);
    if (parsed) setPerms(parsed);
    setInvalid(!parsed);
  };

  return (
    <div className="flex flex-col gap-6 mt-2">
      <PermissionInput value={input} invalid={invalid} onChange={type} onPreset={(octal) => applyPerms(parseOctal(octal))} />
      <PermissionTable perms={perms} onToggle={toggle} />
      <SpecialBits special={perms.special} onToggle={(bit) => toggle('special', bit)} />
      <PermissionOutput perms={perms} />
      <CopyCommand command={`chmod ${toOctalString(perms)} path`} />
    </div>
  );
};

export default ChmodGenerator;
