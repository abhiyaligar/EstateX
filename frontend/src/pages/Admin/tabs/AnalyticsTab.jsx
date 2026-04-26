import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const AnalyticsTab = ({ macroList, onNew, onEdit, onDelete }) => {
  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <Card noPadding>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Macro Analytics Nodes</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Global Market Intelligence Database</p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="text-[10px] h-10 px-6 font-bold tracking-widest"
            onClick={onNew}
          >
            <Plus size={16} className="mr-2" /> NEW NODE
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                <th className="p-6 md:p-8">Pincode</th>
                <th className="p-6 md:p-8">YoY Growth</th>
                <th className="p-6 md:p-8">Rental Yield</th>
                <th className="p-6 md:p-8">Demand</th>
                <th className="p-6 md:p-8">Last Updated</th>
                <th className="p-6 md:p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {macroList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">No analytics nodes initialized.</td>
                </tr>
              ) : macroList.map(macro => (
                <tr key={macro.pincode} className="border-b border-white/5 hover:bg-white/[0.01]">
                  <td className="p-6 md:p-8">
                    <span className="font-mono text-sm text-white font-bold">{macro.pincode}</span>
                  </td>
                  <td className="p-6 md:p-8">
                    <span className="text-sm font-bold text-green-500">+{macro.yoy_growth_percentage}%</span>
                  </td>
                  <td className="p-6 md:p-8">
                    <span className="text-sm font-bold text-sky-400">{macro.avg_rental_yield}%</span>
                  </td>
                  <td className="p-6 md:p-8">
                    <div className="flex items-center gap-3">
                       <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${macro.demand_score}%` }}></div>
                       </div>
                       <span className="text-sm font-bold text-violet-500">{macro.demand_score}/100</span>
                    </div>
                  </td>
                  <td className="p-6 md:p-8">
                    <span className="text-xs text-white/30">{new Date(macro.last_updated).toLocaleString()}</span>
                  </td>
                  <td className="p-6 md:p-8 text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(macro)}
                    >
                      <Edit2 size={14} className="text-white/40 hover:text-white" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onDelete(macro.pincode)}
                    >
                      <Trash size={14} className="text-red-500/40 hover:text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnalyticsTab;
