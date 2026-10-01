import { describe, it, expect } from 'vitest';
import { layoutMosaic, pickSafeMemes, SAFE_MEME_IDS, MAX_ROW_RATIO, checkFile, checkPixels, fitWithin, LOCAL_LIMITS, overLimit, limitMessages } from '@/components/Mosaic/lib';

const img = (id, width, height) => ({ id: String(id), width, height });
const EPS = 1e-6;

// Deterministic mixed set: portrait, landscape and square images.
const SIZES = [[1200, 1200], [800, 400], [600, 900], [1000, 560], [500, 1400], [720, 720], [900, 600], [400, 800], [1280, 720], [700, 1000]];
const ITEMS = SIZES.map(([w, h], i) => img(i, w, h));

const overlaps = (a, b) =>
  a.x < b.x + b.width - EPS && b.x < a.x + a.width - EPS && a.y < b.y + b.height - EPS && b.y < a.y + a.height - EPS;

describe('layoutMosaic invariants', () => {
  for (const [label, frame] of [['16:9', { width: 1600, height: 900 }], ['1:1', { width: 1000, height: 1000 }], ['9:16', { width: 900, height: 1600 }]]) {
    for (const leftover of ['end', 'distribute', 'center']) {
      for (const gap of [0, 8]) {
        it(`${label}, leftover=${leftover}, gap=${gap}`, () => {
          const { tiles } = layoutMosaic(ITEMS, { ...frame, gap, leftover });

          // Every image is placed once, in order.
          expect(tiles.map((t) => t.id)).toEqual(ITEMS.map((i) => i.id));

          tiles.forEach((t, i) => {
            // No cropping or distortion: the tile keeps the image's aspect ratio.
            expect(t.width / t.height).toBeCloseTo(ITEMS[i].width / ITEMS[i].height, 6);
            // Inside the frame.
            expect(t.x).toBeGreaterThanOrEqual(-EPS);
            expect(t.y).toBeGreaterThanOrEqual(-EPS);
            expect(t.x + t.width).toBeLessThanOrEqual(frame.width + EPS);
            expect(t.y + t.height).toBeLessThanOrEqual(frame.height + EPS);
          });

          // No overlaps.
          for (let a = 0; a < tiles.length; a++)
            for (let b = a + 1; b < tiles.length; b++) expect(overlaps(tiles[a], tiles[b])).toBe(false);
        });
      }
    }
  }
});

