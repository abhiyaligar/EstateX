import React from 'react';
import { motion } from 'framer-motion';
import { Search, Wallet } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const UsersTab = ({ targetUserId, setTargetUserId, walletAmount, setWalletAmount, walletReason, setWalletReason, onAdjust }) => {
  return (
    <motion.div 
      key="users"
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className="grid grid-cols-1 gap-6"
    >
      <Card>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-500">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Wallet Adjustment</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Direct balance manipulation</p>
            </div>
          </div>

          <form onSubmit={onAdjust} className="space-y-6">
            <Input 
              label="User ID" 
              placeholder="Paste User GUID" 
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              icon={Search}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Amount (INR)" 
                placeholder="e.g. 5000" 
                type="number"
                value={Math.abs(walletAmount)}
                onChange={(e) => setWalletAmount(parseFloat(e.target.value) * (walletAmount < 0 ? -1 : 1))}
              />
              <div className="flex flex-col">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">Direction</label>
                <div className="flex h-12 bg-[#111] border border-white/5 p-1">
                  <button type="button" onClick={() => setWalletAmount(Math.abs(walletAmount))} className={`flex-1 text-[10px] font-bold ${walletAmount >= 0 ? 'bg-white text-black' : 'text-white/40'}`}>CREDIT</button>
                  <button type="button" onClick={() => setWalletAmount(-Math.abs(walletAmount))} className={`flex-1 text-[10px] font-bold ${walletAmount < 0 ? 'bg-red-500 text-white' : 'text-white/40'}`}>DEBIT</button>
                </div>
              </div>
            </div>
            <Input 
              label="Reason for Adjustment" 
              placeholder="e.g. Manual Wire Deposit" 
              value={walletReason}
              onChange={(e) => setWalletReason(e.target.value)}
            />
            <div className="pt-4 border-t border-white/5">
              <Button type="submit" variant="danger" className="w-full h-14 text-[10px] tracking-[0.2em]">EXECUTE ADJUSTMENT</Button>
              <p className="mt-4 text-[9px] text-white/20 uppercase text-center leading-relaxed">Warning: This action is recorded in the immutable audit log and cannot be reversed by standard logic.</p>
            </div>
          </form>
      </Card>
    </motion.div>
  );
};

export default UsersTab;
