import { test, expect } from './fixtures';

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
