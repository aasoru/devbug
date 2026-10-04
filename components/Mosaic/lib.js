// Mosaic layout: fit images into a fixed frame, keeping every image whole (no cropping,
// no distortion). Images go in justified rows (each row spans the full width); of all the
// ways to split the images into rows (keeping their order), we pick the one that leaves
// the least empty space — by default only among splits whose rows have similar heights
// (tallest ≤ 2× shortest), so images don't end up tiny next to giant ones. What remains is
// a single band — below the rows or beside them — spread as spacing, centred, or left at
// the end (bottom or right, whichever side it falls on).

const MAX_EXACT = 18; // up to 2^17 partitions — instant; beyond that, a greedy fallback
export const MAX_ROW_RATIO = 2; // "similar sizes": tallest row at most 2× the shortest
// "similar sizes" weighs empty space against how uneven the rows are: each split scores its
// empty share plus SIZE_PENALTY for every MAX_ROW_RATIO-step of unevenness beyond the limit.
// A hard limit failed both ways: a single row always counts as even (it won with the frame
// ~90% empty), and giving way past some extra empty space let one giant column win once
// reordering made a near-perfect uneven fit available.
export const SIZE_PENALTY = 0.5; // measured: keeps every row within ~2.6× of the others
const similarScore = (m) => m.empty + SIZE_PENALTY * Math.max(0, m.balance / MAX_ROW_RATIO - 1);

// Every way to cut [0..n) into contiguous rows, as arrays of row sizes.
function* partitions(n) {
  const total = 1 << (n - 1);
  for (let mask = 0; mask < total; mask++) {
    const sizes = [];
    let size = 1;
    for (let i = 0; i < n - 1; i++) {
      if (mask & (1 << i)) { sizes.push(size); size = 1; } else size++;
    }
    sizes.push(size);
    yield sizes;
  }
}

// Greedy fallback for many images: aim for rows about the height a uniform split would give.
function greedyPartition(ratios, width, height) {
  const totalRatio = ratios.reduce((a, b) => a + b, 0);
  const rows = Math.max(1, Math.round(Math.sqrt((totalRatio * height) / width)));
  const target = totalRatio / rows;
  const sizes = [];
  let acc = 0, size = 0;
  ratios.forEach((r, i) => {
    acc += r; size++;
    if (acc >= target && sizes.length < rows - 1 && i < ratios.length - 1) { sizes.push(size); acc = 0; size = 0; }
  });
  if (size) sizes.push(size);
  return sizes;
}

// Geometry of one partition: row heights at full width, and the scale that fits the frame.
function measure(ratios, sizes, width, height, gap) {
  let start = 0;
  const rows = sizes.map((n) => {
    const r = ratios.slice(start, start + n).reduce((a, b) => a + b, 0);
    const row = { start, n, ratioSum: r, height: (width - gap * (n - 1)) / r };
    start += n;
    return row;
  });
  const gaps = gap * (rows.length - 1);
  if (gaps >= height) return null; // too many rows: the gaps alone fill the frame
  const rowsHeight = rows.reduce((a, r) => a + r.height, 0);
  const scale = Math.min(1, (height - gaps) / rowsHeight);
  const imageArea = rows.reduce((a, r) => a + (r.height * scale) ** 2 * r.ratioSum, 0);
  const heights = rows.map((r) => r.height);
  const balance = Math.max(...heights) / Math.min(...heights);
  return { rows, scale, imageArea, balance, empty: 1 - imageArea / (width * height) };
}

// Best row splits of the items in the given order: the one with the least empty space, and
// the best with similar row heights (lowest similarScore). The leftover mode only decides where the band goes, never which
// split is chosen: forcing the band to the bottom was measured to double or triple the empty space.
function bestSplits(ratios, width, height, gap, maxExact) {
  let any = null;
  let similar = null;
  const candidates = ratios.length <= maxExact
    ? partitions(ratios.length)
    : [greedyPartition(ratios, width, height)];
  for (const split of candidates) {
    const m = measure(ratios, split, width, height, gap);
    if (!m) continue;
    m.score = similarScore(m);
    if (!any || m.empty < any.empty - 1e-9) any = m;
    if (!similar || m.score < similar.score - 1e-9) similar = m;
  }
  return { any, similar };
}

