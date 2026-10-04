import { LOCAL_LIMITS } from './limits';

const BAND = { none: 'none', bottom: 'vertical', side: 'horizontal' };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// One line about what's in the mosaic and how well it fits.
export function Stats({ files, memes, layout }) {
  const lines = layout.flow === 'columns' ? plural(layout.rows, 'column', 'columns') : plural(layout.rows, 'row', 'rows');
  return (
    <p className="text-sm text-muted-foreground" data-testid="mosaic-stats">
      {files > 0 && `${files}/${LOCAL_LIMITS.maxFiles} files · `}
      {memes > 0 && `${plural(memes, 'meme', 'memes')} · `}
      {lines} · empty space {(layout.empty * 100).toFixed(1)}% ({BAND[layout.band]})
    </p>
  );
}
