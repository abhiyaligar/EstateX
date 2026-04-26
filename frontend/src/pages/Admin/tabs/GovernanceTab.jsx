import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableCell, AdminStatusBadge } from '../components/AdminTable';

const GovernanceTab = ({ proposalsList, projects, onNew, onStatusUpdate }) => {
  const columns = [
    { label: 'Protocol Asset' },
    { label: 'Proposal Intent' },
    { label: 'Status' },
    { label: 'Weighting' },
    { label: 'Expiration' },
    { label: 'Execution', align: 'right' }
  ];

  return (
    <motion.div 
      key="governance"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <Card noPadding className="overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Governance Control</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Execute Decentralized Consensus Decisions</p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="text-[10px] h-11 px-8 font-bold tracking-[0.2em]"
            onClick={onNew}
          >
            <Plus size={16} className="mr-2" /> NEW PROPOSAL
          </Button>
        </div>

        <AdminTable>
          <AdminTableHeader columns={columns} />
          <tbody>
            {proposalsList.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-32 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <Gavel size={48} />
                      <p className="text-xs uppercase tracking-[0.4em] font-bold">Consensus Idle: No Active Motions</p>
                   </div>
                </td>
              </tr>
            ) : proposalsList.map(p => {
                const proj = projects.find(pj => pj.id === p.project_id);
                return (
                  <AdminTableRow key={p.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/20">
                           <Building2 size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">{proj?.title || 'Unknown Protocol'}</span>
                          <span className="text-[9px] text-white/30 font-mono">ID: {p.project_id.substring(0,8)}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1 max-w-[240px]">{p.title}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge type={
                        p.status === 'active' ? 'primary' : 
                        p.status === 'closed' ? 'warning' : 
                        'success'
                      }>
                        {p.status}
                      </AdminStatusBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                       <div className="flex flex-col">
                         <span className="font-mono text-xs font-bold text-white tracking-tighter">{p.total_votes.toLocaleString()}</span>
                         <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">BRICKS VOTE</span>
                       </div>
                    </AdminTableCell>
                    <AdminTableCell>
                       <span className="text-[10px] text-white/50 font-medium">
                          {new Date(p.end_date).toLocaleDateString()}
                          <span className="block text-[8px] opacity-50 mt-0.5">{new Date(p.end_date).toLocaleTimeString()}</span>
                       </span>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                       {p.status === 'active' && (
                         <Button 
                           variant="outline" 
                           className="text-[9px] h-9 px-4 font-bold tracking-widest"
                           onClick={() => onStatusUpdate(p.id, 'closed')}
                         >
                           HALT VOTING
                         </Button>
                       )}
                       {p.status === 'closed' && (
                         <Button 
                           variant="primary" 
                           className="text-[9px] h-9 px-4 font-bold tracking-widest"
                           onClick={() => {
                              const winnerIndex = p.vote_distribution.indexOf(Math.max(...p.vote_distribution));
                              onStatusUpdate(p.id, 'executed', winnerIndex);
                           }}
                         >
                           EXECUTE
                         </Button>
                       )}
                       {p.status === 'executed' && (
                         <div className="flex items-center justify-end gap-2 text-green-500/60">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">ENFORCED</span>
                         </div>
                       )}
                    </AdminTableCell>
                  </AdminTableRow>
                );
            })}
          </tbody>
        </AdminTable>
      </Card>
    </motion.div>
  );
};

export default GovernanceTab;
