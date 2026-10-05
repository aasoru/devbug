import { test, expect, TOOLS } from './fixtures';

test.describe('Smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'devbug', level: 1 })).toBeVisible();
  });

  for (const tool of TOOLS) {
    test(`${tool.path} loads`, async ({ page }) => {
      await page.goto(tool.path);
      await expect(page.getByRole('heading', { name: tool.title })).toBeVisible();
    });
  }
});

test.describe('Navigation', () => {
  test('the sidebar and the home list every tool, and nothing else', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('aside ul').getByRole('link');
    await expect(menu).toHaveText(TOOLS.map((t) => t.sidebar));
    const cards = page.locator('main').getByRole('link').filter({ has: page.locator('p.font-semibold') });
    await expect(cards).toHaveCount(TOOLS.length);
    for (const tool of TOOLS) await expect(cards.filter({ hasText: tool.card })).toHaveAttribute('href', tool.path);
  });

  test('sidebar navigates client-side, without a full page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.__noReload = true; });
    await page.locator('aside').getByRole('link', { name: 'Base64', exact: true }).click();
    await expect(page).toHaveURL('/base64');
    expect(await page.evaluate(() => window.__noReload)).toBe(true);
  });

  for (const tool of TOOLS) {
    test(`sidebar → ${tool.path}`, async ({ page }) => {
      await page.goto('/');
      await page.locator('aside').getByRole('link', { name: tool.sidebar, exact: true }).click();
      await expect(page).toHaveURL(tool.path);
      await expect(page.getByRole('heading', { name: tool.title })).toBeVisible();
    });

    test(`home card → ${tool.path}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link').filter({ hasText: tool.card }).click();
      await expect(page).toHaveURL(tool.path);
      await expect(page.getByRole('heading', { name: tool.title })).toBeVisible();
    });
  }
});

test.describe('Theme', () => {
  const html = (page) => page.locator('html');
  const stored = (page) => page.evaluate(() => localStorage.getItem('theme'));

  for (const os of ['light', 'dark']) {
    test(`starts from the OS preference (${os})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: os });
      await page.goto('/');
      const toggle = page.getByRole('button', { name: 'Dark mode' });
      await expect(toggle).toHaveAttribute('aria-pressed', String(os === 'dark'));
      if (os === 'dark') await expect(html(page)).toHaveClass(/\bdark\b/);
      else await expect(html(page)).not.toHaveClass(/\bdark\b/);
    });
  }

  test('toggles, persists on reload and goes back to following the OS', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark mode' });

    await toggle.click();
    await expect(html(page)).toHaveClass(/\bdark\b/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(await stored(page)).toBe('dark');

    await page.reload();
    await expect(html(page)).toHaveClass(/\bdark\b/);

    // Choosing the same theme as the OS stores "system", so OS changes are followed again.
    await toggle.click();
    await expect(html(page)).not.toHaveClass(/\bdark\b/);
    expect(await stored(page)).toBe('system');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(html(page)).toHaveClass(/\bdark\b/);
  });

  test('works with the keyboard', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark mode' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(html(page)).toHaveClass(/\bdark\b/);
    await page.keyboard.press('Space');
    await expect(html(page)).not.toHaveClass(/\bdark\b/);
  });
});

test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test('hamburger opens sidebar, overlay closes it', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeInViewport();

    await page.getByRole('button', { name: 'Toggle sidebar' }).click();
    await expect(sidebar).toBeInViewport();

    // Click the overlay, outside the sidebar (which is 5/6 of the width).
    await page.mouse.click(365, 400);
    await expect(sidebar).not.toBeInViewport();
  });

  test('sidebar closes after navigating', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await page.getByRole('button', { name: 'Toggle sidebar' }).click();
    await expect(sidebar).toBeInViewport();

    await sidebar.getByRole('link', { name: 'JWT Decoder', exact: true }).click();
    await expect(page).toHaveURL('/jwt-decoder');
    await expect(sidebar).not.toBeInViewport();
  });
});

test.describe('Privacy', () => {
  // No analytics or third-party scripts: every request must stay on our own origin.
  for (const tool of [{ path: '/' }, ...TOOLS]) {
    test(`${tool.path} makes no third-party requests`, async ({ page, baseURL }) => {
      const external = [];
      page.on('request', (req) => {
        const url = new URL(req.url());
        if (!['data:', 'blob:'].includes(url.protocol) && url.origin !== new URL(baseURL).origin) external.push(req.url());
      });
      await page.goto(tool.path, { waitUntil: 'networkidle' });
      expect(external).toEqual([]);
    });
  }
});

test.describe('Assets', () => {
  test('opengraph image and favicon', async ({ request }) => {
    const og = await request.get('/opengraph-image');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toContain('image/png');

    const icon = await request.get('/icon.svg');
    expect(icon.status()).toBe(200);
  });
});
