import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CopyErrorAlert({ message, onDismiss, className }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className={twMerge('pr-10', className)}>
      <AlertTitle>Couldn&apos;t copy to clipboard</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-sm opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
