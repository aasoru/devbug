'use client';

import { ViewTransition } from 'react';
import { usePathname } from 'next/navigation';

import { FROM_CARD } from '@/shared/viewTransitions';

// The home's cards (FROM_CARD) skip it: there the tool's title morphs instead.
const CROSSFADE = { [FROM_CARD]: 'none', default: 'auto' };

// Crossfades the page content when moving to another tool: "same place, other content".
// Navigations are transitions in Next.js, so this runs on its own; keyed by path so the old
// page exits and the new one enters. The menu and header sit outside it and stay put.
// Without browser support nothing animates and the page swaps as before.
export function RouteTransition({ children }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter={CROSSFADE} exit={CROSSFADE} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
