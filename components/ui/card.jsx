import * as React from 'react';

import { twMerge } from 'tailwind-merge';

// Card owns the padding (px-6 py-6); its sub-components add none, so everything aligns.
// variant="page": the main card of a tool page — on phones it drops its border,
// rounding, shadow and side padding so content uses the full width (aligned with the header).
const variants = {
  default: '',
  page: 'max-sm:rounded-none max-sm:border-0 max-sm:shadow-none max-sm:px-0 max-sm:pt-2',
};

const Card = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge(
      'rounded-lg border bg-card text-card-foreground shadow-xs max-w-2xl mx-auto py-6 px-4 sm:px-6',
      variants[variant],
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={twMerge(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={twMerge('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge('flex items-center', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
