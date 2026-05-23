export const minify = (str) => {
  const parsed = JSON.parse(str);
  return JSON.stringify(parsed);
};

export const prettify = (str, indent = 2) => {
  const parsed = JSON.parse(str);
  return JSON.stringify(parsed, null, indent);
};
