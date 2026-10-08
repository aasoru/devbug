import { serviceWorker } from '@/shared/serviceWorker';
import { TOOLS } from '@/shared/tools';

// /sw.js, the service worker (shared/serviceWorker.js), built once per build: VERSION changes
// with every build, so browsers notice a new one and the old version's stored files go.
export const dynamic = 'force-static';

const VERSION = Date.now().toString(36);
const ROUTES = ['/', ...TOOLS.map((tool) => tool.href)];

export function GET() {
  const source = `const VERSION = ${JSON.stringify(VERSION)};\nconst ROUTES = ${JSON.stringify(ROUTES)};\n(${serviceWorker.toString()})();\n`;
  return new Response(source, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // Always checked for a newer version (the browser caps it at 24 h anyway).
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
