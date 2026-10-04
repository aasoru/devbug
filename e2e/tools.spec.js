import { test, expect } from './fixtures';
import { makePng } from './png';

test.describe('CHMOD Generator', () => {
  const octal = (page) => page.locator('span.font-mono.text-5xl');
  const symbolic = (page) => page.locator('span.font-mono.text-3xl');

  test('checkboxes build 755', async ({ page }) => {
    await page.goto('/chmod-generator');
    const boxes = page.getByRole('checkbox');
    await expect(boxes).toHaveCount(12);

    // Rows: read (owner, group, other), write (...), execute (...), then special bits.
    for (const i of [0, 1, 2, 3, 6, 7, 8]) await boxes.nth(i).click();

    await expect(octal(page)).toHaveText('755');
    await expect(symbolic(page)).toHaveText('rwxr-xr-x');
    await expect(page.getByText('Owner can read, write and execute')).toBeVisible();
    await expect(page.locator('input[readonly]')).toHaveValue('chmod 755 path');
  });

  test('preset 644', async ({ page }) => {
    await page.goto('/chmod-generator');
    await page.getByRole('button', { name: '644', exact: true }).click();
    await expect(octal(page)).toHaveText('644');
    await expect(symbolic(page)).toHaveText('rw-r--r--');
    await expect(page.getByPlaceholder('755 or rwxr-xr-x')).toHaveValue('644');
  });

  test('reverse parsing with special bits', async ({ page }) => {
    await page.goto('/chmod-generator');
    await page.getByPlaceholder('755 or rwxr-xr-x').fill('rwsr-xr-t');
    await expect(octal(page)).toHaveText('5755');
    await expect(symbolic(page)).toHaveText('rwsr-xr-t');
    await expect(page.getByText('Special: setuid, sticky bit')).toBeVisible();
  });

  test('invalid input shows error', async ({ page }) => {
    await page.goto('/chmod-generator');
    await page.getByPlaceholder('755 or rwxr-xr-x').fill('999');
    await expect(page.getByText('Invalid permission string.')).toBeVisible();
  });

  test('copy button tooltip', async ({ page }) => {
    await page.goto('/chmod-generator');
    const copy = page.locator('input[readonly] ~ div button');
    await copy.hover();
    await expect(page.getByText('Copy to clipboard')).toBeVisible();
    await copy.click();
    await expect(page.getByText('Copied!')).toBeVisible();
  });
});

test.describe('Chronometer', () => {
  test('start, lap, stop, resume, reset', async ({ page }) => {
    // Fake clock, paused: time only moves with runFor(), so the display is deterministic.
    await page.clock.install({ time: new Date('2026-01-01T00:00:00') });
    await page.goto('/chronometer');
    await page.clock.pauseAt(new Date('2026-01-01T00:00:10'));
    const display = page.locator('div.font-mono.text-5xl');
    const reset = page.getByRole('button', { name: 'Reset' });

    await expect(display).toHaveText('00:00.00');
    await expect(reset).toBeDisabled();

    await page.getByRole('button', { name: 'Start' }).click();
    await page.clock.runFor(1000);
    await page.getByRole('button', { name: 'Lap' }).click();
    await expect(page.getByText('Lap 1')).toBeVisible();

    await page.clock.runFor(500);
    await page.getByRole('button', { name: 'Stop' }).click();
    await expect(display).toHaveText('00:01.50');

    await page.clock.runFor(2000);
    await expect(display).toHaveText('00:01.50');
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();

    await reset.click();
    await expect(display).toHaveText('00:00.00');
    await expect(page.getByText('Lap 1')).toBeHidden();
  });
});

