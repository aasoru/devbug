import { test as base, expect } from '@playwright/test';

// Every test fails if the page throws or logs a console error — this catches
// hydration mismatches and React runtime errors even when the UI looks fine.
export const test = base.extend({
  consoleErrors: [
    async ({ page }, use) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
      });
      await use(errors);
      expect(errors, 'page should not log errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const TOOLS = [
  { path: '/chronometer', title: 'Chronometer', sidebar: 'Chronometer', card: 'Stopwatch with lap tracking.' },
  { path: '/text-analizer', title: 'Text Analizer', sidebar: 'Text Analizer', card: 'Character, word and line counts with pattern matching.' },
  { path: '/chmod-generator', title: 'CHMOD Generator', sidebar: 'CHMOD Generator', card: 'Calculate Unix file permissions in numeric and symbolic format.' },
  { path: '/json-minifier', title: 'JSON Minifier', sidebar: 'Json Minifier', card: 'Minify or prettify JSON with size comparison.' },
  { path: '/jwt-decoder', title: 'JWT Decoder', sidebar: 'JWT Decoder', card: 'Inspect JWT header, payload and expiry without a secret key.' },
  { path: '/base64', title: 'Base64 Encoder / Decoder', sidebar: 'Base64', card: 'Encode and decode Base64 with full UTF-8 support.' },
];
