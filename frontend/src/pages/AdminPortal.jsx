import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  FileCheck, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Eye, 
  Lock, 
  Unlock,
  AlertTriangle,
  Zap,
  ChevronRight,
  TrendingUp,
  Search,
  MapPin,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import adminService from '../services/adminService';
import propertyService from '../services/propertyService';

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <CardDescription className="uppercase tracking-widest text-[10px] mb-1">{title}</CardDescription>
        <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
      </div>
    </Card>
  );
};

const MilestonesModal = ({ isOpen, onClose, project, onVerify }) => {
  if (!isOpen || !project) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-4xl w-full bg-[#0a0a0a] border-white/10 max-h-[90vh] overflow-hidden flex flex-col p-0">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{project.title}</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] mt-2">Construction Progress & Milestone Verification</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
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
                 <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="p-6 md:p-8 font-mono text-xs text-white/40">{m.milestone_number}</td>
                    <td className="p-6 md:p-8">
                       <span className="text-sm text-white font-medium block max-w-sm">{m.description}</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className="text-sm font-bold text-white bg-white/5 px-2 py-1 border border-white/10">{m.release_percentage}%</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className="text-xs text-white/40">{m.target_date ? new Date(m.target_date).toLocaleDateString() : 'TBD'}</span>
                    </td>
                    <td className="p-6 md:p-8">
                       <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                         m.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                         m.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                         'bg-white/10 text-white/30 border-white/10'
                       }`}>
                         {m.status}
                       </span>
                    </td>
                    <td className="p-6 md:p-8 text-right">
                       {m.status !== 'completed' && (
                         <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] text-white/40 font-mono">PAYOUT: ₹{((m.release_percentage / 100) * (project.funding_raised || 0)).toLocaleString()}</span>
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

const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
        <p className="text-white/40 uppercase tracking-[0.3em] text-xs mb-8">{title}</p>
        <img 
          src={imageUrl} 
          alt={title} 
          className="max-w-full max-h-[80vh] object-contain shadow-2xl border border-white/10" 
        />
        <div className="mt-8 flex gap-4">
           <Button variant="ghost" onClick={() => window.open(imageUrl, '_blank')}>
             <ExternalLink size={16} className="mr-2" /> Open in New Tab
           </Button>
        </div>
      </div>
    </div>
  );
};
const ProjectReviewModal = ({ isOpen, onClose, project, onIPOAction, onHaltAction }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-5xl w-full bg-[#0a0a0a] border-white/10 max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <CardHeader className="border-b border-white/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{project.title}</CardTitle>
            <div className="flex gap-4 mt-2">
                <span className="uppercase tracking-[0.2em] text-[10px] text-white/40">Project ID: {project.id}</span>
                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                    project.ipo_status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    project.ipo_status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    'bg-white/10 text-white/40 border-white/10'
                    }`}>
                    {project.ipo_status}
                </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             {project.ipo_status === 'upcoming' && (
               <Button size="sm" className="bg-white text-black hover:bg-white/90 text-[10px] h-10 px-6 font-bold tracking-widest" onClick={() => onIPOAction(project.id, 'approve')}>APPROVE IPO</Button>
             )}
             {project.ipo_status === 'active' && (
               <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] h-10 px-6 font-bold tracking-widest" onClick={() => onIPOAction(project.id, 'complete')}>COMPLETE IPO</Button>
             )}
             <Button 
                size="sm" 
                variant={project.status === 'halted' ? 'primary' : 'danger'} 
                className="text-[10px] h-10 px-6 font-bold tracking-widest" 
                onClick={() => onHaltAction(project.id, project.status)}
             >
                {project.status === 'halted' ? 'RESUME TRADING' : 'HALT PROJECT'}
             </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-8 space-y-10">
          {/* Main Grid: Identity + Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Identity Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/10 pb-2 mb-4">Asset Identification</h4>
                <p className="text-sm text-white/70 leading-relaxed mb-6">{project.description}</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Category</span>
                        <span className="block text-white font-bold uppercase">{project.type || 'N/A'}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Dimensions</span>
                        <span className="block text-white font-bold uppercase">{(project.location?.area || 'N/A')} SQ. FT.</span>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/10 pb-2 mb-4">Geographical Node</h4>
                <div className="p-4 bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-white/20" />
                        <span className="text-sm text-white/80">{project.location?.address}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[10px] uppercase tracking-widest pt-3 border-t border-white/5">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/20">City</span>
                            <span className="text-white font-bold">{project.location?.city}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/20">State</span>
                            <span className="text-white font-bold">{project.location?.state}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/20">Pincode</span>
                            <span className="text-white font-bold font-mono">{project.location?.pincode}</span>
                        </div>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/10 pb-2 mb-4">Compliance Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'RERA APPROVAL', status: project.compliance?.rera_approved },
                        { label: 'ENV CLEARANCE', status: project.compliance?.environmental_clearance },
                        { label: 'ASSET INSURANCE', status: project.compliance?.insurance_coverage }
                    ].map(item => (
                        <div key={item.label} className={`p-4 border ${item.status ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-white/[0.02] border-white/5 text-white/20'}`}>
                            <div className="flex items-center gap-3">
                                {item.status ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                                <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Financial Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="p-6 bg-white/[0.03] border border-white/10 space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Financial Node</h4>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Market Valuation</span>
                        <span className="text-2xl font-bold tracking-tighter text-white">₹{project.financial?.total_budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                        <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${(project.financial?.funding_raised / project.financial?.total_budget) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[9px] uppercase tracking-widest">
                        <span className="text-green-500 font-bold">RAISED: ₹{project.financial?.funding_raised?.toLocaleString() || 0}</span>
                        <span className="text-white/20">TARGET: 100%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Brick Supply</span>
                        <span className="block text-white font-bold font-mono">{project.financial?.total_bricks?.toLocaleString() || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Escrow Held</span>
                        <span className="block text-white font-bold font-mono text-amber-500">₹{project.financial?.total_escrow_held?.toLocaleString() || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">Face Value</span>
                        <span className="block text-white font-bold font-mono">₹{project.financial?.face_value || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-white/20">IPO Price</span>
                        <span className="block text-white font-bold font-mono text-green-500">₹{project.financial?.ipo_price || 0}</span>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/10 pb-2 mb-4">Node Origin</h4>
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 group cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-white uppercase block">{project.builder?.company_name}</span>
                        <span className="text-[9px] uppercase tracking-widest text-white/20">Verified Builder Node</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Board */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/10 pb-2 mb-6">Asset Visual Board</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.images?.length > 0 ? (
                    project.images.map((img, idx) => (
                        <div key={idx} className="aspect-video bg-white/5 border border-white/10 group overflow-hidden relative">
                             <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/20">IMAGE {idx + 1}</div>
                             {/* In a real app, img would be a URL */}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-white/20">No images provided for this asset</p>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BuilderReviewModal = ({ isOpen, onClose, builder, onVerify, rejectionReason, setRejectionReason }) => {
  if (!isOpen || !builder) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-4xl w-full bg-[#0a0a0a] border-white/10 max-h-[90vh] overflow-hidden flex flex-col p-0">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{builder.company_name}</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] mt-2">Accreditation Node Review: {builder.id}</CardDescription>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-8 space-y-8">
          {/* Company Profile Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Business Identity</h4>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: builder.business_type },
                  { label: 'CIN', value: builder.company_registration_number },
                  { label: 'PAN', value: builder.pan_number },
                  { label: 'GST', value: builder.gst_number },
                  { label: 'Established', value: builder.year_established },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/20 uppercase">{item.label}</span>
                    <span className="font-mono text-white/80">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Compliance Matrix</h4>
              <div className="space-y-3">
                {[
                  { label: 'RERA ID', value: builder.rera_registration_number },
                  { label: 'City', value: builder.headquarters_city },
                  { label: 'State', value: builder.headquarters_state },
                  { label: 'Pincode', value: builder.headquarters_pincode },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/20 uppercase">{item.label}</span>
                    <span className="font-mono text-white/80">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Evidence Area */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Digital Asset Board</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Reg Certificate', url: builder.reg_cert_url },
                { label: 'RERA Cert', url: builder.rera_cert_url },
                { label: 'Balance Sheet', url: builder.balance_sheet_url },
                { label: 'IT Returns', url: builder.it_returns_url },
                { label: 'Bank Stmts', url: builder.bank_statements_url },
              ].map(doc => (
                <div key={doc.label} className="p-4 bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 mb-3">{doc.label}</span>
                  {doc.url ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[9px] h-8 border border-white/10"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      VIEW RAW ASSET
                    </Button>
                  ) : (
                    <span className="text-[9px] text-white/10 uppercase italic">Not Provided</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Node Area */}
          <div className="p-6 bg-white/[0.02] border border-white/10">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Financial Settlement Node</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase tracking-widest">
              <div>
                <span className="block text-white/20 mb-1">Bank</span>
                <span className="text-white font-bold">{builder.bank_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">Account</span>
                <span className="text-white font-bold font-mono">{builder.bank_account_number || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">Beneficiary</span>
                <span className="text-white font-bold">{builder.bank_account_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">IFSC</span>
                <span className="text-white font-bold font-mono">{builder.bank_ifsc_code || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Decision Matrix */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Audit Comments / Rejection Reasoning</label>
              <textarea 
                className="w-full bg-[#050505] border border-white/10 p-4 text-xs font-mono text-white focus:border-primary-500 outline-none min-h-[100px]"
                placeholder="Required for 'Rejection' or 'Revision Request'..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="danger" 
                className="h-14 text-[10px] tracking-widest"
                onClick={() => onVerify(builder.id, 'rejected')}
                disabled={!rejectionReason}
              >
                SUSPEND (REJECT)
              </Button>
              <Button 
                variant="outline" 
                className="h-14 text-[10px] tracking-widest border-blue-500/50 text-blue-400"
                onClick={() => onVerify(builder.id, 'revision_required')}
                disabled={!rejectionReason}
              >
                REQUEST REVISION
              </Button>
              <Button 
                variant="primary" 
                className="h-14 text-[10px] tracking-widest"
                onClick={() => onVerify(builder.id, 'approved')}
              >
                ACCREDIT NODE (APPROVE)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Main Page ---

const AdminPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [stats, setStats] = useState(null);
  const [kycApps, setKycApps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingBuilders, setPendingBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // UI State
  const [targetUserId, setTargetUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [modalImage, setModalImage] = useState({ open: false, url: '', title: '' });
  const [selectedMilestoneProject, setSelectedMilestoneProject] = useState(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Better error handling for individual requests to prevent entire page failure
        const [statsData, kycData, projectsData, pendingBuildersData] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getKYCApplications('all'),
          propertyService.getProperties('all'),
          adminService.getPendingBuilders()
        ]);
        
        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (kycData.status === 'fulfilled') setKycApps(kycData.value.items);
        if (projectsData.status === 'fulfilled') setProjects(projectsData.value);
        if (pendingBuildersData.status === 'fulfilled') setPendingBuilders(pendingBuildersData.value);
        
      } catch (err) {
        console.error("Admin fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshKYC = async () => {
    const data = await adminService.getKYCApplications('all');
    setKycApps(data.items);
  };

  const refreshStats = async () => {
    const data = await adminService.getDashboardStats();
    setStats(data);
  };

  const handleClaimKYC = async (id) => {
    try {
      await adminService.claimKYC(id);
      refreshKYC();
    } catch (err) { alert(err.response?.data?.detail || "Claim failed"); }
  };

  const handleReviewKYC = async (id, status) => {
    const reason = status === 'rejected' ? prompt("Enter rejection reason:") : null;
    if (status === 'rejected' && !reason) return;
    
    try {
      await adminService.reviewKYC(id, { status, rejection_reason: reason });
      refreshKYC();
    } catch (err) { alert(err.response?.data?.detail || "Review failed"); }
  };


  const handleWalletAdjust = async (e) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to adjust wallet for user ${targetUserId} by ${walletAmount} INR?`)) return;
    
    try {
      await adminService.adjustWallet(targetUserId, { 
        amount: parseFloat(walletAmount), 
        reason: walletReason 
      });
      alert("Wallet adjusted successfully");
      setTargetUserId('');
      setWalletAmount('');
      setWalletReason('');
      refreshStats();
    } catch (err) { alert(err.response?.data?.detail || "Adjustment failed"); }
  };

  const handleIPOAction = async (projectId, action) => {
    const msg = action === 'approve' 
      ? "Approve this project IPO? Investors will be able to subscribe immediately." 
      : "Trigger IPO completion? This will unlock secondary market trading.";
    
    if (!confirm(msg)) return;

    try {
      if (action === 'approve') await adminService.approveIPO(projectId);
      else await adminService.triggerSecondaryMarket(projectId);
      
      const projectsData = await propertyService.getProperties('all');
      setProjects(projectsData);
      alert("Action executed successfully");
    } catch (err) { alert(err.response?.data?.detail || "Action failed"); }
  };

  const handleProjectHalt = async (projectId, currentStatus) => {
    const isHalted = currentStatus === 'halted';
    const msg = isHalted 
      ? "Resume trading and subscriptions for this project?" 
      : "STOP ALL TRADING? This will HALT the exchange for this project and CANCEL all active intents. This is an emergency action.";
    
    if (!confirm(msg)) return;

    try {
      await adminService.updateProjectStatus(projectId, { status: isHalted ? 'approved' : 'halted' });
      const projectsData = await propertyService.getProperties('all');
      setProjects(projectsData);
      alert(isHalted ? "Project resumed." : "Project HALTED and orders purged.");
    } catch (err) { alert(err.response?.data?.detail || "Status update failed"); }
  };

  const handleBuilderVerification = async (builderId, status) => {
    try {
      setLoading(true);
      await adminService.verifyBuilder(builderId, {
        status: status,
        rejection_reason: (status === 'rejected' || status === 'revision_required') ? rejectionReason : null
      });
      const builders = await adminService.getPendingBuilders();
      setPendingBuilders(builders);
      await refreshStats();
      setIsBuilderModalOpen(false);
      setRejectionReason("");
      alert(`Builder node ${status === 'approved' ? 'accredited' : status === 'rejected' ? 'suspended' : 'revision requested'}.`);
    } catch (error) {
      console.error("Verification failed", error);
      alert("Accreditation update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMilestones = async (project) => {
    try {
      setLoading(true);
      const detailedProject = await propertyService.getPropertyById(project.id);
      setSelectedMilestoneProject(detailedProject);
      setIsMilestoneModalOpen(true);
    } catch (err) {
      alert("Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMilestone = async (projectId, milestoneId) => {
    if (!confirm("Officially mark this milestone as COMPLETED? This action will update project records and potentially unlock locked capital.")) return;
    try {
      await adminService.verifyMilestone(projectId, milestoneId, { status: 'completed' });
      // Refresh the detailed view
      const detailedProject = await propertyService.getPropertyById(projectId);
      setSelectedMilestoneProject(detailedProject);
    } catch (err) {
      alert(err.response?.data?.detail || "Verification failed");
    }
  };

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-12 h-12 border-t-2 border-white animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-white/40" size={20} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Security Protocol Alpha</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase font-heading">
            Admin <span className="text-white/20">Portal</span>
          </h1>
          <p className="mt-3 text-sm text-white/40 max-w-xl leading-relaxed">
            Centralized ecosystem management console. Execute sensitive financial protocols, oversee identity verification, and regulate asset lifecycles.
          </p>
        </div>

        <div className="flex bg-[#111] p-1 border border-white/5 rounded-none overflow-hidden">
          {['dashboard', 'kyc', 'builders', 'projects', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[10px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-white text-black font-bold' 
                : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="blue" />
              <StatCard title="Active Builders" value={stats?.total_builders || 0} icon={Building2} color="purple" />
              <StatCard title="Pending KYC" value={stats?.kyc_pending_approvals || 0} icon={Clock} color="amber" />
              <StatCard title="Platform Escrow" value={`₹${(stats?.total_platform_escrow || 0).toLocaleString()}`} icon={Shield} color="red" />
              <StatCard title="Locked Assets" value={`₹${(stats?.total_investments_locked_inr || 0).toLocaleString()}`} icon={Lock} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <Card className="lg:col-span-8 flex flex-col justify-center min-h-[300px]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <TrendingUp className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">System Health</h3>
                      <p className="text-xs text-white/40 uppercase tracking-widest">All protocols operational</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-12 mt-4">
                     <div>
                       <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Active Projects</span>
                       <span className="text-4xl font-bold">{stats?.projects_active || 0}</span>
                     </div>
                     <div>
                       <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Completed Exits</span>
                       <span className="text-4xl font-bold">{stats?.projects_completed || 0}</span>
                     </div>
                     <div>
                       <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Admin Nodes</span>
                       <span className="text-4xl font-bold">{stats?.total_admins || 0}</span>
                     </div>
                  </div>
               </Card>
               <Card className="lg:col-span-4 bg-white/5 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center group transition-colors hover:bg-white/[0.07]">
                  <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="text-amber-500" size={32} />
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-tighter mb-2">Emergency Protocols</h4>
                  <p className="text-xs text-secondary-400 mb-6 leading-relaxed">Authorized admins can freeze the exchange globally in case of detected anomalies.</p>
                  <Button variant="outline" className="w-full text-amber-500 border-amber-500/20 hover:bg-amber-500/10">Global Freeze</Button>
               </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'kyc' && (
          <motion.div 
             key="kyc"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="space-y-6"
          >
            <Card noPadding>
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">KYC Verification Queue</h3>
                  <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Documents requiring manual review</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={refreshKYC}>REFRESH FEED</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="p-6 md:p-8">Subject</th>
                      <th className="p-6 md:p-8">Full Name</th>
                      <th className="p-6 md:p-8">Identifiers</th>
                      <th className="p-6 md:p-8">Documents</th>
                      <th className="p-6 md:p-8">Assignment</th>
                      <th className="p-6 md:p-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycApps.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">Queue clear. No pending applications.</td>
                      </tr>
                    ) : kycApps.map(app => (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="p-6 md:p-8">
                          <span className="block font-bold text-white uppercase text-sm mb-1">{app.user_id.substring(0, 8)}...</span>
                          <span className="text-[10px] text-white/30 font-mono block">REF: {app.id.substring(0,8)}</span>
                        </td>
                        <td className="p-6 md:p-8">
                          <span className="block font-bold text-white uppercase text-sm">{app.full_name || 'N/A'}</span>
                        </td>
                        <td className="p-6 md:p-8">
                           <div className="space-y-1">
                             <span className="text-[10px] text-white/40 block">PAN: {app.pan_number || '---'}</span>
                             <span className="text-[10px] text-white/40 block">AADHAAR: **** **** {app.aadhaar_last_4_digits || '----'}</span>
                           </div>
                        </td>
                        <td className="p-6 md:p-8">
                           <div className="flex gap-2">
                             {app.pan_image_url && (
                               <button onClick={() => setModalImage({ open: true, url: app.pan_image_url, title: 'PAN CARD' })} className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                 <FileCheck size={14} className="text-white/40" />
                               </button>
                             )}
                             {app.aadhaar_front_url && (
                               <button onClick={() => setModalImage({ open: true, url: app.aadhaar_front_url, title: 'AADHAAR FRONT' })} className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                 <FileCheck size={14} className="text-white/40" />
                               </button>
                             )}
                           </div>
                        </td>
                        <td className="p-6 md:p-8">
                           {app.assigned_admin_id ? (
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-500" />
                               <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Assigned</span>
                             </div>
                           ) : (
                             <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Unclaimed</span>
                           )}
                        </td>
                        <td className="p-6 md:p-8 text-right">
                           {!app.assigned_admin_id ? (
                             <Button size="sm" variant="outline" className="text-[10px] tracking-widest h-8" onClick={() => handleClaimKYC(app.id)}>CLAIM</Button>
                           ) : app.assigned_admin_id === user.id ? (
                             <div className="flex justify-end gap-2">
                               <Button size="sm" variant="danger" className="text-[10px] h-8" onClick={() => handleReviewKYC(app.id, 'rejected')}>REJECT</Button>
                               <Button size="sm" variant="primary" className="text-[10px] h-8" onClick={() => handleReviewKYC(app.id, 'approved')}>APPROVE</Button>
                             </div>
                           ) : (
                             <span className="text-[10px] text-white/20 italic">Under review</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div 
            key="projects"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <Card noPadding>
              <div className="p-8 border-b border-white/5">
                <h3 className="text-xl font-bold uppercase tracking-tight">Project Governance</h3>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Control asset lifecycle and match completion</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="p-6 md:p-8">Project Name</th>
                      <th className="p-6 md:p-8">Builder</th>
                      <th className="p-6 md:p-8">IPO Status</th>
                      <th className="p-6 md:p-8">Escrow Balance</th>
                      <th className="p-6 md:p-8">Market Control</th>
                      <th className="p-6 md:p-8 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">No projects available in the ecosystem.</td>
                      </tr>
                    ) : (
                      projects.map(p => (
                        <tr 
                          key={p.id} 
                          className="border-b border-white/5 hover:bg-white/[0.01] cursor-pointer"
                          onClick={() => { setSelectedProject(p); setIsProjectModalOpen(true); }}
                        >
                          <td className="p-6 md:p-8">
                            <div className="flex flex-col gap-1">
                                <span className="block font-bold text-white uppercase text-xs">{p.title}</span>
                                <div className="flex gap-2">
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.rera_approved ? 'text-green-500' : 'text-white/20'}`}>RERA</span>
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.environmental_clearance ? 'text-green-500' : 'text-white/20'}`}>ENV</span>
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${p.compliance?.insurance_coverage ? 'text-green-500' : 'text-white/20'}`}>INS</span>
                                </div>
                            </div>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className="block text-sm font-bold text-white uppercase">{p.builder?.company_name || 'UNKNOWN'}</span>
                            <span className="text-[10px] text-white/40">ID: {p.builder_id?.substring(0,8) || 'N/A'}...</span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                              p.ipo_status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              p.ipo_status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              'bg-white/10 text-white/40 border-white/10'
                            }`}>
                              {p.ipo_status}
                            </span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className="text-xs font-bold text-white">₹{(p.financial?.total_escrow_held || 0).toLocaleString()}</span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                              p.status === 'halted' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/40 border-white/10'
                            }`}>
                              {p.status || 'approved'}
                            </span>
                          </td>
                          <td className="p-6 md:p-8 text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                {p.ipo_status === 'upcoming' && (
                                  <Button size="sm" variant="primary" className="text-[10px] h-9" onClick={() => handleIPOAction(p.id, 'approve')}>APPROVE IPO</Button>
                                )}
                                {p.ipo_status === 'active' && (
                                  <Button size="sm" className="text-[10px] h-9 bg-blue-600 hover:bg-blue-700" onClick={() => handleIPOAction(p.id, 'complete')}>COMPLETE IPO</Button>
                                )}
                                {p.status === 'halted' ? (
                                  <Button size="sm" variant="primary" className="text-[10px] h-9 bg-green-600 hover:bg-green-700" onClick={() => handleProjectHalt(p.id, p.status)}>RESUME</Button>
                                ) : (
                                  <Button size="sm" variant="danger" className="text-[10px] h-9" onClick={() => handleProjectHalt(p.id, p.status)}>HALT</Button>
                                )}
                                <Button size="sm" variant="outline" className="text-[10px] h-9" onClick={() => handleOpenMilestones(p)}>MILESTONES</Button>
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
        )}

        {activeTab === 'builders' && (
          <motion.div 
            key="builders"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
             <Card noPadding>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tighter">Builder Verification Wall</h3>
                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Review and approve business credentials</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
                    Pending: {pendingBuilders.length}
                  </div>
                </div>
                
                <div className="p-8">
                   {pendingBuilders.length === 0 ? (
                      <div className="py-24 text-center border-2 border-dashed border-white/5">
                         <Building2 className="mx-auto mb-4 text-white/10" size={48} />
                         <p className="text-xs text-white/20 uppercase tracking-[0.3em]">No builders currently awaiting verification</p>
                      </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingBuilders.map(b => (
                          <div key={b.id} className="bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between group hover:border-white/20 transition-colors">
                             <div className="mb-6">
                               <div className="flex items-start justify-between mb-2">
                                 <h4 className="text-xl font-bold uppercase tracking-tight">{b.company_name}</h4>
                                 <span className="text-[10px] font-mono text-white/30">REF: {b.id.substring(0,8)}</span>
                               </div>
                               <div className="space-y-2">
                                 <div className="flex text-[10px] uppercase tracking-widest gap-2">
                                   <span className="text-white/30">REG NO:</span>
                                   <span className="text-white/60 font-mono">{b.company_registration_number || 'NOT PROVIDED'}</span>
                                 </div>
                                 <div className="flex text-[10px] uppercase tracking-widest gap-2">
                                   <span className="text-white/30">RERA:</span>
                                   <span className="text-white/60 font-mono">{b.rera_registration_number || 'NOT PROVIDED'}</span>
                                 </div>
                                 <div className="flex text-[10px] uppercase tracking-widest gap-2">
                                   <span className="text-white/30">BANK:</span>
                                   <span className="text-white/60 font-mono">{b.bank_name || 'PENDING'} - {b.bank_account_number || 'PENDING'}</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="flex gap-4 pt-6 border-t border-white/5">
                                <Button 
                                  variant="outline" 
                                  className="w-full h-12 text-[10px] font-bold tracking-widest"
                                  onClick={() => { setSelectedBuilder(b); setIsBuilderModalOpen(true); }}
                                >
                                  AUDIT ASSETS
                                </Button>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </Card>
          </motion.div>
        )}

        {activeTab === 'users' && (
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

                 <form onSubmit={handleWalletAdjust} className="space-y-6">
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
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
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
        )}
      </AnimatePresence>

       <BuilderReviewModal 
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        builder={selectedBuilder}
        onVerify={handleBuilderVerification}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
      />

      <ProjectReviewModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        project={selectedProject}
        onIPOAction={handleIPOAction}
        onHaltAction={handleProjectHalt}
      />

      <ImageModal 
        isOpen={modalImage.open} 
        onClose={() => setModalImage({ ...modalImage, open: false })} 
        imageUrl={modalImage.url} 
        title={modalImage.title} 
      />

      <MilestonesModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        project={selectedMilestoneProject}
        onVerify={handleVerifyMilestone}
      />
    </div>
  );
};

export default AdminPortal;