test.describe('JWT Decoder', () => {
  test('load example', async ({ page }) => {
    await page.goto('/jwt-decoder');
    await page.getByRole('button', { name: 'Load example' }).click();
    await expect(page.locator('pre').first()).toContainText('"alg": "HS256"');
    await expect(page.locator('pre').nth(1)).toContainText('"name": "John Doe"');
    await expect(page.getByText('Issued at:')).toBeVisible();
    await page.getByRole('button', { name: 'Copy payload' }).click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  });

  test('expired token shows badge', async ({ page }) => {
    // header {"alg":"HS256","typ":"JWT"} + payload {"sub":"1","exp":1000000000} (2001)
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      Buffer.from(JSON.stringify({ sub: '1', exp: 1000000000 })).toString('base64url') +
      '.sig';
    await page.goto('/jwt-decoder');
    await page.getByPlaceholder('Paste your JWT token here...').fill(token);
    await expect(page.getByText('Expired', { exact: true })).toBeVisible();
    await expect(page.getByText('Expires at:')).toBeVisible();
  });

  test('invalid token shows error', async ({ page }) => {
    await page.goto('/jwt-decoder');
    await page.getByPlaceholder('Paste your JWT token here...').fill('not.a.jwt');
    await expect(page.getByText('Invalid JWT token.')).toBeVisible();
  });
});

test.describe('JSON Minifier', () => {
  const input = (page) => page.getByPlaceholder('Paste your JSON here...');
  const output = (page) => page.getByPlaceholder('Result will appear here...');

  test('minify and prettify', async ({ page }) => {
    await page.goto('/json-minifier');
    await input(page).fill('{ "a": 1, "b": [1, 2] }');

    await page.getByRole('button', { name: 'Minify' }).click();
    await expect(output(page)).toHaveValue('{"a":1,"b":[1,2]}');

    await page.getByRole('button', { name: 'Prettify' }).click();
    await expect(output(page)).toHaveValue('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');

    // Output gutter shows one number per line (7 lines).
    await expect(page.locator('div[aria-hidden]').nth(1).locator('> div')).toHaveCount(7);
  });

  test('invalid JSON shows error', async ({ page }) => {
    await page.goto('/json-minifier');
    await input(page).fill('{ not json }');
    await page.getByRole('button', { name: 'Minify' }).click();
    await expect(page.locator('p.text-destructive')).toBeVisible();
  });
});

test.describe('Base64', () => {
  test('UTF-8 round-trip', async ({ page }) => {
    await page.goto('/base64');
    const input = page.getByPlaceholder('Text or Base64...');
    const output = page.getByPlaceholder('Result will appear here...');

    await input.fill('Héllo 🌍');
    await page.getByRole('button', { name: 'Encode' }).click();
    const encoded = await output.inputValue();
    expect(encoded).toBe(Buffer.from('Héllo 🌍').toString('base64'));

    await input.fill(encoded);
    await page.getByRole('button', { name: 'Decode' }).click();
    await expect(output).toHaveValue('Héllo 🌍');
  });

  test('invalid Base64 shows error', async ({ page }) => {
    await page.goto('/base64');
    await page.getByPlaceholder('Text or Base64...').fill('not base64!!!');
    await page.getByRole('button', { name: 'Decode' }).click();
    await expect(page.locator('p.text-destructive')).toHaveText('Invalid Base64 string.');
  });
});

test.describe('Text Analyzer', () => {
  const stat = (page, label) =>
    page.getByText(label, { exact: true }).locator('xpath=..');

  test('counts words and matches', async ({ page }) => {
    await page.goto('/text-analizer');
    await page.getByPlaceholder('Input your text...').fill('hello hello world');

    await expect(stat(page, 'Total')).toContainText('3');
    await expect(stat(page, 'Unique')).toContainText('2');
    await expect(stat(page, 'With spaces')).toContainText('17');

    await page.getByPlaceholder('Search for matches...').fill('hello');
    await expect(stat(page, '"hello"')).toContainText('2');
  });
});

