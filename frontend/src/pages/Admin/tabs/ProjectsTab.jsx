import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableCell, AdminStatusBadge } from '../components/AdminTable';

const ProjectsTab = ({ projects, onProjectClick, onIPOAction, onHaltAction, onOpenMilestones }) => {
  const columns = [
    { label: 'Project Name' },
    { label: 'Builder' },
    { label: 'IPO Status' },
    { label: 'Escrow Balance' },
    { label: 'Market Control' },
    { label: 'Operational Actions', align: 'right' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
       <Card noPadding className="overflow-hidden">
        <div className="p-8 border-b border-border">
          <h3 className="text-xl font-bold uppercase tracking-tight">Project Governance</h3>
          <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest">Control asset lifecycle and match completion</p>
        </div>
        
        <AdminTable>
          <AdminTableHeader columns={columns} />
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-foreground/20 uppercase tracking-widest text-xs italic">No projects available in the ecosystem.</td>
              </tr>
            ) : (
              projects.map(p => (
                <AdminTableRow 
                  key={p.id} 
                  onClick={() => onProjectClick(p)}
                >
                  <AdminTableCell>
                    <div className="flex flex-col gap-1">
                        <span className="block font-bold text-foreground uppercase text-xs">{p.title}</span>
                        <div className="flex gap-2">
                            <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.rera_approved ? 'text-green-500' : 'text-foreground/20'}`}>RERA</span>
                            <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.environmental_clearance ? 'text-green-500' : 'text-foreground/20'}`}>ENV</span>
                            <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.insurance_coverage ? 'text-green-500' : 'text-foreground/20'}`}>INS</span>
                        </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="block text-sm font-bold text-foreground uppercase">{p.builder?.company_name || 'UNKNOWN'}</span>
                    <span className="text-[10px] text-foreground/40 font-mono">ID: {p.builder_id?.substring(0,8) || 'N/A'}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge type={p.ipo_status === 'active' ? 'success' : p.ipo_status === 'upcoming' ? 'warning' : 'default'}>
                      {p.ipo_status}
                    </AdminStatusBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="text-xs font-bold text-foreground font-mono">₹{(p.financial?.total_escrow_held || 0).toLocaleString()}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge type={p.status === 'halted' ? 'danger' : 'default'}>
                      {p.status || 'approved'}
                    </AdminStatusBadge>
                  </AdminTableCell>
                  <AdminTableCell align="right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {p.ipo_status === 'upcoming' && (
                          <Button size="sm" variant="primary" className="text-[10px] h-9 px-4 font-bold" onClick={() => onIPOAction(p.id, 'approve')}>APPROVE IPO</Button>
                        )}
                        {p.ipo_status === 'active' && (
                          <Button size="sm" className="text-[10px] h-9 px-4 bg-blue-600 hover:bg-blue-700 text-foreground font-bold" onClick={() => onIPOAction(p.id, 'complete')}>COMPLETE IPO</Button>
                        )}
                        {p.status === 'halted' ? (
                          <Button size="sm" variant="primary" className="text-[10px] h-9 px-4 bg-green-600 hover:bg-green-700 text-foreground font-bold" onClick={() => onHaltAction(p.id, p.status)}>RESUME</Button>
                        ) : (
                          <Button size="sm" variant="danger" className="text-[10px] h-9 px-4 font-bold" onClick={() => onHaltAction(p.id, p.status)}>HALT</Button>
                        )}
                        <Button size="sm" variant="outline" className="text-[10px] h-9 px-4 font-bold" onClick={() => onOpenMilestones(p)}>MILESTONES</Button>
                      </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>
    </motion.div>
  );
};

export default ProjectsTab;
