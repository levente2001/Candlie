import React from 'react';
import { cn } from '@/lib/utils';

export function Switch({ checked, onCheckedChange, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-[var(--candlie-pink-secondary)]' : 'bg-black/10',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white transition-transform border border-black/10',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}
