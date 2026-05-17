import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './Button';

export const Loader = ({ className, size = 24, text }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary-400/20" />
        <Loader2 
          size={size} 
          className="animate-spin text-primary-600 dark:text-primary-400 relative z-10" 
        />
      </div>
      {text && (
        <p className="text-sm font-medium text-secondary-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullScreenLoader = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/80 dark:bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
    <Loader size={48} text={text} />
  </div>
);
