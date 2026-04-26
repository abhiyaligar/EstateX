import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Shield } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableCell, AdminStatusBadge } from '../components/AdminTable';

const KYCTab = ({ kycApps, onClaim, onReview, onRefresh, onImageClick, currentUser }) => {
  const columns = [
    { label: 'Subject' },
    { label: 'Full Name' },
    { label: 'Identifiers' },
    { label: 'Documents' },
    { label: 'Assignment' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <motion.div 
       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
       className="space-y-6"
    >
      <Card noPadding className="overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">KYC Verification Queue</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Documents requiring manual review</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="text-[10px] tracking-widest">REFRESH FEED</Button>
        </div>
        
        <AdminTable>
          <AdminTableHeader columns={columns} />
          <tbody>
            {kycApps.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-32 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <Shield size={48} />
                      <p className="text-xs uppercase tracking-[0.4em] font-bold">Protocol Clear: No Pending Identities</p>
                   </div>
                </td>
              </tr>
            ) : kycApps.map(app => (
              <AdminTableRow key={app.id}>
                <AdminTableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">
                      {app.user_id.substring(0, 12)}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono">NODE_UID: {app.id.substring(0,8)}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-bold text-white uppercase text-xs tracking-tight">{app.full_name || 'Anonymous Node'}</span>
                </AdminTableCell>
                <AdminTableCell>
                   <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/20 uppercase font-bold w-12">PAN</span>
                        <span className="text-[10px] text-white/60 font-mono tracking-widest">{app.pan_number || '---'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/20 uppercase font-bold w-12">UIDAI</span>
                        <span className="text-[10px] text-white/60 font-mono tracking-widest">**** **** {app.aadhaar_last_4_digits || '----'}</span>
                     </div>
                   </div>
                </AdminTableCell>
                <AdminTableCell>
                   <div className="flex gap-2">
                     {app.pan_image_url && (
                       <button 
                        onClick={() => onImageClick(app.pan_image_url, 'PAN CARD')} 
                        className="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/50 transition-all rounded-lg group"
                        title="View PAN"
                       >
                         <FileCheck size={16} className="text-white/20 group-hover:text-primary-500" />
                       </button>
                     )}
                     {app.aadhaar_front_url && (
                       <button 
                        onClick={() => onImageClick(app.aadhaar_front_url, 'AADHAAR FRONT')} 
                        className="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/50 transition-all rounded-lg group"
                        title="View Aadhaar"
                       >
                         <FileCheck size={16} className="text-white/20 group-hover:text-primary-500" />
                       </button>
                     )}
                   </div>
                </AdminTableCell>
                <AdminTableCell>
                   {app.assigned_admin_id ? (
                     <div className="flex items-center gap-2 bg-primary-500/5 border border-primary-500/10 px-3 py-1.5 rounded-full w-fit">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                       <span className="text-[9px] text-primary-500 font-bold uppercase tracking-widest">In Review</span>
                     </div>
                   ) : (
                     <AdminStatusBadge type="warning">Queue</AdminStatusBadge>
                   )}
                </AdminTableCell>
                <AdminTableCell align="right">
                   {!app.assigned_admin_id ? (
                     <Button variant="outline" className="text-[9px] tracking-[0.2em] h-9 px-6 font-bold" onClick={() => onClaim(app.id)}>CLAIM NODE</Button>
                   ) : app.assigned_admin_id === currentUser.id ? (
                     <div className="flex justify-end gap-2">
                       <Button variant="danger" className="text-[9px] h-9 px-4 font-bold tracking-widest" onClick={() => onReview(app.id, 'rejected')}>REJECT</Button>
                       <Button variant="primary" className="text-[9px] h-9 px-4 font-bold tracking-widest" onClick={() => onReview(app.id, 'approved')}>APPROVE</Button>
                     </div>
                   ) : (
                     <span className="text-[9px] text-white/20 italic uppercase tracking-[0.2em] font-bold">LOCKED BY OTHER</span>
                   )}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      </Card>
    </motion.div>
  );
};

export default KYCTab;
