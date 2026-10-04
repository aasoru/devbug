// Layout options shown in the options panel, and their defaults.

// "Screen" takes the window's shape, and in full screen all the space left for the mosaic.
export const FRAMES = [
  { value: 'screen', label: 'Screen' },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
  { value: '4:3', label: '4:3', w: 4, h: 3 },
  { value: '1:1', label: '1:1', w: 1, h: 1 },
  { value: '3:4', label: '3:4', w: 3, h: 4 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
];

export const GAPS = [0, 4, 8, 16].map((g) => ({ value: String(g), label: `${g}px` }));

export const SIZES = [
  { value: 'similar', label: 'Similar sizes' },
  { value: 'any', label: 'Least empty space' },
];

export const LEFTOVER = [
  { value: 'center', label: 'Centered' },
  { value: 'distribute', label: 'Spread as spacing' },
  { value: 'end', label: 'At the end' },
];

export const DEFAULT_OPTIONS = {
  frame: 'screen',
  gap: '4',
  sizes: 'similar',
  leftover: 'center',
  reorder: true, // the mosaic may change the order to fit better
};
