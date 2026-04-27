import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children, noPadding = false, hover = false }) => {
  return (
    <div 
      className={cn(
        "bg-transparent border-t border-[#C5A059]/20 overflow-hidden transition-all duration-700 rounded-none",
        !noPadding && "p-6 md:p-10 lg:p-16",
        hover && "hover:border-[#C5A059]/50",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => (
  <div className={cn("mb-10 flex flex-col space-y-4", className)}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }) => (
  <h3 className={cn("text-h1", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children }) => (
  <p className={cn("text-sm text-zinc-500 font-medium leading-relaxed", className)}>
    {children}
  </p>
);

export const CardContent = ({ className, children }) => (
  <div className={cn("", className)}>
    {children}
  </div>
);

export const CardFooter = ({ className, children }) => (
  <div className={cn("mt-10 flex items-center p-0", className)}>
    {children}
  </div>
);
