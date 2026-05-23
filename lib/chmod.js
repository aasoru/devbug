export const bitsToOctal = (read, write, execute) =>
  (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0);

export const bitsToSymbol = (read, write, execute) =>
  `${read ? 'r' : '-'}${write ? 'w' : '-'}${execute ? 'x' : '-'}`;

export const toChmodString = (owner, group, other) =>
  `${owner}${group}${other}`;
