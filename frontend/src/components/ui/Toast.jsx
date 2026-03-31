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
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 bg-white dark:bg-slate-900 border border-secondary-100 dark:border-secondary-800 p-4 rounded-2xl shadow-2xl min-w-[320px]"
        >
          <div className={`p-2 rounded-xl ${type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-secondary-900 dark:text-white capitalize">{type}</h4>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">{message}</p>
          </div>

          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-secondary-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