describe('layoutMosaic leftover band', () => {
  it('reports the empty share of the frame', () => {
    const r = layoutMosaic(ITEMS, { width: 1600, height: 900 });
    const area = r.tiles.reduce((a, t) => a + t.width * t.height, 0);
    expect(r.empty).toBeCloseTo(1 - area / (1600 * 900), 6);
    expect(r.empty).toBeGreaterThanOrEqual(0);
  });

  it('picks the split with the least empty space of all possible splits', () => {
    // Independent reference: empty share for a given row split (no gaps).
    const W = 1600, H = 900;
    const items = ITEMS.slice(0, 6);
    const ratios = items.map((i) => i.width / i.height);
    const emptyFor = (sizes) => {
      let start = 0;
      const rows = sizes.map((n) => { const r = ratios.slice(start, start + n).reduce((a, b) => a + b, 0); start += n; return r; });
      const heights = rows.map((r) => W / r);
      const s = Math.min(1, H / heights.reduce((a, b) => a + b, 0));
      return 1 - rows.reduce((acc, r, i) => acc + (heights[i] * s) ** 2 * r, 0) / (W * H);
    };
    let min = Infinity;
    for (let mask = 0; mask < 1 << (items.length - 1); mask++) {
      const sizes = []; let size = 1;
      for (let i = 0; i < items.length - 1; i++) (mask & (1 << i)) ? (sizes.push(size), size = 1) : size++;
      sizes.push(size);
      min = Math.min(min, emptyFor(sizes));
    }
    expect(layoutMosaic(items, { width: W, height: H, sizes: 'any' }).empty).toBeCloseTo(min, 9);
    // And it's clearly better than the naive extremes.
    expect(min).toBeLessThan(emptyFor([6]));
    expect(min).toBeLessThan(emptyFor([1, 1, 1, 1, 1, 1]));
  });

  it('"similar" keeps row heights within MAX_ROW_RATIO, at the cost of some empty space', () => {
    const rowHeights = (tiles) => [...new Set(tiles.map((t) => Math.round(t.y * 1e6)))].map((y) => tiles.find((t) => Math.round(t.y * 1e6) === y).height);
    for (const frame of [{ width: 1600, height: 900 }, { width: 1000, height: 1000 }, { width: 900, height: 1600 }]) {
      const similar = layoutMosaic(ITEMS, { ...frame, sizes: 'similar' });
      const any = layoutMosaic(ITEMS, { ...frame, sizes: 'any' });
      const h = rowHeights(similar.tiles);
      expect(Math.max(...h) / Math.min(...h)).toBeLessThanOrEqual(MAX_ROW_RATIO + 1e-9);
      expect(similar.empty).toBeGreaterThanOrEqual(any.empty - 1e-9); // never better than the unconstrained optimum
    }
  });

  it('with a perfect fit there is no empty space', () => {
    // Two 16:9 images side by side exactly fill a 32:9 frame.
    const r = layoutMosaic([img('a', 1600, 900), img('b', 1600, 900)], { width: 3200, height: 900 });
    expect(r.empty).toBeCloseTo(0, 6);
    expect(r.band).toBe('none');
  });

  it('"end" leaves the band at the bottom; "distribute" spreads it between rows', () => {
    // Two squares in a tall frame: best is one per row, leaving vertical space.
    const items = [img('a', 100, 100), img('b', 100, 100)];
    const end = layoutMosaic(items, { width: 100, height: 300, leftover: 'end' });
    expect(end.band).toBe('bottom');
    expect(end.tiles[0].y).toBeCloseTo(0, 6);
    expect(end.tiles[1].y).toBeCloseTo(100, 6); // stacked from the top

    const spread = layoutMosaic(items, { width: 100, height: 300, leftover: 'distribute' });
    expect(spread.tiles[0].y).toBeCloseTo(0, 6);
    expect(spread.tiles[1].y + spread.tiles[1].height).toBeCloseTo(300, 6); // last row touches the bottom
  });

  it('"end" leaves the band at the side; "distribute" spreads it between images', () => {
    // Two squares in a wide, short frame: they get scaled down, leaving horizontal space.
    const items = [img('a', 100, 100), img('b', 100, 100)];
    const end = layoutMosaic(items, { width: 300, height: 100, leftover: 'end' });
    expect(end.band).toBe('side');
    expect(end.tiles[0].x).toBeCloseTo(0, 6);
    expect(end.tiles[1].x).toBeCloseTo(100, 6);

    const spread = layoutMosaic(items, { width: 300, height: 100, leftover: 'distribute' });
    expect(spread.tiles[1].x + spread.tiles[1].width).toBeCloseTo(300, 6); // row reaches the right edge
  });

  it('the leftover mode moves the band but never changes the split or the empty space', () => {
    for (const frame of [{ width: 1600, height: 900 }, { width: 1000, height: 1000 }, { width: 900, height: 1600 }]) {
      const [c, d, e] = ['center', 'distribute', 'end'].map((leftover) => layoutMosaic(ITEMS, { ...frame, leftover }));
      expect(d.empty).toBeCloseTo(c.empty, 9);
      expect(e.empty).toBeCloseTo(c.empty, 9);
      expect(d.rows).toBe(c.rows);
      expect(e.rows).toBe(c.rows);
      // "end" anchors everything to the top-left corner.
      expect(Math.min(...e.tiles.map((t) => t.x))).toBeCloseTo(0, 6);
      expect(Math.min(...e.tiles.map((t) => t.y))).toBeCloseTo(0, 6);
    }
  });

  it('"center" splits the band evenly on both sides', () => {
    const items = [img('a', 100, 100), img('b', 100, 100)];
    const v = layoutMosaic(items, { width: 100, height: 300, leftover: 'center' }); // vertical band
    const top = Math.min(...v.tiles.map((t) => t.y));
    const bottom = 300 - Math.max(...v.tiles.map((t) => t.y + t.height));
    expect(top).toBeCloseTo(bottom, 6);
    expect(top).toBeGreaterThan(0);

    const h = layoutMosaic(items, { width: 300, height: 100, leftover: 'center' }); // horizontal band
    const left = Math.min(...h.tiles.map((t) => t.x));
    const right = 300 - Math.max(...h.tiles.map((t) => t.x + t.width));
    expect(left).toBeCloseTo(right, 6);
    expect(left).toBeGreaterThan(0);
  });

  it('handles empty input and impossible frames', () => {
    expect(layoutMosaic([], { width: 100, height: 100 }).tiles).toEqual([]);
    expect(layoutMosaic(ITEMS, { width: 0, height: 100 }).tiles).toEqual([]);
  });

  it('falls back to a greedy split for many images', () => {
    const many = Array.from({ length: 30 }, (_, i) => img(i, 400 + (i % 5) * 150, 300 + (i % 3) * 200));
    const { tiles, empty } = layoutMosaic(many, { width: 1600, height: 900, gap: 4 });
    expect(tiles).toHaveLength(30);
    expect(empty).toBeLessThan(0.5);
    tiles.forEach((t) => expect(t.y + t.height).toBeLessThanOrEqual(900 + EPS));
  });
});

