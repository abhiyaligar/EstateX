import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const InfuseRevenueModal = ({ isOpen, onClose, projects, infuseForm, setInfuseForm, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
       <Card className="max-w-md w-full bg-[#0a0a0a] border-white/10 shadow-2xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xl font-bold uppercase tracking-tighter">Admin: Infuse Rental Yield</CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Directly inject rental income into the settlement queue</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Target Project</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary-500 outline-none"
                    value={infuseForm.project_id}
                    onChange={(e) => setInfuseForm({...infuseForm, project_id: e.target.value})}
                    required
                  >
                     <option value="">Select Asset...</option>
                     {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
               </div>
               <Input 
                 label="Infusion Amount (INR)" 
                 placeholder="e.g. 50000" 
                 type="number"
                 required
                 value={infuseForm.amount}
                 onChange={(e) => setInfuseForm({...infuseForm, amount: e.target.value})}
               />
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Month</label>
                     <select 
                       className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary-500 outline-none"
                       value={infuseForm.month}
                       onChange={(e) => setInfuseForm({...infuseForm, month: e.target.value})}
                     >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Year</label>
                     <Input 
                       type="number"
                       value={infuseForm.year}
                       onChange={(e) => setInfuseForm({...infuseForm, year: e.target.value})}
                     />
                  </div>
               </div>
               <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1 uppercase tracking-widest text-[10px]">Execute Infusion</Button>
               </div>
            </form>
          </CardContent>
       </Card>
    </div>
  );
};

export default InfuseRevenueModal;
