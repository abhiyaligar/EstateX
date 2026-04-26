import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const RevenueTab = ({ pendingSettlements, projects, onInfuse, onReject, onSettle }) => {
  return (
    <motion.div 
      key="revenue"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card noPadding>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Revenue Settlement Center</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Approve monthly rental distributions & manage 1% platform fees</p>
          </div>
          <Button variant="outline" className="text-[10px] h-10 px-6 font-bold tracking-widest border-green-500/20 text-green-500" onClick={onInfuse}>INFUSE MANUALLY</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                <th className="p-6 md:p-8">Asset & Period</th>
                <th className="p-6 md:p-8">Gross Deposit</th>
                <th className="p-6 md:p-8">Platform Fee (1%)</th>
                <th className="p-6 md:p-8">Net Distribution</th>
                <th className="p-6 md:p-8">Status</th>
                <th className="p-6 md:p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingSettlements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">No pending revenue cycles awaiting settlement.</td>
                </tr>
              ) : (
                pendingSettlements.map(cycle => (
                  <tr key={cycle.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="p-6 md:p-8">
                      <span className="block font-bold text-white uppercase text-xs">{projects.find(p => p.id === cycle.project_id)?.title || 'PROJECT'}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(cycle.year, cycle.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </td>
                    <td className="p-6 md:p-8 font-mono text-sm">₹{parseFloat(cycle.gross_amount).toLocaleString()}</td>
                    <td className="p-6 md:p-8 font-mono text-sm text-amber-500">₹{parseFloat(cycle.fee_amount).toLocaleString()}</td>
                    <td className="p-6 md:p-8 font-mono text-sm text-green-500">₹{parseFloat(cycle.net_amount).toLocaleString()}</td>
                    <td className="p-6 md:p-8">
                      <span className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">AWAITING APPROVAL</span>
                    </td>
                    <td className="p-6 md:p-8 text-right">
                       <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-[10px] h-9 px-6 font-bold tracking-widest border-red-500/20 text-red-500 hover:bg-red-500/5" onClick={() => onReject(cycle.id)}>REJECT</Button>
                          <Button size="sm" variant="primary" className="text-[10px] h-9 px-6 font-bold tracking-widest" onClick={() => onSettle(cycle.id)}>APPROVE & SETTLE</Button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default RevenueTab;
