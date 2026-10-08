'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';

// Turns on offline support; renders nothing.
export function ServiceWorker() {
  useServiceWorker();
  return null;
}
