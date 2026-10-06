// Generates the app's PNG icons from app/icon.svg (the favicon), so they never drift from it.
// Run after changing the logo: `node scripts/generate-icons.mjs`. Renders with Playwright's
// Chromium (already a dev dependency), so there's no image library to install.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BACKGROUND = '#373737'; // the favicon's background, also the sidebar colour
const favicon = readFileSync(new URL('../app/icon.svg', import.meta.url), 'utf8');
const glyph = favicon.match(/<path[^>]*\/>/)[0]; // the bug, drawn in a 24×24 box

// The bug on a full square, at `scale` of its side (no rounded corners: the platform adds its
// own mask — a circle, a squircle…).
const fullBleed = (scale) => {
  const size = 24 * scale;
  const offset = (32 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" fill="${BACKGROUND}"/>
    <svg x="${offset}" y="${offset}" width="${size}" height="${size}" viewBox="0 0 24 24">${glyph}</svg>
  </svg>`;
};

const ICONS = [
  // Regular icons: the favicon as it is (rounded square, transparent corners).
  { file: 'public/icons/icon-192.png', size: 192, svg: favicon },
  { file: 'public/icons/icon-512.png', size: 512, svg: favicon },
  // Maskable (Android crops it to its own shape, down to a circle of 80% of the side): the
  // bug's corners stay inside that circle.
  { file: 'public/icons/icon-maskable-512.png', size: 512, svg: fullBleed(0.8) },
  // iPhone home screen: iOS rounds the corners itself and doesn't allow transparency.
  { file: 'app/apple-icon.png', size: 180, svg: fullBleed(0.9) },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, svg } of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: file, omitBackground: true });
  console.log(`${file} (${size}×${size})`);
}
await browser.close();
