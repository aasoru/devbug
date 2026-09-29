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
  test('switch to dark, persist on reload, close menu', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle theme' });

    await toggle.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);

    await toggle.click();
    await page.getByRole('menuitem', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();

    await toggle.click();
    await page.getByRole('heading', { name: 'devbug', level: 1 }).click();
    await expect(page.getByRole('menu')).toBeHidden();
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

test.describe('Assets', () => {
  test('opengraph image and favicon', async ({ request }) => {
    const og = await request.get('/opengraph-image');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toContain('image/png');

    const icon = await request.get('/icon.svg');
    expect(icon.status()).toBe(200);
  });
});
