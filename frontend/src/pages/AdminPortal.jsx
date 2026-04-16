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
  Search
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

// --- Main Page ---

const AdminPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [stats, setStats] = useState(null);
  const [kycApps, setKycApps] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // UI State
  const [targetUserId, setTargetUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [modalImage, setModalImage] = useState({ open: false, url: '', title: '' });
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, kycData, projectsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getKYCApplications('all'),
          propertyService.getProperties('all')
        ]);
        setStats(statsData);
        setKycApps(kycData.items);
        setProjects(projectsData);
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
          {['dashboard', 'kyc', 'projects', 'users'].map((tab) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="blue" />
              <StatCard title="Active Builders" value={stats?.total_builders || 0} icon={Building2} color="purple" />
              <StatCard title="Pending KYC" value={stats?.kyc_pending_approvals || 0} icon={Clock} color="amber" />
              <StatCard title="Locked Assets (INR)" value={`₹${(stats?.total_investments_locked_inr || 0).toLocaleString()}`} icon={Lock} color="green" />
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
                          <span className="block font-bold text-white uppercase text-sm mb-1">{app.user_id}</span>
                          <span className="text-[10px] text-white/30 font-mono block">REF: {app.id.substring(0,8)}</span>
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
                      <th className="p-6 md:p-8">Lifecycle</th>
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
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <td className="p-6 md:p-8">
                            <span className="block font-bold text-white uppercase text-sm mb-1">{p.title}</span>
                            <span className="text-[10px] text-white/40">ID: {p.id?.substring(0,8) || 'N/A'}</span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className="text-xs text-white/60">ID: {p.builder_id?.substring(0,8) || 'N/A'}...</span>
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
                            <span className="text-xs text-white/60 uppercase">{p.lifecycle_status}</span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                              p.status === 'halted' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/40 border-white/10'
                            }`}>
                              {p.status || 'approved'}
                            </span>
                          </td>
                          <td className="p-6 md:p-8 text-right">
                             <div className="flex justify-end gap-2">
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
                               <Button size="sm" variant="outline" className="text-[10px] h-9" onClick={() => alert("Milestone verification view not implemented yet")}>MILESTONES</Button>
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

        {activeTab === 'users' && (
           <motion.div 
            key="users"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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

              <Card className="flex flex-col items-center justify-center border-dashed border-white/10 bg-white/[0.02]">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
                   <Building2 size={40} />
                 </div>
                 <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Builder Verification</h3>
                 <p className="text-xs text-secondary-500 uppercase tracking-widest mb-8">Pending Profile Reviews: 0</p>
                 <Button variant="outline" disabled className="w-full max-w-xs">Enter Review Chamber</Button>
              </Card>
           </motion.div>
        )}
      </AnimatePresence>

      <ImageModal 
        isOpen={modalImage.open} 
        onClose={() => setModalImage({ ...modalImage, open: false })} 
        imageUrl={modalImage.url} 
        title={modalImage.title} 
      />
    </div>
  );
};

export default AdminPortal;