test.describe('Mosaic', () => {
  // Fake Imgflip: 15 reviewed templates with mixed aspect ratios + one unreviewed template.
  const SIZES = [[1200, 1200], [600, 908], [1200, 800], [1200, 1200], [500, 750], [1800, 1000], [700, 1400], [900, 600], [1000, 1000], [680, 1024], [1280, 720], [760, 1016], [1100, 700], [610, 1000], [1600, 900]];
  const SAFE_IDS = ['181913649', '87743020', '112126428', '217743513', '124822590', '188390779', '322841258', '135256802', '131940431', '131087935', '4087833', '97984', '309868304', '129242436', '91538330'];
  const memes = [
    ...SAFE_IDS.map((id, i) => ({ id, name: `Meme ${i + 1}`, url: `https://i.imgflip.com/${id}.png`, width: SIZES[i][0], height: SIZES[i][1] })),
    { id: '999999', name: 'Unreviewed', url: 'https://i.imgflip.com/999999.png', width: 500, height: 500 },
  ];

  const mockImgflip = async (page) => {
    await page.route('https://api.imgflip.com/get_memes', (r) => r.fulfill({ json: { success: true, data: { memes } } }));
    await page.route('https://i.imgflip.com/**', (r) => {
      const m = memes.find((x) => r.request().url().includes(x.id));
      r.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}"><rect width="100%" height="100%" fill="#888"/></svg>` });
    });
  };

  const tiles = (page) => page.getByTestId('mosaic-frame').locator('a');

  test('loads nothing until the button is pressed', async ({ page }) => {
    await mockImgflip(page);
    let apiCalls = 0;
    page.on('request', (req) => { if (req.url().includes('imgflip.com')) apiCalls++; });
    await page.goto('/mosaic');
    await expect(page.getByText('Press “Load random memes” to fill the mosaic.')).toBeVisible();
    await expect(tiles(page)).toHaveCount(0);
    expect(apiCalls).toBe(0);
  });

  test('fills the frame without overlaps, only with reviewed memes', async ({ page }) => {
    await mockImgflip(page);
    await page.goto('/mosaic');
    await page.getByRole('button', { name: 'Load random memes' }).click();
    await expect(tiles(page)).toHaveCount(12);

    const frame = await page.getByTestId('mosaic-frame').boundingBox();
    const boxes = await tiles(page).evaluateAll((els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, href: el.href, target: el.target, src: el.querySelector('img').getAttribute('src') };
    }));
    for (const b of boxes) {
      expect(b.src).not.toContain('999999'); // unreviewed template never shown
      expect(b.href).toBe('https://imgflip.com/'); // required attribution link
      expect(b.target).toBe('_blank');
      expect(b.x).toBeGreaterThanOrEqual(frame.x - 1);
      expect(b.y).toBeGreaterThanOrEqual(frame.y - 1);
      expect(b.x + b.w).toBeLessThanOrEqual(frame.x + frame.width + 1);
      expect(b.y + b.h).toBeLessThanOrEqual(frame.y + frame.height + 1);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, c] = [boxes[i], boxes[j]];
        const overlap = a.x < c.x + c.w - 1 && c.x < a.x + a.w - 1 && a.y < c.y + c.h - 1 && c.y < a.y + a.h - 1;
        expect(overlap).toBe(false);
      }
    await expect(page.getByTestId('mosaic-stats')).toContainText('empty space');
  });

  test('options can be hidden and shown', async ({ page }) => {
    await page.goto('/mosaic');
    const toggle = page.getByRole('button', { name: 'Hide options' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(page.getByLabel('Frame')).toBeHidden();
    await page.getByRole('button', { name: 'Show options' }).click();
    await expect(page.getByLabel('Frame')).toBeVisible();
  });

  test('full screen enlarges the mosaic and hides the options', async ({ page }) => {
    await mockImgflip(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/mosaic');
    await page.getByRole('button', { name: 'Load random memes' }).click();
    await expect(tiles(page)).toHaveCount(12);
    const before = await page.getByTestId('mosaic-frame').boundingBox();

    await page.getByRole('button', { name: 'Full screen' }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await expect(page.getByLabel('Frame')).toBeHidden(); // options collapse to give the mosaic room
    await expect.poll(async () => (await page.getByTestId('mosaic-frame').boundingBox()).width).toBeGreaterThan(before.width);
    await expect(tiles(page)).toHaveCount(12);

    // Options can still be opened in full screen.
    await page.getByRole('button', { name: 'Show options' }).click();
    await expect(page.getByLabel('Frame')).toBeVisible();

    await page.getByRole('button', { name: 'Exit full screen' }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
    await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();
  });

  test('without the Fullscreen API (iPhone Safari), "Full screen" opens an overlay', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get: () => false });
    });
    await mockImgflip(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/mosaic');
    // A tall frame: on a portrait phone a 16:9 frame is limited by the width, so it can't grow.
    await page.getByLabel('Frame').selectOption('9:16');
    await page.getByRole('button', { name: 'Load random memes' }).click();
    await expect(tiles(page)).toHaveCount(12);
    const before = await page.getByTestId('mosaic-frame').boundingBox();

    await page.getByRole('button', { name: 'Full screen' }).click();
    const root = await page.getByTestId('mosaic-root').boundingBox();
    expect(root).toEqual({ x: 0, y: 0, width: 390, height: 844 }); // covers the whole viewport
    expect(await page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false); // not the native API
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden'); // page behind is locked
    await expect(page.getByLabel('Frame')).toBeHidden();
    await expect.poll(async () => (await page.getByTestId('mosaic-frame').boundingBox()).height).toBeGreaterThan(before.height);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  });

  test('options re-layout the mosaic', async ({ page }) => {
    await mockImgflip(page);
    await page.goto('/mosaic');
    await page.getByRole('button', { name: 'Load random memes' }).click();
    await expect(tiles(page)).toHaveCount(12);

    await page.getByLabel('Images', { exact: true }).fill('6');
    await page.getByLabel('Images', { exact: true }).press('Enter');
    await expect(tiles(page)).toHaveCount(6);

    // Out-of-range values are clamped: 0 → 1.
    await page.getByLabel('Images', { exact: true }).fill('0');
    await page.getByLabel('Images', { exact: true }).press('Enter');
    await expect(page.getByLabel('Images', { exact: true })).toHaveValue('1');
    await expect(tiles(page)).toHaveCount(1);

    // Typing pauses are enough — no Enter needed.
    await page.getByLabel('Images', { exact: true }).fill('6');
    await expect(tiles(page)).toHaveCount(6);

    const lastBottom = async () => {
      const f = await page.getByTestId('mosaic-frame').boundingBox();
      const rects = await tiles(page).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
      return Math.max(...rects) - f.y;
    };
    await page.getByLabel('Frame').selectOption('9:16'); // tall frame → vertical leftover
    await page.getByLabel('Leftover space').selectOption('end');
    const endBottom = await lastBottom();
    await page.getByLabel('Leftover space').selectOption('distribute');
    await expect.poll(lastBottom).toBeGreaterThan(endBottom + 1); // spread: last row moves down
  });
});

