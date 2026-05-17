import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const MilestonesModal = ({ isOpen, onClose, project, onVerify }) => {
  if (!isOpen || !project) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-4xl w-full bg-background border-border max-h-[90vh] overflow-hidden flex flex-col p-0">
        <CardHeader className="border-b border-border p-8">
          <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{project.title}</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] mt-2">Construction Progress & Milestone Verification</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-foreground/30">
                 <th className="p-6 md:p-8">#</th>
                 <th className="p-6 md:p-8">Description</th>
                 <th className="p-6 md:p-8">Release %</th>
                 <th className="p-6 md:p-8">Target Date</th>
                 <th className="p-6 md:p-8">Status</th>
                 <th className="p-6 md:p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
               {project.milestones?.sort((a,b) => a.milestone_number - b.milestone_number).map((m) => (
                 <tr key={m.id} className="border-b border-border hover:bg-foreground/[0.02]">
                    <td className="p-6 md:p-8 font-mono text-xs text-foreground/40">{m.milestone_number}</td>
                    <td className="p-6 md:p-8">
                       <span className="text-sm text-foreground font-medium block max-w-sm">{m.description}</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className="text-sm font-bold text-foreground bg-foreground/5 px-2 py-1 border border-border">{m.release_percentage}%</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className="text-xs text-foreground/40">{m.target_date ? new Date(m.target_date).toLocaleDateString() : 'TBD'}</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                         m.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                         m.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                         'bg-foreground/10 text-foreground/30 border-border'
                       }`}>
                         {m.status}
                       </span>
                    </td>
                    <td className="p-6 md:p-8 text-right">
                       {m.status !== 'completed' && (
                         <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] text-foreground/40 font-mono">PAYOUT: ₹{((m.release_percentage / 100) * (project.funding_raised || 0)).toLocaleString()}</span>
                           <Button 
                             size="sm" 
                             variant="primary" 
                             className="text-[10px] h-9 px-4 tracking-widest"
                             onClick={() => onVerify(project.id, m.id)}
                           >
                             VERIFY
                           </Button>
                         </div>
                       )}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestonesModal;
