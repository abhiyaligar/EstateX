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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl transition-all border border-secondary-100 dark:border-secondary-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white font-heading">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-secondary-400 hover:bg-secondary-50 dark:hover:bg-slate-900 transition-colors"
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