test.describe('Mosaic — my images', () => {
  const png = (name, w, h, color) => ({ name, mimeType: 'image/png', buffer: makePng(w, h, color) });
  const tiles = (page) => page.getByTestId('mosaic-frame').locator('img');
  const useLocal = async (page) => {
    await page.goto('/mosaic');
    await page.getByLabel('Source').selectOption('local');
  };

  test('adds images locally, without any network request', async ({ page, baseURL }) => {
    const external = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== new URL(baseURL).origin) external.push(r.url()); });
    await useLocal(page);
    await expect(page.getByText('Drop images or videos here, or press “Add files”. They stay on your device.')).toBeVisible();
    await expect(page.getByLabel('Images', { exact: true })).toBeHidden(); // the meme count doesn't apply here

    await page.getByTestId('mosaic-file-input').setInputFiles([
      png('wide.png', 400, 300, [200, 60, 60]), png('tall.png', 300, 600, [60, 200, 60]), png('square.png', 500, 500, [60, 60, 200]),
    ]);
    await expect(tiles(page)).toHaveCount(3);
    await expect(page.getByTestId('mosaic-stats')).toContainText('3/20 files');
    const srcs = await tiles(page).evaluateAll((els) => els.map((e) => e.src));
    srcs.forEach((src) => expect(src.startsWith('blob:')).toBe(true));
    // Local images aren't wrapped in the imgflip attribution link.
    await expect(page.getByTestId('mosaic-frame').locator('a')).toHaveCount(0);
    expect(external).toEqual([]);
  });

  test('scales large images down to 2048 px on the long side', async ({ page }) => {
    await useLocal(page);
    await page.getByTestId('mosaic-file-input').setInputFiles([png('big.png', 3000, 1500)]);
    await expect(tiles(page)).toHaveCount(1);
    await expect.poll(() => tiles(page).first().evaluate((img) => img.complete && `${img.naturalWidth}x${img.naturalHeight}`)).toBe('2048x1024');
  });

  test('rejects files that are not images, unreadable or too heavy, and keeps the rest', async ({ page }) => {
    await useLocal(page);
    await page.getByTestId('mosaic-file-input').setInputFiles([
      png('ok.png', 400, 300),
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') },
      { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not really a png') },
      { name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(31 * 1024 * 1024) },
    ]);
    await expect(tiles(page)).toHaveCount(1);
    const alert = page.getByTestId('mosaic-notices');
    await expect(alert).toContainText('notes.txt: not an image or a video');
    await expect(alert).toContainText("broken.png: this browser can't read this image format");
    await expect(alert).toContainText('huge.png: too large (31.0 MB, max 30 MB)');
    await alert.getByRole('button', { name: 'Dismiss' }).click();
    await expect(alert).toBeHidden();
  });

  test('stops at 20 images', async ({ page }) => {
    await useLocal(page);
    await page.getByTestId('mosaic-file-input').setInputFiles(Array.from({ length: 22 }, (_, i) => png(`img-${i}.png`, 200 + i * 10, 200)));
    await expect(tiles(page)).toHaveCount(20);
    await expect(page.getByTestId('mosaic-notices')).toContainText('2 files were not added: the limit is 20 files');
    await expect(page.getByRole('button', { name: 'Add files' })).toBeDisabled();
  });

  test('removes one image, clears all, and keeps memes and my images apart', async ({ page }) => {
    await useLocal(page);
    await page.getByTestId('mosaic-file-input').setInputFiles([png('a.png', 400, 300), png('b.png', 300, 400)]);
    await expect(tiles(page)).toHaveCount(2);

    await page.getByTestId('mosaic-frame').hover();
    await page.getByRole('button', { name: 'Remove a.png' }).click();
    await expect(tiles(page)).toHaveCount(1);
    await expect(page.getByRole('img', { name: 'b.png' })).toBeVisible();

    await page.getByLabel('Source').selectOption('memes');
    await expect(tiles(page)).toHaveCount(0);
    await page.getByLabel('Source').selectOption('local');
    await expect(tiles(page)).toHaveCount(1); // still there after switching back

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(tiles(page)).toHaveCount(0);
  });

  test('accepts images dropped on the mosaic', async ({ page }) => {
    await useLocal(page);
    const bytes = [...makePng(320, 240)];
    await page.getByTestId('mosaic-frame').evaluate((frame, data) => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array(data)], 'dropped.png', { type: 'image/png' }));
      frame.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
      frame.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    }, bytes);
    await expect(page.getByRole('img', { name: 'dropped.png' })).toBeVisible();
  });
});

