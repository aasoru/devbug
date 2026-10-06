import { METADATA } from '@/shared/metadata';

// Web app manifest (served by Next.js at /manifest.webmanifest and linked from every page):
// what makes devbug installable as an app (PWA). Chrome asks for a name, a start URL, a
// standalone display and 192 px and 512 px icons; no service worker is needed to install.
// Icons are generated from app/icon.svg by scripts/generate-icons.mjs.
export default function manifest() {
  return {
    name: 'devbug — Dev tools & handy utilities',
    short_name: 'devbug',
    description: METADATA.description,
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Splash screen and title bar, matching the icon.
    background_color: '#373737',
    theme_color: '#373737',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
