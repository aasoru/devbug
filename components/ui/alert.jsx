import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
};

const Alert = ({ ref, className, variant = 'default', ...props }) => (
  <div
    ref={ref}
    role="alert"
    className={twMerge('relative w-full rounded-lg border p-4', variants[variant], className)}
    {...props}
  />
);

const AlertTitle = ({ ref, className, ...props }) => (
  <h5
    ref={ref}
    className={twMerge('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
);

const AlertDescription = ({ ref, className, ...props }) => (
  <div ref={ref} className={twMerge('text-sm leading-relaxed', className)} {...props} />
);

export { Alert, AlertTitle, AlertDescription };
