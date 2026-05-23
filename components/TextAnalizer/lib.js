export const analyzeText = (text, match = '') => {
  const words = text.split(/\s+/).filter((w) => w.trim() !== '');
  return {
    chars: text.replace(/\s/g, '').length,
    charsWithSpaces: text.length,
    words: words.length,
    uniqueWords: new Set(words).size,
    spaces: (text.match(/[ \t]/g) || []).length,
    lines: text.length > 0 ? text.split('\n').length : 0,
    matches: match.length > 0 ? text.split(match).length - 1 : null,
  };
};
