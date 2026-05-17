import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children, noPadding = false, hover = false, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-transparent border-t border-accent-orange/15 overflow-hidden transition-all duration-700 rounded-none",
        !noPadding && "p-6 md:p-10 lg:p-16",
        hover && "hover:border-accent-orange/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("mb-10 flex flex-col space-y-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-h1", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-foreground/40 font-medium leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("mt-10 flex items-center p-0", className)} {...props}>
    {children}
  </div>
);
