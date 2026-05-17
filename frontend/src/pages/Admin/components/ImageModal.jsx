import React from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-10 right-10 text-foreground/40 hover:text-foreground transition-colors">
        <X size={32} />
      </button>
      <div className="max-w-4xl w-full flex flex-col items-center">
        <img src={imageUrl} alt={title} className="max-h-[80vh] w-auto border border-border shadow-2xl" />
        <h3 className="mt-6 text-[10px] uppercase tracking-[0.4em] font-bold text-foreground/40">{title}</h3>
      </div>
    </div>
  );
};

export default ImageModal;
