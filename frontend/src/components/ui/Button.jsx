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
  const baseStyles = "inline-flex items-center justify-center rounded-none font-medium tracking-wide uppercase text-xs transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-red disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-secondary-800 text-white hover:bg-secondary-700",
    outline: "border border-white/20 text-white hover:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-accent-red text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    icon: "h-11 w-11",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";
