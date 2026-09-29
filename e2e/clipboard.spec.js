import { test, expect } from './fixtures';

// Each tool: how to get something to copy, and how to trigger the copy.
const CASES = [
  {
    name: 'Base64',
    path: '/base64',
    prepare: async (page) => {
      await page.getByPlaceholder('Text or Base64...').fill('hello');
      await page.getByRole('button', { name: 'Encode' }).click();
    },
    copyButton: (page) => page.getByRole('button', { name: /^(Copy|Copied!|Copy failed)$/ }),
    failedLabel: (page) => page.getByRole('button', { name: 'Copy failed' }),
  },
  {
    name: 'JSON Minifier',
    path: '/json-minifier',
    prepare: async (page) => {
      await page.getByPlaceholder('Paste your JSON here...').fill('{"a":1}');
      await page.getByRole('button', { name: 'Minify' }).click();
    },
    copyButton: (page) => page.getByRole('button', { name: /^(Copy|Copied!|Copy failed)$/ }),
    failedLabel: (page) => page.getByRole('button', { name: 'Copy failed' }),
  },
  {
    name: 'JWT Decoder',
    path: '/jwt-decoder',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Load example' }).click();
    },
    copyButton: (page) => page.getByRole('button', { name: /^(Copy payload|Copied!|Copy failed)$/ }),
    failedLabel: (page) => page.getByRole('button', { name: 'Copy failed' }),
  },
  {
    name: 'CHMOD Generator',
    path: '/chmod-generator',
    prepare: async () => {},
    copyButton: (page) => page.getByRole('button', { name: 'Copy to clipboard' }),
    failedLabel: (page) => page.getByText('Copy failed', { exact: true }),
  },
];

const blockClipboard = (page) =>
  page.addInitScript(() => {
    navigator.clipboard.writeText = () =>
      Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError'));
  });

for (const c of CASES) {
  test.describe(`${c.name} clipboard errors`, () => {
    test('blocked clipboard shows a descriptive alert', async ({ page }) => {
      await blockClipboard(page);
      await page.goto(c.path);
      await c.prepare(page);

      const button = c.copyButton(page);
      await button.hover();
      await button.click();

      await expect(c.failedLabel(page)).toBeVisible();
      const alert = page.getByRole('alert').filter({ hasText: "Couldn't copy to clipboard" });
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Your browser blocked clipboard access');

      await alert.getByRole('button', { name: 'Dismiss' }).click();
      await expect(alert).toBeHidden();
    });
  });
}

test.describe('Clipboard API unavailable', () => {
  test('explains that HTTPS is required', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    });
    await page.goto('/jwt-decoder');
    await page.getByRole('button', { name: 'Load example' }).click();
    await page.getByRole('button', { name: 'Copy payload' }).click();

    await expect(page.getByRole('button', { name: 'Copy failed' })).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: "Couldn't copy to clipboard" }))
      .toContainText('requires HTTPS');
  });
});

test.describe('Clipboard recovery', () => {
  test('a successful copy clears the error alert', async ({ page }) => {
    await page.addInitScript(() => {
      const original = navigator.clipboard.writeText.bind(navigator.clipboard);
      let calls = 0;
      navigator.clipboard.writeText = (text) =>
        ++calls === 1
          ? Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError'))
          : original(text);
    });
    await page.goto('/jwt-decoder');
    await page.getByRole('button', { name: 'Load example' }).click();

    const alert = page.getByRole('alert').filter({ hasText: "Couldn't copy to clipboard" });
    await page.getByRole('button', { name: 'Copy payload' }).click();
    await expect(alert).toBeVisible();

    await page.getByRole('button', { name: 'Copy failed' }).click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
    await expect(alert).toBeHidden();
  });
});