// Tiles for a chosen split, with the leftover band placed as asked.
function place(items, ratios, best, { width, height, gap, leftover }) {
  const { rows, scale } = best;
  const rowHeights = rows.map((r) => r.height * scale);
  const usedHeight = rowHeights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
  const band = scale < 1 ? 'side' : usedHeight < height - 0.5 ? 'bottom' : 'none';

  // Vertical leftover (rows shorter than the frame): spread between rows, centre the rows
  // (half above, half below), or leave it at the bottom.
  const spare = height - usedHeight;
  const extraRowGap = leftover === 'distribute' && band === 'bottom' && rows.length > 1 ? spare / (rows.length - 1) : 0;
  const offsetY = band === 'bottom' && (leftover === 'center' || (leftover === 'distribute' && rows.length === 1)) ? spare / 2 : 0;

  // Horizontal leftover (everything scaled down): the same offset for every row keeps left
  // edges aligned when centring (rows differ slightly in width because gaps don't scale).
  const rowWidths = rows.map((row, ri) => ratios.slice(row.start, row.start + row.n).reduce((a, r) => a + r * rowHeights[ri], 0) + gap * (row.n - 1));
  const offsetX = band === 'side' && leftover === 'center' ? (width - Math.max(...rowWidths)) / 2 : 0;

  const tiles = [];
  let y = offsetY;
  rows.forEach((row, ri) => {
    const h = rowHeights[ri];
    const widths = ratios.slice(row.start, row.start + row.n).map((r) => r * h);
    const usedWidth = widths.reduce((a, b) => a + b, 0) + gap * (row.n - 1);
    // Horizontal leftover (everything scaled down): spread between images, or leave on the right.
    const extraGap = leftover === 'distribute' && band === 'side' && row.n > 1 ? (width - usedWidth) / (row.n - 1) : 0;
    let x = leftover === 'distribute' && band === 'side' && row.n === 1 ? (width - usedWidth) / 2 : offsetX;
    widths.forEach((w, i) => {
      tiles.push({ id: items[row.start + i].id, x, y, width: w, height: h });
      x += w + gap + extraGap;
    });
    y += h + gap + extraRowGap;
  });

  return { tiles, rows: rows.length, empty: best.empty, band };
}

const MAX_PERMUTED = 6; // up to 6! = 720 orders, each with every split — still instant
const MAX_EXACT_MANY = 13; // trying several orders or both flows: every split up to 13 items

// Orders worth trying when the mosaic may rearrange the items. How much space is left depends
// only on which items share a row, so for a few items every order is tried (skipping orders
// that only swap items of the same shape); for more, a few orders that group similar shapes.
function candidateOrders(items) {
  const ratio = (it) => it.width / it.height;
  if (items.length <= MAX_PERMUTED) {
    const orders = [];
    const seen = new Set();
    const permute = (rest, acc) => {
      if (!rest.length) {
        const key = acc.map((it) => ratio(it).toFixed(6)).join();
        if (!seen.has(key)) { seen.add(key); orders.push(acc); }
        return;
      }
      rest.forEach((it, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, it]));
    };
    permute(items, []);
    return orders;
  }
  const asc = [...items].sort((a, b) => ratio(a) - ratio(b));
  const desc = [...asc].reverse();
  // Alternating narrow and wide items evens out the rows' total width.
  const mixed = asc.map((_, i) => (i % 2 ? asc[asc.length - 1 - (i >> 1)] : asc[i >> 1]));
  return [items, asc, desc, mixed];
}

// Columns are rows of the transposed frame: swap widths and heights in, and back out.
const transpose = ({ width, height, ...rest }) => ({ ...rest, width: height, height: width });
const transposeTile = ({ x, y, width, height, ...rest }) => ({ ...rest, x: y, y: x, width: height, height: width });
const BAND_TRANSPOSED = { none: 'none', bottom: 'side', side: 'bottom' };

/**
 * @param {{ id: string, width: number, height: number }[]} items
 * @param {{ width: number, height: number, gap?: number, leftover?: 'center' | 'end' | 'distribute',
 *   sizes?: 'similar' | 'any', reorder?: boolean, flow?: 'rows' | 'columns' | 'auto' }} frame
 *   sizes: 'similar' keeps row (or column) sizes within MAX_ROW_RATIO; reorder: the items may be
 *   placed in any order; flow: justified rows, justified columns, or whichever leaves less space
 * @returns {{ tiles: { id: string, x: number, y: number, width: number, height: number }[],
 *   rows: number, flow: 'rows' | 'columns', empty: number, band: 'none' | 'bottom' | 'side' }}
 *   rows: how many rows (or columns, when flow is 'columns')
 */
