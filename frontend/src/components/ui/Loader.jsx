import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from './Button';

export const Loader = ({ className, size = 32, text }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      <div 
        className="bg-accent-orange/10 rounded-full flex items-center justify-center animate-pulse border border-accent-orange/20"
        style={{ width: size * 2, height: size * 2 }}
      >
        <Zap size={size} className="text-accent-orange" />
      </div>
      {text && (
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 animate-pulse font-heading text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullScreenLoader = ({ text = "SYNCING TERMINAL NODE..." }) => (
  <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-md">
    <Loader size={32} text={text} />
  </div>
);
