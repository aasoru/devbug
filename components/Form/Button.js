'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import LoadingIcon from '@/public/images/icons/loading.svg';

const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    fixedWidth = false,
    fullWidth = false,
    minWidth = false,
    rounded = true,
    tagName,
    loading = false,
    ...props
  },
  ref
) {
  const TagName = tagName ? tagName : props.href ? 'a' : 'button';

  return (
    <TagName
      {...props}
      ref={ref}
      className={twMerge(
        'inline-block',
        'text-sm text-center font-bold',
        'py-2 px-5',
        'rounded',
        'bg-orange-500',
        'text-white',
        'disabled:opacity-50',
        'transition-all duration-300 ease-in-out',
        fixedWidth && 'max-w-xs w-full shrink-0',
        fullWidth && 'w-full',
        minWidth && 'min-w-[200px]',
        rounded && 'rounded-full',
        variant === 'secondary' &&
          'text-neutral-900 to-neutral-500 from-neutral-400',
        variant === 'blue' && 'bg-teal-600 ',
        variant === 'softBlue' && 'bg-cyan-600 ',
        variant === 'mint' && 'text-green-900 from-green-300 to-green-400',
        variant === 'gold' && 'text-yellow-900 from-yellow-300 to-yellow-500',
        variant === 'purple' &&
          'bg-purple-800 from-purple-800 to-pink-600 text-white',
        className
      )}
      disabled={loading}
    >
      {!loading && children}
      {loading && (
        <LoadingIcon className="w-full animate-spin" width="20" height="20" />
      )}
    </TagName>
  );
});

export default Button;