export function layoutMosaic(items, { width, height, gap = 0, leftover = 'center', sizes = 'similar', reorder = false, flow = 'rows' }) {
  const none = { tiles: [], rows: 0, flow: 'rows', empty: 1, band: 'none' };
  if (!items.length || width <= 0 || height <= 0) return none;

  const orders = reorder ? candidateOrders(items) : [items];
  const flows = flow === 'auto' ? ['rows', 'columns'] : [flow];
  const maxExact = orders.length * flows.length > 1 ? MAX_EXACT_MANY : MAX_EXACT;
  let any = null;
  let similar = null;
  for (const f of flows) {
    const frame = f === 'rows' ? { width, height } : { width: height, height: width };
    for (const order of orders) {
      const ordered = f === 'rows' ? order : order.map(transpose);
      const ratios = ordered.map((it) => it.width / it.height);
      const found = bestSplits(ratios, frame.width, frame.height, gap, maxExact);
      if (!found.any) continue;
      if (!any || found.any.empty < any.m.empty - 1e-9) any = { m: found.any, f, frame, ordered, ratios };
      if (!similar || found.similar.score < similar.m.score - 1e-9) similar = { m: found.similar, f, frame, ordered, ratios };
    }
  }

  if (!any) return none;
  const best = sizes === 'similar' ? similar : any;
  const placed = place(best.ordered, best.ratios, best.m, { ...best.frame, gap, leftover });
  if (best.f === 'rows') return { ...placed, flow: 'rows' };
  return { ...placed, tiles: placed.tiles.map(transposeTile), flow: 'columns', band: BAND_TRANSPOSED[placed.band] };
}

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

// Local files: read in the browser (object URLs), never uploaded. Limits protect the device:
// - images: a decoded image takes 4 bytes per pixel whatever its display size (a 48 MP photo is
//   ~195 MB), so they are downscaled on import and only the copy is kept;
// - videos: they can't be downscaled without re-encoding (a heavy dependency), and each playing
//   video costs CPU/GPU, so only a few are allowed; they play muted and looped.
export const LOCAL_LIMITS = {
  maxFiles: 20, // images + videos
  maxBytes: 30 * 1024 * 1024, // 30 MB per image
  maxPixels: 50_000_000, // 50 MP before downscaling (fits 48 MP phone photos)
  maxSide: 2048, // long side of the image copy that is kept
  maxVideos: 6,
  maxVideoBytes: 200 * 1024 * 1024, // 200 MB per video
};

export const fileKind = (type = '') => (type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : null);

const MB = 1024 * 1024;

// Before decoding: is it an image or a video, and not too heavy? Returns an error message or null.
export function checkFile({ name, type, size }, limits = LOCAL_LIMITS) {
  const kind = fileKind(type);
  if (!kind) return `${name}: not an image or a video`;
  const max = kind === 'video' ? limits.maxVideoBytes : limits.maxBytes;
  if (size > max) return `${name}: too large (${(size / MB).toFixed(1)} MB, max ${max / MB} MB)`;
  return null;
}

// Limit check for the next file, given what has actually been added so far (files that fail to
// load must not use up a slot). Returns 'files', 'videos' or null.
export function overLimit(file, added, limits = LOCAL_LIMITS) {
  if (added.length >= limits.maxFiles) return 'files';
  if (fileKind(file.type) === 'video' && added.filter((f) => f.kind === 'video').length >= limits.maxVideos) return 'videos';
  return null;
}

export function limitMessages({ files = 0, videos = 0 }, limits = LOCAL_LIMITS) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const messages = [];
  if (videos) messages.push(`${plural(videos, 'video was', 'videos were')} not added: the limit is ${limits.maxVideos} videos`);
  if (files) messages.push(`${plural(files, 'file was', 'files were')} not added: the limit is ${limits.maxFiles} files`);
  return messages;
}

// After reading its size: not too many pixels to downscale safely? Returns an error message or null.
export function checkPixels(name, width, height, limits = LOCAL_LIMITS) {
  if (!(width > 0 && height > 0)) return `${name}: couldn't read the image size`;
  const mp = (width * height) / 1e6;
  if (width * height > limits.maxPixels) return `${name}: too large (${mp.toFixed(0)} MP, max ${limits.maxPixels / 1e6} MP)`;
  return null;
}

// Size of the copy: same aspect ratio, long side at most maxSide; never upscales.
export function fitWithin(width, height, maxSide = LOCAL_LIMITS.maxSide) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
