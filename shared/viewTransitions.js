// Names shared by server and client components for view transitions (a 'use client' module
// can't hand plain values to server components: they'd get a client reference instead).

// A view transition name per tool, shared by its home card title and its page title.
export const toolTitleName = (href) => `tool-title${href.replaceAll('/', '-')}`;

// Navigation type for the home's cards: they skip the content crossfade (RouteTransition)
// because the tool's title morphs (ToolTitle), and one moving thing reads better than two.
export const FROM_CARD = 'from-card';
