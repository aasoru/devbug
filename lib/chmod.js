export const bitsToOctal = (read, write, execute) =>
  (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0);

export const bitsToSymbol = (read, write, execute) =>
  `${read ? 'r' : '-'}${write ? 'w' : '-'}${execute ? 'x' : '-'}`;

export const toChmodString = (owner, group, other) =>
  `${owner}${group}${other}`;

export const EMPTY_PERMS = {
  special: { setuid: false, setgid: false, sticky: false },
  owner:   { read: false, write: false, execute: false },
  group:   { read: false, write: false, execute: false },
  other:   { read: false, write: false, execute: false },
};

export const PRESETS = [
  { label: '400', value: '400' },
  { label: '600', value: '600' },
  { label: '644', value: '644' },
  { label: '755', value: '755' },
  { label: '777', value: '777' },
];

export const toOctalString = (perms) => {
  const { special, owner, group, other } = perms;
  const s = bitsToOctal(special.setuid, special.setgid, special.sticky);
  const o = bitsToOctal(owner.read, owner.write, owner.execute);
  const g = bitsToOctal(group.read, group.write, group.execute);
  const t = bitsToOctal(other.read, other.write, other.execute);
  return s > 0 ? `${s}${o}${g}${t}` : `${o}${g}${t}`;
};

export const toPermString = (perms) => {
  const { special, owner, group, other } = perms;
  const ownerX = special.setuid ? (owner.execute ? 's' : 'S') : (owner.execute ? 'x' : '-');
  const groupX = special.setgid ? (group.execute ? 's' : 'S') : (group.execute ? 'x' : '-');
  const otherX = special.sticky ? (other.execute ? 't' : 'T') : (other.execute ? 'x' : '-');
  return [
    owner.read ? 'r' : '-', owner.write ? 'w' : '-', ownerX,
    group.read ? 'r' : '-', group.write ? 'w' : '-', groupX,
    other.read ? 'r' : '-', other.write ? 'w' : '-', otherX,
  ].join('');
};

export const parseOctal = (str) => {
  const clean = str.trim().replace(/^0+/, '') || '0';
  if (!/^\d{1,4}$/.test(clean)) return null;
  const [s, o, g, t] = clean.padStart(4, '0').split('').map(Number);
  if ([s, o, g, t].some((n) => n > 7)) return null;
  return {
    special: { setuid: !!(s & 4), setgid: !!(s & 2), sticky: !!(s & 1) },
    owner:   { read: !!(o & 4), write: !!(o & 2), execute: !!(o & 1) },
    group:   { read: !!(g & 4), write: !!(g & 2), execute: !!(g & 1) },
    other:   { read: !!(t & 4), write: !!(t & 2), execute: !!(t & 1) },
  };
};

export const parseSymbolic = (str) => {
  const s = str.trim().length === 10 ? str.trim().slice(1) : str.trim();
  if (s.length !== 9) return null;
  if (!/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(s)) return null;
  return {
    special: {
      setuid: s[2] === 's' || s[2] === 'S',
      setgid: s[5] === 's' || s[5] === 'S',
      sticky: s[8] === 't' || s[8] === 'T',
    },
    owner: { read: s[0] === 'r', write: s[1] === 'w', execute: s[2] === 'x' || s[2] === 's' },
    group: { read: s[3] === 'r', write: s[4] === 'w', execute: s[5] === 'x' || s[5] === 's' },
    other: { read: s[6] === 'r', write: s[7] === 'w', execute: s[8] === 'x' || s[8] === 't' },
  };
};

export const describePerms = (perms) => {
  const { special, owner, group, other } = perms;

  const describe = (label, bits) => {
    const p = [];
    if (bits.read) p.push('read');
    if (bits.write) p.push('write');
    if (bits.execute) p.push('execute');
    if (p.length === 0) return `${label} has no access`;
    const last = p.pop();
    return p.length ? `${label} can ${p.join(', ')} and ${last}` : `${label} can ${last}`;
  };

  const lines = [describe('Owner', owner), describe('Group', group), describe('Others', other)];
  const specials = [
    special.setuid && 'setuid',
    special.setgid && 'setgid',
    special.sticky && 'sticky bit',
  ].filter(Boolean);
  if (specials.length) lines.push(`Special: ${specials.join(', ')}`);
  return lines;
};
