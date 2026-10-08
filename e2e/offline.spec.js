import { test, expect, TOOLS } from './fixtures';

// Works without a connection after the first visit (service worker: shared/serviceWorker.js,
// served by app/sw.js/route.js).
test.describe('Offline (installed app)', () => {
  // The service worker controls the page and has stored every page for offline use.
  const ready = async (page) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 15000 }).toBe(true);
    await expect.poll(() => page.evaluate(async (paths) => {
      for (const path of paths) if (!(await caches.match(path))) return false;
      return true;
    }, ['/', ...TOOLS.map((t) => t.path)]), { timeout: 15000 }).toBe(true);
  };

  test('every tool opens and works without a connection, even ones not visited before', async ({ page, context, consoleErrors }) => {
    await ready(page);
    await context.setOffline(true);

    // A full page load, never visited: served from what the service worker stored.
    await page.goto('/base64');
    await expect(page.getByRole('heading', { name: 'Base64 Encoder / Decoder' })).toBeVisible();
    await page.getByPlaceholder('Text or Base64...').fill('hola');
    await page.getByRole('button', { name: 'Encode' }).click();
    await expect(page.getByPlaceholder('Result will appear here...')).toHaveValue('aG9sYQ==');

    // Moving between tools with the menu.
    for (const tool of TOOLS) {
      await page.locator('aside nav').getByRole('link', { name: tool.sidebar, exact: true }).click();
      await expect(page.getByRole('heading', { name: tool.title })).toBeVisible();
    }

    // Memes need the network: the usual error, no crash.
    await page.getByRole('button', { name: 'More ways to add' }).click();
    await page.getByRole('dialog', { name: 'Load memes' }).getByRole('button', { name: 'Load random memes' }).click();
    await expect(page.getByText("Couldn't load memes from imgflip.com. Try again later.")).toBeVisible();
    // The one console error expected here: the browser's own log of that failed request. Any
    // other error still fails the test.
    const expected = 'console.error: Failed to load resource: net::ERR_INTERNET_DISCONNECTED';
    expect(consoleErrors.filter((e) => e === expected)).toHaveLength(1);
    consoleErrors.splice(consoleErrors.indexOf(expected), 1);
  });

  test('online, pages always come from the network (never a stale copy)', async ({ page }) => {
    await ready(page);
    const fromNetwork = await page.evaluate(async () => {
      const res = await fetch('/base64', { headers: { accept: 'text/html' } });
      return res.ok;
    });
    expect(fromNetwork).toBe(true);
    // The service worker script itself is never cached by the browser, so new versions are found.
    const sw = await page.request.get('/sw.js');
    expect(sw.headers()['content-type']).toContain('javascript');
    expect(sw.headers()['cache-control']).toContain('no-cache');
  });
});