test.describe('Mosaic — my files: videos', () => {
  // Records a short WebM in the browser (canvas + MediaRecorder) so tests need no video fixtures.
  const recordWebm = async (page, width, height, name) => {
    const bytes = await page.evaluate(async ([w, h]) => {
      const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      const stopped = new Promise((r) => { rec.onstop = r; });
      rec.start();
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${i * 18}, 70%, 50%)`;
        ctx.fillRect(0, 0, w, h);
        await new Promise((r) => setTimeout(r, 40));
      }
      rec.stop();
      await stopped;
      return [...new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer())];
    }, [width, height]);
    return { name, mimeType: 'video/webm', buffer: Buffer.from(bytes) };
  };
  const videos = (page) => page.getByTestId('mosaic-frame').locator('video');

  test('plays videos muted and looped next to images, and pauses/plays them all', async ({ page }) => {
    await page.goto('/mosaic');
    await page.getByLabel('Source').selectOption('local');
    const clip = await recordWebm(page, 320, 180, 'clip.webm');
    await page.getByTestId('mosaic-file-input').setInputFiles([clip, { name: 'photo.png', mimeType: 'image/png', buffer: makePng(300, 400) }]);

    await expect(videos(page)).toHaveCount(1);
    await expect(page.getByTestId('mosaic-frame').locator('img')).toHaveCount(1);
    const v = videos(page).first();
    await expect.poll(() => v.evaluate((el) => ({ muted: el.muted, loop: el.loop, inline: el.playsInline }))).toEqual({ muted: true, loop: true, inline: true });
    // Laid out with the video's own aspect ratio (16:9).
    const box = await v.boundingBox();
    expect(box.width / box.height).toBeCloseTo(320 / 180, 1);
    await expect.poll(() => v.evaluate((el) => !el.paused)).toBe(true);

    await page.getByRole('button', { name: 'Pause all' }).click();
    await expect.poll(() => v.evaluate((el) => el.paused)).toBe(true);
    await page.getByRole('button', { name: 'Play all' }).click();
    await expect.poll(() => v.evaluate((el) => !el.paused)).toBe(true);
  });

  test('only one video has sound at a time: click to hear it, the rest are muted', async ({ page }) => {
    await page.goto('/mosaic');
    await page.getByLabel('Source').selectOption('local');
    const clips = [await recordWebm(page, 320, 180, 'one.webm'), await recordWebm(page, 180, 320, 'two.webm'), await recordWebm(page, 240, 240, 'three.webm')];
    await page.getByTestId('mosaic-file-input').setInputFiles(clips);
    await expect(videos(page)).toHaveCount(3);
    const muted = () => videos(page).evaluateAll((els) => Object.fromEntries(els.map((v) => [v.getAttribute('aria-label'), v.muted])));
    expect(await muted()).toEqual({ 'one.webm': true, 'two.webm': true, 'three.webm': true }); // all muted at first

    await page.locator('video[aria-label="one.webm"]').click();
    await expect.poll(muted).toEqual({ 'one.webm': false, 'two.webm': true, 'three.webm': true });
    await expect(page.getByRole('button', { name: 'Sound for one.webm' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.locator('video[aria-label="one.webm"]').evaluate((v) => !v.paused)).toBe(true); // unmuting doesn't pause it

    await page.locator('video[aria-label="two.webm"]').click(); // sound moves to another video
    await expect.poll(muted).toEqual({ 'one.webm': true, 'two.webm': false, 'three.webm': true });

    await page.locator('video[aria-label="two.webm"]').click(); // clicking it again mutes everything
    await expect.poll(muted).toEqual({ 'one.webm': true, 'two.webm': true, 'three.webm': true });

    // Keyboard: the speaker button does the same.
    await page.getByRole('button', { name: 'Sound for three.webm' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(muted).toEqual({ 'one.webm': true, 'two.webm': true, 'three.webm': false });
  });

  test('allows at most 6 videos and rejects unplayable ones', async ({ page }) => {
    await page.goto('/mosaic');
    await page.getByLabel('Source').selectOption('local');
    const clips = [];
    for (let i = 0; i < 7; i++) clips.push(await recordWebm(page, 160 + i * 20, 120, `clip-${i}.webm`));
    // The broken one comes first: it must not use up one of the 6 video slots.
    await page.getByTestId('mosaic-file-input').setInputFiles([
      { name: 'broken.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not a video') }, ...clips,
    ]);
    await expect(videos(page)).toHaveCount(6);
    const notices = page.getByTestId('mosaic-notices');
    await expect(notices).toContainText('1 video was not added: the limit is 6 videos');
    await expect(notices).toContainText("broken.mp4: this browser can't play this video format");
  });
});
