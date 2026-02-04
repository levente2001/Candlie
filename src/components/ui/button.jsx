import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-[var(--candlie-pink-secondary)] text-white hover:bg-[var(--candlie-pink-primary)]',
  outline: 'border border-black/10 bg-white hover:bg-black/5',
  ghost: 'bg-transparent hover:bg-black/5',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', size = 'default', type, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type || 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
});
