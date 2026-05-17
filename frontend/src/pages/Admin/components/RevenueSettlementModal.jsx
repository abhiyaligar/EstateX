import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const RevenueSettlementModal = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
         className="max-w-2xl w-full bg-background border border-green-500/20 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]"
       >
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-green-500/5">
             <div>
                <div className="flex items-center gap-2 text-green-500 mb-1">
                   <CheckCircle2 size={18} />
                   <h3 className="text-xl font-bold uppercase tracking-tighter">Settlement Successful</h3>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Distribution cycle executed across node network</p>
             </div>
             <button onClick={onClose} className="text-black/20 dark:text-white/20 hover:text-foreground"><X size={20}/></button>
          </div>
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                   <p className="text-[8px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Gross Yield</p>
                   <p className="text-lg font-mono font-bold text-foreground">₹{parseFloat(result.cycle.gross_amount).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                   <p className="text-[8px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Platform Fee (1%)</p>
                   <p className="text-lg font-mono font-bold text-amber-500">₹{parseFloat(result.cycle.fee_amount).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                   <p className="text-[8px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Total Payouts</p>
                   <p className="text-lg font-mono font-bold text-green-500">{result.payouts.length}</p>
                </div>
             </div>

             <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 dark:text-white/30 mb-4">Credited Investors (Mature Holdings Only)</h4>
                <div className="max-h-[300px] overflow-y-auto border border-black/5 dark:border-white/5">
                   <table className="w-full text-left text-[10px]">
                      <thead className="bg-black/5 dark:bg-black/5 dark:bg-white/5 sticky top-0">
                         <tr className="uppercase tracking-widest text-black/40 dark:text-white/40 border-b border-black/5 dark:border-white/5">
                            <th className="p-4">Investor</th>
                            <th className="p-4">Mature Bricks</th>
                            <th className="p-4 text-right">Amount Credited</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {result.payouts.map((p, i) => (
                           <tr key={i} className="hover:bg-black/[0.04] dark:bg-white/[0.02]">
                              <td className="p-4">
                                 <span className="block font-bold text-foreground uppercase">{p[1]} {p[2]}</span>
                                 <span className="text-black/30 dark:text-white/30 lowercase">{p[3]}</span>
                              </td>
                              <td className="p-4 font-mono">{p[0].eligible_quantity} BK</td>
                              <td className="p-4 text-right font-bold text-green-500 font-mono">₹{parseFloat(p[0].amount_paid).toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
          <div className="p-8 pt-0">
             <Button variant="primary" className="w-full h-12 uppercase tracking-widest text-[10px] font-bold" onClick={onClose}>CLOSE REPORT</Button>
          </div>
       </motion.div>
    </div>
  );
};

export default RevenueSettlementModal;
