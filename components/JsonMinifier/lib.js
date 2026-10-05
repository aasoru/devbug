export const minify = (str) => {
  const parsed = JSON.parse(str);
  return JSON.stringify(parsed);
};

export const prettify = (str, indent = 2) => {
  const parsed = JSON.parse(str);
  return JSON.stringify(parsed, null, indent);
};

// UTF-8 size of a string, counted without encoding it: TextEncoder would allocate a copy as
// large as the text on every keystroke (several MB for a big JSON). Same result as
// new TextEncoder().encode(str).length, lone surrogates included (encoded as U+FFFD, 3 bytes).
export function utf8Bytes(str) {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      bytes += 4; // a surrogate pair: one character outside the BMP
      i++;
    } else bytes += 3;
  }
  return bytes;
}

// How much smaller the output is, in whole percent (negative: larger); null without both sizes.
export const sizeChange = (before, after) =>
  (before > 0 && after > 0 ? Math.round((1 - after / before) * 100) : null);
