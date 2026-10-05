import AxeBuilder from '@axe-core/playwright';
import { test, expect, TOOLS } from './fixtures';
import { makePng } from './png';

// WCAG 2.2 level AA, checked by axe-core (CLAUDE.md, "Usability & accessibility"). axe catches
// what can be detected automatically: contrast, names, labels, ARIA, target size… Keyboard flow
// and screen reader sense still need a manual check.
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const expectAccessible = async (page, where) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  const report = violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(report, `accessibility violations on ${where}`).toEqual([]);
};

const jwt = (payload) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;

for (const scheme of ['light', 'dark']) {
  test.describe(`Accessibility, ${scheme} theme`, () => {
    test.beforeEach(({ page }) => page.emulateMedia({ colorScheme: scheme }));

    for (const path of ['/', ...TOOLS.map((t) => t.path)]) {
      test(`${path} as it opens`, async ({ page }) => {
        await page.goto(path);
        await expectAccessible(page, path);
      });
    }

    test('tools in use: results, errors and badges', async ({ page }) => {
      await page.goto('/chronometer');
      await page.getByRole('button', { name: 'Start' }).click();
      await page.getByRole('button', { name: 'Lap' }).click();
      await page.getByRole('button', { name: 'Stop' }).click();
      await expectAccessible(page, 'chronometer with laps');

      await page.goto('/text-analizer');
      await page.getByPlaceholder('Input your text...').fill('hello world');
      await page.getByPlaceholder('Search for matches...').fill('o');
      await expectAccessible(page, 'text analyzer with stats and a search');

      await page.goto('/chmod-generator');
      await page.getByPlaceholder('755 or rwxr-xr-x').fill('zzz');
      await expectAccessible(page, 'chmod with an invalid string');

      await page.goto('/json-minifier');
      await page.getByPlaceholder('Paste your JSON here...').fill('{ "a": 1 }');
      await page.getByRole('button', { name: 'Minify' }).click();
      await expectAccessible(page, 'json minified (% smaller)');
      await page.getByPlaceholder('Paste your JSON here...').fill('{ bad');
      await page.getByRole('button', { name: 'Minify' }).click();
      await expectAccessible(page, 'json error');

      await page.goto('/jwt-decoder');
      await page.getByPlaceholder('Paste your JWT token here...').fill(jwt({ exp: 4102444800 }));
      await expectAccessible(page, 'jwt valid badge');
      await page.getByPlaceholder('Paste your JWT token here...').fill(jwt({ exp: 1 }));
      await expectAccessible(page, 'jwt expired badge');
      await page.getByPlaceholder('Paste your JWT token here...').fill('not.a.jwt');
      await expectAccessible(page, 'jwt invalid');

      await page.goto('/base64');
      await page.getByPlaceholder('Text or Base64...').fill('%%%');
      await page.getByRole('button', { name: 'Decode' }).click();
      await expectAccessible(page, 'base64 error');
    });

    test('mosaic in use: popover, tiles, notices, full screen sheet', async ({ page }) => {
      const memes = [['181913649', 1200, 1200], ['87743020', 600, 908], ['112126428', 1200, 800]]
        .map(([id, width, height], i) => ({ id, name: `Meme ${i}`, url: `https://i.imgflip.com/${id}.png`, width, height }));
      await page.route('https://api.imgflip.com/get_memes', (r) => r.fulfill({ json: { success: true, data: { memes } } }));
      await page.route('https://i.imgflip.com/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>' }));
      await page.goto('/mosaic');
      await page.getByRole('button', { name: 'More ways to add' }).click();
      await expectAccessible(page, 'mosaic memes popover');
      await page.getByRole('dialog', { name: 'Load memes' }).getByRole('button', { name: 'Load random memes' }).click();
      await page.getByTestId('mosaic-file-input').setInputFiles([
        { name: 'a.png', mimeType: 'image/png', buffer: makePng(300, 200) },
        { name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('x') },
      ]);
      await expect(page.getByTestId('mosaic-notices')).toBeVisible();
      await expectAccessible(page, 'mosaic with tiles and a notice');
      await page.getByRole('button', { name: 'Full screen' }).click();
      await page.getByRole('button', { name: 'Show controls' }).click();
      await expect(page.getByRole('dialog', { name: 'Mosaic controls' })).toBeVisible();
      await page.waitForTimeout(400); // the sheet slides in
      await expectAccessible(page, 'mosaic full screen with the controls sheet open');
    });

    test('phone: the menu open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 700 });
      await page.goto('/base64');
      await page.getByRole('button', { name: 'Toggle sidebar' }).click();
      await expect(page.locator('aside')).toBeInViewport();
      await expectAccessible(page, 'phone menu open');
    });
  });
}
