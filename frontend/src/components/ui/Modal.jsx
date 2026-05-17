import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-background p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] text-zinc-600 font-black leading-none">Security Protocol Active</p>
            <h3 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tighter">
                {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full h-10 w-10 flex items-center justify-center text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 transition-all border border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20"
          >
            <X size={20} />
          </button>
        </div>
        
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
