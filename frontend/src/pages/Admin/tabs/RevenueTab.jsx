import React from 'react';
import { motion } from 'framer-motion';
import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableCell, AdminStatusBadge } from '../components/AdminTable';
import { CircleDollarSign, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const RevenueTab = ({ pendingSettlements, projects, onInfuse, onReject, onSettle }) => {
  const columns = [
    { label: 'Settlement Node' },
    { label: 'Gross Deposit' },
    { label: 'Network Fee' },
    { label: 'Net Yield' },
    { label: 'Lifecycle' },
    { label: 'Consensus', align: 'right' }
  ];

  return (
    <motion.div 
      key="revenue"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card noPadding className="overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white">Treasury Settlement Center</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Execute monthly distributions & protocol fee harvests</p>
          </div>
          <Button 
            variant="outline" 
            className="text-[10px] h-11 px-8 font-bold tracking-[0.2em] border-primary-500/20 text-primary-500 hover:bg-primary-500/5 transition-all" 
            onClick={onInfuse}
          >
            INFUSE PROTOCOL
          </Button>
        </div>

        <AdminTable>
          <AdminTableHeader columns={columns} />
          <tbody>
            {pendingSettlements.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-32 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <CircleDollarSign size={48} />
                      <p className="text-xs uppercase tracking-[0.4em] font-bold text-white">Treasury Balanced: No Pending Cycles</p>
                   </div>
                </td>
              </tr>
            ) : (
              pendingSettlements.map(cycle => (
                <AdminTableRow key={cycle.id}>
                  <AdminTableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">
                        {projects.find(p => p.id === cycle.project_id)?.title || 'Unknown Asset'}
                      </span>
                      <span className="text-[9px] text-white/30 uppercase tracking-[0.1em] font-mono">
                        PERIOD: {new Date(cycle.year, cycle.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="font-mono text-xs font-bold text-white">₹{parseFloat(cycle.gross_amount).toLocaleString()}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-amber-500/80">₹{parseFloat(cycle.fee_amount).toLocaleString()}</span>
                      <span className="text-[8px] text-white/20 uppercase font-bold">1% HARVEST</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="font-mono text-xs font-bold text-green-500">₹{parseFloat(cycle.net_amount).toLocaleString()}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge type="warning">Review</AdminStatusBadge>
                  </AdminTableCell>
                  <AdminTableCell align="right">
                     <div className="flex justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          className="text-[9px] h-9 px-4 font-bold tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all" 
                          onClick={() => onReject(cycle.id)}
                        >
                          PURGE
                        </Button>
                        <Button 
                          variant="primary" 
                          className="text-[9px] h-9 px-6 font-bold tracking-[0.1em] shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
                          onClick={() => onSettle(cycle.id)}
                        >
                          SETTLE CYCLE
                        </Button>
                     </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>

      {/* Audit Note */}
      <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
         <AlertCircle className="text-amber-500 shrink-0" size={20} />
         <p className="text-[10px] text-amber-500/60 uppercase tracking-widest leading-relaxed font-bold">
           Protocol Notice: Settlements are immutable once executed. Ensure the 1% platform fee aligns with current governance parameters before authorizing net distribution.
         </p>
      </div>
    </motion.div>
  );
};

export default RevenueTab;
