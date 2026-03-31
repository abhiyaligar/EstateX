import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children, noPadding = false, hover = false }) => {
  return (
    <div 
      className={cn(
        "bg-[#141414] border border-white/5 overflow-hidden transition-all duration-500",
        !noPadding && "p-8 md:p-12",
        hover && "hover:border-white/20",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => (
  <div className={cn("mb-6 flex flex-col space-y-1.5", className)}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children }) => (
  <p className={cn("text-sm text-secondary-500 dark:text-secondary-400", className)}>
    {children}
  </p>
);

export const CardContent = ({ className, children }) => (
  <div className={cn("", className)}>
    {children}
  </div>
);

export const CardFooter = ({ className, children }) => (
  <div className={cn("mt-6 flex items-center p-0", className)}>
    {children}
  </div>
);
