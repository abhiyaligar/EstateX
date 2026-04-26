import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const BuildersTab = ({ pendingBuilders, onAudit }) => {
  return (
    <motion.div 
      key="builders"
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6"
    >
       <Card noPadding>
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Builder Verification Wall</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Review and approve business credentials</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
              Pending: {pendingBuilders.length}
            </div>
          </div>
          
          <div className="p-8">
             {pendingBuilders.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-white/5">
                   <Building2 className="mx-auto mb-4 text-white/10" size={48} />
                   <p className="text-xs text-white/20 uppercase tracking-[0.3em]">No builders currently awaiting verification</p>
                </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingBuilders.map(b => (
                    <div key={b.id} className="bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between group hover:border-white/20 transition-colors">
                       <div className="mb-6">
                         <div className="flex items-start justify-between mb-2">
                           <h4 className="text-xl font-bold uppercase tracking-tight">{b.company_name}</h4>
                           <span className="text-[10px] font-mono text-white/30">REF: {b.id.substring(0,8)}</span>
                         </div>
                         <div className="space-y-2">
                           <div className="flex text-[10px] uppercase tracking-widest gap-2">
                             <span className="text-white/30">REG NO:</span>
                             <span className="text-white/60 font-mono">{b.company_registration_number || 'NOT PROVIDED'}</span>
                           </div>
                           <div className="flex text-[10px] uppercase tracking-widest gap-2">
                             <span className="text-white/30">RERA:</span>
                             <span className="text-white/60 font-mono">{b.rera_registration_number || 'NOT PROVIDED'}</span>
                           </div>
                           <div className="flex text-[10px] uppercase tracking-widest gap-2">
                             <span className="text-white/30">BANK:</span>
                             <span className="text-white/60 font-mono">{b.bank_name || 'PENDING'} - {b.bank_account_number || 'PENDING'}</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex gap-4 pt-6 border-t border-white/5">
                          <Button 
                            variant="outline" 
                            className="w-full h-12 text-[10px] font-bold tracking-widest"
                            onClick={() => onAudit(b)}
                          >
                            AUDIT ASSETS
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
       </Card>
    </motion.div>
  );
};

export default BuildersTab;
