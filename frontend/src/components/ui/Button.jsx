import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-none font-heading font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30";
  
  const variants = {
    primary: "bg-surface text-black hover:bg-surface hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]",
    secondary: "bg-white text-black hover:bg-zinc-200",
    outline: "border border-[#C5A059]/30 text-[#C5A059] hover:bg-surface/5 hover:border-[#C5A059]",
    ghost: "text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-black/5 dark:bg-black/5 dark:bg-white/5",
    danger: "border border-red-500/30 text-red-500 hover:bg-red-500/5 hover:border-red-500",
    success: "bg-green-500 text-black hover:bg-green-400",
  };

  const sizes = {
    sm: "h-9 px-6",
    md: "h-12 px-10",
    lg: "h-16 px-14 text-sm",
    icon: "h-12 w-12",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-3 h-3 w-3 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-3">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-3">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";
