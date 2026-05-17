import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const RejectionModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-background border-red-500/20 shadow-2xl p-0">
          <CardHeader className="border-b border-border p-8 bg-red-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold uppercase tracking-tighter">{title || 'Rejection Required'}</CardTitle>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40">Manual Review Protocol</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-sm text-foreground/60 leading-relaxed">{message || 'Please provide a detailed reason for this rejection.'}</p>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/40">Audit Comments / Rejection Reason</label>
              <textarea 
                className="w-full bg-background border border-border p-4 text-xs font-mono text-foreground focus:border-red-500 outline-none min-h-[120px]"
                placeholder="Entry required..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
              <Button 
                variant="danger" 
                className="flex-1 uppercase tracking-widest text-[10px] font-bold" 
                onClick={() => { onConfirm(reason); setReason(""); }}
                disabled={!reason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RejectionModal;
