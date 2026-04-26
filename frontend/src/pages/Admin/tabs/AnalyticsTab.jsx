import React from 'react';
import { motion } from 'framer-motion';
import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableCell, AdminStatusBadge } from '../components/AdminTable';
import { Database, TrendingUp, Activity, BarChart3, Plus, Edit2, Trash } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const AnalyticsTab = ({ macroList, onNew, onEdit, onDelete }) => {
  const columns = [
    { label: 'Geo Node' },
    { label: 'Growth Vector' },
    { label: 'Yield Ratio' },
    { label: 'Market Demand' },
    { label: 'Last Sync' },
    { label: 'Control', align: 'right' }
  ];

  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <Card noPadding className="overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white">Macro Intelligence Nodes</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Global Market Telemetry Database</p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="text-[10px] h-11 px-8 font-bold tracking-[0.2em]"
            onClick={onNew}
          >
            <Plus size={16} className="mr-2" /> NEW NODE
          </Button>
        </div>

        <AdminTable>
          <AdminTableHeader columns={columns} />
          <tbody>
            {macroList.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-32 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <Database size={48} />
                      <p className="text-xs uppercase tracking-[0.4em] font-bold text-white">Registry Empty: No Intelligence Nodes</p>
                   </div>
                </td>
              </tr>
            ) : macroList.map(macro => (
              <AdminTableRow key={macro.pincode}>
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-500/10 border border-primary-500/20 rounded-lg flex items-center justify-center text-primary-500">
                       <Activity size={16} />
                    </div>
                    <span className="font-mono text-xs text-white font-bold tracking-widest">{macro.pincode}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-500/60" />
                    <span className="text-xs font-bold text-green-500">+{macro.yoy_growth_percentage}%</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-sky-400/60" />
                    <span className="text-xs font-bold text-sky-400">{macro.avg_rental_yield}%</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-4 w-40">
                     <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${macro.demand_score}%` }}
                          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                        />
                     </div>
                     <span className="text-[10px] font-bold text-violet-400 font-mono">{macro.demand_score}%</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[10px] text-white/30 uppercase font-medium">
                    {new Date(macro.last_updated).toLocaleDateString()}
                  </span>
                </AdminTableCell>
                <AdminTableCell align="right">
                   <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 p-0 hover:bg-white/5"
                      onClick={() => onEdit(macro)}
                      title="Edit Node"
                    >
                      <Edit2 size={16} className="text-white/20 hover:text-white transition-colors" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 p-0 hover:bg-red-500/10"
                      onClick={() => onDelete(macro.pincode)}
                      title="Delete Node"
                    >
                      <Trash size={16} className="text-red-500/20 hover:text-red-500 transition-colors" />
                    </Button>
                   </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      </Card>
    </motion.div>
  );
};

export default AnalyticsTab;
