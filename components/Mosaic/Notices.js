import { X } from 'lucide-react';

// Files that couldn't be added, with a button to dismiss the list.
export function Notices({ notices, onDismiss }) {
  if (!notices.length) return null;
  return (
    <div role="alert" data-testid="mosaic-notices" className="relative rounded-md border border-destructive/50 p-3 pr-10 text-sm text-destructive dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <ul className="list-disc pl-5">
        {notices.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
      <button type="button" aria-label="Dismiss" onClick={onDismiss} className="absolute right-3 top-3 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
