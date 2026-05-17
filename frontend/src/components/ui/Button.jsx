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
    primary: "bg-accent-orange text-foreground hover:bg-accent-orange/90 hover:shadow-[0_0_30px_rgba(var(--color-accent-orange),0.15)]",
    secondary: "bg-foreground text-background hover:bg-foreground/80",
    outline: "border border-accent-orange/30 text-accent-orange hover:bg-accent-orange/5 hover:border-accent-orange",
    ghost: "text-foreground/40 hover:text-foreground hover:bg-foreground/5",
    danger: "border border-red-500/30 text-red-500 hover:bg-red-500/5 hover:border-red-500",
    success: "bg-green-500 text-foreground hover:bg-green-400",
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
