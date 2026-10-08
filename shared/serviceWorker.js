// The service worker that makes devbug work offline. Written as a plain function (linted like
// the rest of the code) and turned into a script by app/sw.js/route.js, which adds VERSION (one
// per build) and ROUTES (every page). It never runs in this module: only `self`, `caches` and
// `fetch` of the worker's own scope exist where it runs.
/* global VERSION, ROUTES */
export function serviceWorker() {
  const CACHE = `devbug-${VERSION}`;
  // Files whose name changes with their content (Next's build output) or that rarely change: a
  // stored copy is never wrong, so it's used first.
  const STORED_FIRST = /^\/(_next\/static\/|icons\/|icon\.svg|apple-icon\.png|manifest\.webmanifest|favicon\.ico)/;
  // Assets a stored page needs to work offline: scripts, styles, icons it links to.
  const ASSET = /(?:src|href)="(\/[^"]+?\.(?:js|css|svg|png|ico|webmanifest)(?:\?[^"]*)?)"/g;

  const store = async (cache, path) => {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (response.ok) await cache.put(path, response.clone());
      return response;
    } catch {
      return null;
    }
  };

  // Install: store every page and everything it links to, so each works offline even if it was
  // never opened. The new version takes over the next time the app opens (no skipWaiting):
  // pages already open keep the files they started with.
  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const assets = new Set();
      for (const route of ROUTES) {
        const page = await store(cache, route);
        if (!page?.ok) continue;
        for (const [, asset] of (await page.text()).matchAll(ASSET)) assets.add(asset.replaceAll('&amp;', '&'));
      }
      await Promise.all([...assets].map((asset) => store(cache, asset)));
    })());
  });

  // Activate: drop the stores of older versions, and look after pages opened before this one.
  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return; // memes, etc.

    // Next's in-app navigation data (?_rsc): not stored (it depends on request headers). Offline,
    // answer with something that isn't navigation data: Next then loads the page in full, which
    // comes from the stored copy below — a failed fetch would do the same but log an error.
    if (url.searchParams.has('_rsc')) {
      event.respondWith(fetch(request).catch(() => new Response('', { headers: { 'Content-Type': 'text/html' } })));
      return;
    }

    // Pages: from the network when there is one (always the latest version), else the stored copy.
    if (request.mode === 'navigate') {
      event.respondWith((async () => {
        try {
          const response = await fetch(request);
          if (response.ok) (await caches.open(CACHE)).put(url.pathname, response.clone());
          return response;
        } catch {
          return (await caches.match(url.pathname)) ?? Response.error();
        }
      })());
      return;
    }

    if (STORED_FIRST.test(url.pathname)) {
      event.respondWith((async () => {
        const stored = await caches.match(request);
        if (stored) return stored;
        const response = await fetch(request);
        if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
        return response;
      })());
    }
  });
}
