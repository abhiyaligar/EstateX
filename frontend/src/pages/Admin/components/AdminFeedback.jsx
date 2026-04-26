import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

// Confirmation Modal
export const AdminConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const theme = themes[type] || themes.danger;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`max-w-md w-full bg-[#0a0a0a] border ${theme.border} p-8 space-y-6 shadow-2xl`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg}`}>
            <theme.icon className={theme.color} size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tighter">{title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Critical Protocol Execution</p>
          </div>
        </div>

        <p className="text-sm text-white/60 leading-relaxed">{message}</p>

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
          <Button className={`flex-1 uppercase tracking-widest text-[10px] font-bold text-white ${theme.button}`} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Simple Toast Notification System (to replace alert)
export const AdminToast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-green-500" size={18} />,
    error: <XCircle className="text-red-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed bottom-10 right-10 z-[300] bg-[#0a0a0a] border border-white/10 p-4 pl-6 pr-10 flex items-center gap-4 shadow-2xl min-w-[300px]"
    >
      {icons[type]}
      <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
      <button onClick={onClose} className="absolute top-2 right-2 text-white/20 hover:text-white"><X size={14}/></button>
    </motion.div>
  );
};
