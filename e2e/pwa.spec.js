import { test, expect } from './fixtures';

// Installable as an app (PWA): what Chrome asks for, checked by Chrome itself.
test.describe('Installable app (PWA)', () => {
  // Chrome only judges installability with a window and a normal profile (headless always says
  // "nothing missing"; test profiles are incognito). Headless it still finds, fetches and parses
  // the manifest, and reports its errors: that's checked here; the rest of the criteria below.
  test('Chrome finds the manifest and parses it without errors', async ({ page }) => {
    await page.goto('/');
    const cdp = await page.context().newCDPSession(page);
    const { url, errors, manifest } = await cdp.send('Page.getAppManifest');
    expect(url).toMatch(/\/manifest\.webmanifest$/);
    expect(errors).toEqual([]);
    expect(manifest.display).toBe('kStandalone'); // Chrome's parsed form
    expect(manifest.icons).toHaveLength(3);
  });

  test('the manifest has a name, a start, standalone display and the icons', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    const manifest = await (await request.get(href)).json();
    expect(manifest).toMatchObject({ name: expect.any(String), short_name: 'devbug', start_url: '/', display: 'standalone' });

    // Each icon exists, is a PNG of the size it claims; there's a 192, a 512 and a maskable one.
    for (const icon of manifest.icons) {
      const size = await page.evaluate(async (src) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        return `${img.naturalWidth}x${img.naturalHeight}`;
      }, icon.src);
      expect(size, icon.src).toBe(icon.sizes);
      expect(icon.type).toBe('image/png');
    }
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  test('iPhone home screen icon and the system bar colour', async ({ page }) => {
    await page.goto('/');
    const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect((await page.request.get(apple)).ok()).toBe(true);
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2); // light and dark
  });
});
