// The tools, in menu order. The sidebar (a client component on every page) is built from this
// list, so it holds only what the menu shows: anything else here would ship to every page.
// The home's cards add their icon and description (app/page.js), at no cost to the browser.
export const TOOLS = [
  { href: '/chronometer', name: 'Chronometer' },
  { href: '/text-analizer', name: 'Text Analyzer' },
  { href: '/chmod-generator', name: 'CHMOD Generator' },
  { href: '/json-minifier', name: 'JSON Minifier' },
  { href: '/jwt-decoder', name: 'JWT Decoder' },
  { href: '/base64', name: 'Base64' },
  { href: '/mosaic', name: 'Mosaic' },
];