describe('pickSafeMemes', () => {
  const memes = [
    { id: '181913649', name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg', width: 1200, height: 1200, box_count: 2 },
    { id: '87743020', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg', width: 600, height: 908 },
    { id: '999', name: 'Unreviewed template', url: 'https://i.imgflip.com/x.jpg', width: 500, height: 500 },
  ];

  it('only returns reviewed templates', () => {
    const picked = pickSafeMemes(memes, 10);
    expect(picked.map((m) => m.id).sort()).toEqual(['181913649', '87743020']);
    picked.forEach((m) => expect(SAFE_MEME_IDS.has(m.id)).toBe(true));
  });

  it('limits the count and keeps only the fields it needs', () => {
    const [m] = pickSafeMemes(memes, 1, () => 0);
    expect(Object.keys(m).sort()).toEqual(['height', 'id', 'name', 'url', 'width']);
    expect(pickSafeMemes(memes, 1)).toHaveLength(1);
  });

  it('the allowlist has the 81 reviewed templates', () => {
    expect(SAFE_MEME_IDS.size).toBe(81);
    // Removed in the second review: profanity in the image, blood, a gun, and borderline ones.
    for (const id of ['99683372', '171305372', '252600902', '224514655', '216523697', '221578498']) expect(SAFE_MEME_IDS.has(id)).toBe(false);
  });
});

describe('local image limits', () => {
  const MB = 1024 * 1024;

  it('accepts images up to 30 MB and rejects the rest before decoding', () => {
    expect(checkFile({ name: 'a.jpg', type: 'image/jpeg', size: 5 * MB })).toBeNull();
    expect(checkFile({ name: 'a.jpg', type: 'image/jpeg', size: 30 * MB })).toBeNull();
    expect(checkFile({ name: 'big.jpg', type: 'image/jpeg', size: 31 * MB })).toBe('big.jpg: too large (31.0 MB, max 30 MB)');
    expect(checkFile({ name: 'notes.txt', type: 'text/plain', size: 10 })).toBe('notes.txt: not an image or a video');
    expect(checkFile({ name: 'x', type: '', size: 10 })).toBe('x: not an image or a video');
  });

  it('accepts up to 50 MP (a 48 MP phone photo passes)', () => {
    expect(checkPixels('iphone.heic', 8064, 6048)).toBeNull(); // 48.8 MP
    expect(checkPixels('pano.jpg', 12000, 5000)).toBe('pano.jpg: too large (60 MP, max 50 MP)');
    expect(checkPixels('broken.png', 0, 0)).toBe("broken.png: couldn't read the image size");
  });

  it('scales the long side down to 2048 px, keeping the aspect ratio and never upscaling', () => {
    expect(fitWithin(8064, 6048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(1000, 4000)).toEqual({ width: 512, height: 2048 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(LOCAL_LIMITS.maxFiles).toBe(20);
  });
});

describe('local videos', () => {
  const MB = 1024 * 1024;
  const file = (name, type) => ({ name, type, size: 1 });

  it('videos can be up to 200 MB', () => {
    expect(checkFile({ name: 'clip.mp4', type: 'video/mp4', size: 150 * MB })).toBeNull();
    expect(checkFile({ name: 'long.mov', type: 'video/quicktime', size: 201 * MB })).toBe('long.mov: too large (201.0 MB, max 200 MB)');
  });

  it('at most 6 videos, counting only those actually added', () => {
    const video = file('v.mp4', 'video/mp4'), image = file('p.png', 'image/png');
    const videos = (n) => Array.from({ length: n }, () => ({ kind: 'video' }));
    expect(overLimit(video, [])).toBeNull();
    expect(overLimit(video, videos(5))).toBeNull();
    expect(overLimit(video, videos(6))).toBe('videos');
    expect(overLimit(image, videos(6))).toBeNull(); // images still fit
  });

  it('20 files in total, images and videos together', () => {
    const full = Array.from({ length: 20 }, () => ({ kind: 'image' }));
    expect(overLimit(file('a.png', 'image/png'), full)).toBe('files');
    expect(overLimit(file('a.mp4', 'video/mp4'), full)).toBe('files');
    expect(LOCAL_LIMITS.maxVideos).toBe(6);
  });

  it('explains what was left out', () => {
    expect(limitMessages({ videos: 1 })).toEqual(['1 video was not added: the limit is 6 videos']);
    expect(limitMessages({ files: 2, videos: 3 })).toEqual(['3 videos were not added: the limit is 6 videos', '2 files were not added: the limit is 20 files']);
    expect(limitMessages({})).toEqual([]);
  });
});
