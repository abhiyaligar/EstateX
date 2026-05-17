import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Toast = ({ isOpen, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-24 md:bottom-8 md:right-8 left-4 right-4 md:left-auto z-[200] flex items-center gap-4 bg-background border border-black/10 dark:border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:min-w-[380px] backdrop-blur-xl"
        >
          <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border ${
            type === 'success' 
              ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
              : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          }`}>
            {type === 'success' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <div className={`h-1 w-1 rounded-full animate-pulse ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{type === 'success' ? 'Operation Success' : 'System Alert'}</h4>
            </div>
            <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{message}</p>
          </div>
 
          <button 
            onClick={onClose}
            className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 rounded-full transition-all text-zinc-600 hover:text-foreground border border-transparent hover:border-black/5 dark:border-white/5"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
