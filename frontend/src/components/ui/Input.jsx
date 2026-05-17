import React from 'react';
import { cn } from './Button';

export const Input = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] font-medium text-black/40 dark:text-white/40">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-none border border-black/5 dark:border-white/5 bg-surface px-4 py-2 text-sm text-foreground transition-all placeholder:text-black/20 dark:text-white/20 focus-visible:outline-none focus-visible:border-black/20 dark:border-white/20 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-12",
            error && "border-accent-red focus-visible:border-accent-red",
            className
          )}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={cn("mt-1.5 text-xs text-secondary-500", error && "text-red-500 font-medium")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
