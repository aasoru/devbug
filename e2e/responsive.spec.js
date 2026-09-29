import { test, expect } from './fixtures';

// No page may scroll horizontally on small phones, even with a larger system
// text size (Firefox/Android accessibility setting, simulated via root font-size).
const ROUTES = ['/', '/chronometer', '/text-analizer', '/chmod-generator', '/json-minifier', '/jwt-decoder', '/base64'];

for (const width of [320, 360]) {
  for (const textSize of [100, 125]) {
    test.describe(`${width}px, text ${textSize}%`, () => {
      test.use({ viewport: { width, height: 800 } });

      for (const route of ROUTES) {
        test(`${route} has no horizontal overflow`, async ({ page }) => {
          await page.goto(route);
          await page.addStyleTag({ content: `html { font-size: ${textSize}% !important; }` });
          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(scrollWidth, 'page must not scroll horizontally').toBeLessThanOrEqual(clientWidth);
        });
      }
    });
  }
}
