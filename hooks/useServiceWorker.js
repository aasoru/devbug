'use client';

import { useEffect } from 'react';

// Registers the service worker (offline support, /sw.js). Production only: in development it
// would keep stale copies of pages that are being edited.
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {}); // no offline support, nothing else breaks
  }, []);
}
