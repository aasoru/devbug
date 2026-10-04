// Imgflip's get_memes returns popular blank templates, with no NSFW filter. Only templates
// reviewed by hand (2026-09-30, twice — the second pass at full size caught text and
// details the thumbnails hid) are shown; new ones are ignored until someone reviews them.
export const SAFE_MEME_IDS = new Set([
  '181913649', '87743020', '112126428', '217743513', '124822590', '322841258', '135256802',
  '131940431', '131087935', '4087833', '97984', '309868304', '129242436', '91538330', '438680',
  '188390779', '79132341', '101470', '161865971', '102156234', '61579', '180190441', '177682295',
  '100777631', '427308417', '505705955', '247375501', '28251713', '67452763', '3218037', '93895088',
  '178591752', '370867422', '77045868', '55311130', '533936279', '110163934', '148909805', '284929871', '137501417', '354700819', '195515965', '89370399', '206151308', '163573', '1035805',
  '316466202', '27813981', '119215120', '84341851', '166969924', '133946291', '259237855',
  '114585149', '187102311', '226297822', '234202281', '145139900', '129315248',
  '101956210', '110133729', '162372564', '155067746', '142009471', '14371066', '61585',
  '61520', '61556', '72525473', '309668311', '20007896', '29562797', '21735', '91998305',
  '134797956', '92084495', '360597639', '5496396', '123999232', '47169131', '342785297',
]);

export const IMGFLIP_API = 'https://api.imgflip.com/get_memes';

// Keeps only reviewed templates and picks `count` of them at random.
export function pickSafeMemes(memes, count, random = Math.random) {
  const safe = memes.filter((m) => SAFE_MEME_IDS.has(String(m.id)) && m.width > 0 && m.height > 0);
  for (let i = safe.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [safe[i], safe[j]] = [safe[j], safe[i]];
  }
  return safe.slice(0, count).map(({ id, name, url, width, height }) => ({ id: String(id), name, url, width, height }));
}

export const MIN_MEMES = 1;
export const MAX_MEMES = SAFE_MEME_IDS.size; // can't show more memes than the reviewed ones
export const DEFAULT_MEMES = 12;

// How many memes to load from what the user typed: a whole number within MIN..MAX, or
// `fallback` when it isn't a number at all.
export function memeCount(raw, fallback = DEFAULT_MEMES) {
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : Math.min(MAX_MEMES, Math.max(MIN_MEMES, parsed));
}
