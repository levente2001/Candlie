import React from 'react';
import { cn } from '@/lib/utils';

const DialogContext = React.createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => onOpenChange?.(false)}
        />
        <div className="relative w-full">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => onOpenChange?.(false)}
        className="absolute right-4 top-4 rounded-lg p-2 text-black/40 hover:bg-black/5 hover:text-black"
      >
        ✕
      </button>
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}
