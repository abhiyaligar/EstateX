import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  CircleDollarSign, 
  BarChart3, 
  Gavel, 
  Users,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import propertyService from '../services/propertyService';
import governanceService from '../services/governanceService';
import revenueService from '../services/revenueService';

// Tabs
import DashboardTab from './Admin/tabs/DashboardTab';
import KYCTab from './Admin/tabs/KYCTab';
import BuildersTab from './Admin/tabs/BuildersTab';
import ProjectsTab from './Admin/tabs/ProjectsTab';
import RevenueTab from './Admin/tabs/RevenueTab';
import AnalyticsTab from './Admin/tabs/AnalyticsTab';
import GovernanceTab from './Admin/tabs/GovernanceTab';
import UsersTab from './Admin/tabs/UsersTab';

// Components & Modals
import ProjectReviewModal from './Admin/components/ProjectReviewModal';
import BuilderReviewModal from './Admin/components/BuilderReviewModal';
import ImageModal from './Admin/components/ImageModal';
import MilestonesModal from './Admin/components/MilestonesModal';
import GovernanceModal from './Admin/components/GovernanceModal';
import MacroAnalyticsModal from './Admin/components/MacroAnalyticsModal';
import RevenueSettlementModal from './Admin/components/RevenueSettlementModal';
import InfuseRevenueModal from './Admin/components/InfuseRevenueModal';
import RejectionModal from './Admin/components/RejectionModal';
import { AdminConfirmModal, AdminToast } from './Admin/components/AdminFeedback';

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [kycApps, setKycApps] = useState([]);
  const [pendingBuilders, setPendingBuilders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [macroList, setMacroList] = useState([]);
  const [proposalsList, setProposalsList] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [modalImage, setModalImage] = useState({ open: false, url: '', title: '' });
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestoneProject, setSelectedMilestoneProject] = useState(null);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementResult, setSettlementResult] = useState(null);
  const [isInfuseModalOpen, setIsInfuseModalOpen] = useState(false);

  // Feedback States
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({ open: false, title: '', message: '', onConfirm: () => {} });
  const [rejectionConfig, setRejectionConfig] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  // Form States (Users Tab)
  const [targetUserId, setTargetUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  // Form States (Infuse Modal)
  const [infuseForm, setInfuseForm] = useState({
    project_id: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kyc', label: 'Identity Review', icon: ShieldCheck, count: kycApps.length },
    { id: 'builders', label: 'Builders', icon: Building2, count: pendingBuilders.length },
    { id: 'projects', label: 'Asset Lifecycle', icon: Briefcase },
    { id: 'revenue', label: 'Treasury', icon: CircleDollarSign, count: pendingSettlements.length },
    { id: 'analytics', label: 'Macro Data', icon: BarChart3 },
    { id: 'governance', label: 'Consensus', icon: Gavel },
    { id: 'users', label: 'User Nodes', icon: Users },
  ];

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const showConfirm = (title, message, onConfirm, type = 'danger', confirmText = 'Confirm') => {
    setConfirmConfig({ open: true, title, message, onConfirm, type, confirmText });
  };

  const showRejection = (title, message, onConfirm) => {
    setRejectionConfig({ open: true, title, message, onConfirm });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log("Initializing Admin Protocols...");
      
      const results = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getPendingKYC(),
        adminService.getPendingBuilders(),
        propertyService.getProperties('all'),
        adminService.getMacroData(),
        governanceService.getAllProposals(),
        revenueService.getPendingSettlements()
      ]);

      // Process results
      if (results[0].status === 'fulfilled') setStats(results[0].value);
      else console.error("Stats fetch failed", results[0].reason);

      if (results[1].status === 'fulfilled') setKycApps(results[1].value.items || []);
      else console.error("KYC fetch failed", results[1].reason);

      if (results[2].status === 'fulfilled') setPendingBuilders(results[2].value);
      else console.error("Builders fetch failed", results[2].reason);

      if (results[3].status === 'fulfilled') setProjects(results[3].value);
      else console.error("Projects fetch failed", results[3].reason);

      if (results[4].status === 'fulfilled') setMacroList(results[4].value);
      else console.error("Macro fetch failed", results[4].reason);

      if (results[5].status === 'fulfilled') setProposalsList(results[5].value);
      else console.error("Governance fetch failed", results[5].reason);

      if (results[6].status === 'fulfilled') setPendingSettlements(results[6].value);
      else console.error("Revenue fetch failed", results[6].reason);

      // Only show error if critical data is missing
      if (results.some(r => r.status === 'rejected')) {
        console.warn("Some admin protocols failed to initialize. Dashboard may be incomplete.");
        // addToast("Partial initialization failure", "warning");
      }
    } catch (error) {
      console.error("Initialization failed completely", error);
      addToast("Failed to initialize admin protocols", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    const data = await adminService.getDashboardStats();
    setStats(data);
  };

  const refreshKYC = async () => {
    const data = await adminService.getPendingKYC();
    setKycApps(data);
    refreshStats();
  };

  const handleClaimKYC = async (id) => {
    try {
      await adminService.claimKYC(id);
      refreshKYC();
      addToast("Application claimed for review");
    } catch (err) { addToast(err.response?.data?.detail || "Claim failed", "error"); }
  };

  const handleReviewKYC = async (id, status) => {
    if (status === 'rejected') {
      showRejection(
        "KYC Rejection", 
        "Provide a clear reason why this user identity does not meet the compliance standards.",
        async (reason) => {
          try {
            await adminService.reviewKYC(id, { status: 'rejected', rejection_reason: reason });
            refreshKYC();
            addToast("KYC Rejected");
            setRejectionConfig({ ...rejectionConfig, open: false });
          } catch (err) { addToast(err.response?.data?.detail || "Review failed", "error"); }
        }
      );
    } else {
      try {
        await adminService.reviewKYC(id, { status: 'approved' });
        refreshKYC();
        addToast("KYC Approved Successfully");
      } catch (err) { addToast(err.response?.data?.detail || "Review failed", "error"); }
    }
  };

  const handleWalletAdjust = (e) => {
    e.preventDefault();
    showConfirm(
      "Financial Override",
      `Are you sure you want to manually adjust wallet for user ${targetUserId} by ${walletAmount} INR? This is an immutable audit action.`,
      async () => {
        try {
          await adminService.adjustWallet(targetUserId, { 
            amount: parseFloat(walletAmount), 
            reason: walletReason 
          });
          addToast("Wallet adjusted successfully");
          setTargetUserId('');
          setWalletAmount('');
          setWalletReason('');
          refreshStats();
          setConfirmConfig({ ...confirmConfig, open: false });
        } catch (err) { addToast(err.response?.data?.detail || "Adjustment failed", "error"); }
      }
    );
  };

  const handleIPOAction = (projectId, action) => {
    const title = action === 'approve' ? "Launch IPO Protocol" : "Trigger Market Genesis";
    const msg = action === 'approve' 
      ? "Approve this project IPO? Investors will be able to subscribe immediately." 
      : "Trigger IPO completion? This will unlock secondary market trading.";
    
    showConfirm(title, msg, async () => {
      try {
        if (action === 'approve') await adminService.approveIPO(projectId);
        else await adminService.triggerSecondaryMarket(projectId);
        
        const projectsData = await propertyService.getProperties('all');
        setProjects(projectsData);
        addToast(`Asset ${action === 'approve' ? 'launched' : 'genesis completed'}`);
        setConfirmConfig({ ...confirmConfig, open: false });
      } catch (err) { addToast(err.response?.data?.detail || "Action failed", "error"); }
    }, 'info');
  };

  const handleProjectHalt = (projectId, currentStatus) => {
    const isHalted = currentStatus === 'halted';
    const title = isHalted ? "Resume Trading Node" : "Emergency Protocol: HALT";
    const msg = isHalted 
      ? "Resume trading and subscriptions for this project?" 
      : "STOP ALL TRADING? This will HALT the exchange for this project and CANCEL all active intents. This is an emergency action.";
    
    showConfirm(title, msg, async () => {
      try {
        await adminService.updateProjectStatus(projectId, { status: isHalted ? 'approved' : 'halted' });
        const projectsData = await propertyService.getProperties('all');
        setProjects(projectsData);
        addToast(isHalted ? "Project resumed." : "Project HALTED and orders purged.");
        setConfirmConfig({ ...confirmConfig, open: false });
      } catch (err) { addToast(err.response?.data?.detail || "Status update failed", "error"); }
    }, isHalted ? 'info' : 'danger');
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
      addToast(`Builder node ${status === 'approved' ? 'accredited' : status === 'rejected' ? 'suspended' : 'revision requested'}.`);
    } catch (error) {
      addToast("Accreditation update failed.", "error");
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
      addToast("Failed to fetch project details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMilestone = (projectId, milestoneId) => {
    showConfirm(
      "Verify Construction Milestone",
      "Officially mark this milestone as COMPLETED? This action will update project records and potentially unlock locked capital.",
      async () => {
        try {
          await adminService.verifyMilestone(projectId, milestoneId, { status: 'completed' });
          const detailedProject = await propertyService.getPropertyById(projectId);
          setSelectedMilestoneProject(detailedProject);
          addToast("Milestone verified and capital unlocked");
          setConfirmConfig({ ...confirmConfig, open: false });
        } catch (err) {
          addToast(err.response?.data?.detail || "Verification failed", "error");
        }
      }, 'info'
    );
  };

  const handleMacroSave = async (formData) => {
    try {
      setLoading(true);
      if (selectedMacro) {
        await adminService.updateMacroData(selectedMacro.pincode, formData);
        addToast("Analytics node updated");
      } else {
        await adminService.createMacroData(formData);
        addToast("New analytics node published");
      }
      const data = await adminService.getMacroData();
      setMacroList(data);
      setIsMacroModalOpen(false);
      setSelectedMacro(null);
    } catch (err) {
      addToast(err.response?.data?.detail || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMacroDelete = (pincode) => {
    showConfirm(
      "Delete Analytics Node",
      `Permanently delete market intelligence node for ${pincode}? This data will be purged from the global registry.`,
      async () => {
        try {
          setLoading(true);
          await adminService.deleteMacroData(pincode);
          const data = await adminService.getMacroData();
          setMacroList(data);
          addToast("Analytics node purged");
          setConfirmConfig({ ...confirmConfig, open: false });
        } catch (err) {
          addToast(err.response?.data?.detail || "Delete failed", "error");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleProposalSave = async (formData) => {
    try {
      setLoading(true);
      await governanceService.createProposal(formData);
      const data = await governanceService.getAllProposals();
      setProposalsList(data);
      setIsProposalModalOpen(false);
      addToast("Governance Proposal initialized on-chain");
    } catch (err) {
      addToast(err.response?.data?.detail || "Proposal creation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProposalStatus = async (proposalId, status, resultIndex = null) => {
    try {
      setLoading(true);
      await governanceService.updateProposalStatus(proposalId, status, resultIndex);
      const data = await governanceService.getAllProposals();
      setProposalsList(data);
      addToast(`Proposal ${status}.`);
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSettleRevenue = (cycleId) => {
    showConfirm(
      "Finalize Revenue Cycle",
      "Finalize this revenue distribution? This will debit the builder and credit all eligible investors based on the 30-day maturity rule.",
      async () => {
        try {
          setLoading(true);
          const response = await revenueService.settleCycle(cycleId);
          setSettlementResult(response);
          setIsSettlementModalOpen(true);
          
          const data = await revenueService.getPendingSettlements();
          setPendingSettlements(data);
          await refreshStats();
          setConfirmConfig({ ...confirmConfig, open: false });
        } catch (err) {
          addToast(err.response?.data?.detail || "Settlement failed", "error");
        } finally {
          setLoading(false);
        }
      }, 'info'
    );
  };

  const handleRejectSettlement = (cycleId) => {
    showConfirm(
      "Reject Settlement Request",
      "Are you sure you want to reject this revenue settlement? The builder will need to re-submit the deposit.",
      async () => {
        try {
          setLoading(true);
          await revenueService.rejectCycle(cycleId);
          const data = await revenueService.getPendingSettlements();
          setPendingSettlements(data);
          addToast("Settlement request rejected");
          setConfirmConfig({ ...confirmConfig, open: false });
        } catch (err) {
          addToast(err.response?.data?.detail || "Rejection failed", "error");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleInfuseRevenue = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await revenueService.depositRental(infuseForm);
      addToast("Revenue infusion successful. Awaiting approval.");
      setIsInfuseModalOpen(false);
      const data = await revenueService.getPendingSettlements();
      setPendingSettlements(data);
    } catch (err) {
      addToast(err.response?.data?.detail || "Infusion failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-12 h-12 border-t-2 border-primary-500 animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="hidden md:flex flex-col border-r border-white/5 bg-[#0a0a0a] relative z-50"
      >
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Shield size={20} className="text-white" />
              </div>
              <span className="font-bold tracking-tighter text-xl uppercase italic">Estate<span className="text-primary-500">X</span></span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2 overflow-y-auto scrollbar-hide`}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-xl transition-all duration-300 group relative ${
                activeTab === item.id 
                ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isSidebarCollapsed ? '' : 'shrink-0'} />
              {!isSidebarCollapsed && (
                <span className="text-xs uppercase tracking-widest font-bold flex-1 text-left truncate">{item.label}</span>
              )}
              {!isSidebarCollapsed && item.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === item.id ? 'bg-white text-primary-600' : 'bg-primary-600/20 text-primary-500'
                }`}>
                  {item.count}
                </span>
              )}
              {isSidebarCollapsed && item.count > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-white/5 space-y-4 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
           {!isSidebarCollapsed && (
             <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white shadow-lg">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold truncate uppercase">{user?.name || 'Admin'}</p>
                 <p className="text-[10px] text-white/30 truncate">Super Protocol Level 4</p>
               </div>
             </div>
           )}

           <button 
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-xl text-primary-500/60 hover:bg-primary-500/10 hover:text-primary-500 transition-all duration-300 ${!isSidebarCollapsed ? 'border border-primary-500/10' : ''}`}
              title={isSidebarCollapsed ? "Return to App" : ""}
            >
              <ArrowLeft size={20} />
              {!isSidebarCollapsed && <span className="text-xs uppercase tracking-widest font-bold">Return to App</span>}
            </button>

           <button 
             onClick={logout}
             className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300`}
             title={isSidebarCollapsed ? "Terminate Session" : ""}
           >
             <LogOut size={20} />
             {!isSidebarCollapsed && <span className="text-xs uppercase tracking-widest font-bold">Terminate Session</span>}
           </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-[60] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <Shield size={20} className="text-primary-500" />
           <span className="font-bold tracking-tighter uppercase italic">Estate<span className="text-primary-500">X</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white/60 hover:text-white">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-[#050505] z-[100] md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <span className="font-bold tracking-tighter uppercase italic">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/60"><X size={24}/></button>
            </div>
            <div className="flex-1 p-6 space-y-4">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl ${
                    activeTab === item.id ? 'bg-primary-600 text-white' : 'text-white/40'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-sm uppercase tracking-widest font-bold">{item.label}</span>
                </button>
              ))}
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-primary-500 bg-primary-500/5"
                >
                  <ArrowLeft size={24} />
                  <span className="text-sm uppercase tracking-widest font-bold">Return to Ecosystem</span>
                </button>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500"
                >
                  <LogOut size={24} />
                  <span className="text-sm uppercase tracking-widest font-bold">Terminate Session</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top bar */}
        <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-white/5 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-40">
           <div>
              <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-white/30 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                Network Status: Operational
              </h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-white/20 text-[10px] uppercase tracking-widest">Protocol</span>
                 <span className="text-white/40 text-[10px] uppercase tracking-widest">/</span>
                 <span className="text-white font-bold text-[10px] uppercase tracking-widest">{activeTab}</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-500 transition-colors" size={16} />
                 <input 
                  type="text" 
                  placeholder="Universal Protocol Search..." 
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs w-64 outline-none focus:border-primary-500/50 focus:bg-white/[0.07] transition-all"
                 />
              </div>
              <button className="relative p-2 text-white/40 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
              </button>
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-24 md:pt-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'kyc' && (
              <KYCTab 
                kycApps={kycApps} 
                onClaim={handleClaimKYC} 
                onReview={handleReviewKYC} 
                onRefresh={refreshKYC} 
                onImageClick={(url, title) => setModalImage({ open: true, url, title })}
                currentUser={user}
              />
            )}
            {activeTab === 'builders' && (
              <BuildersTab 
                pendingBuilders={pendingBuilders} 
                onAudit={(b) => { setSelectedBuilder(b); setIsBuilderModalOpen(true); }}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectsTab 
                projects={projects} 
                onProjectClick={(p) => { setSelectedProject(p); setIsProjectModalOpen(true); }}
                onIPOAction={handleIPOAction}
                onHaltAction={handleProjectHalt}
                onOpenMilestones={handleOpenMilestones}
              />
            )}
            {activeTab === 'revenue' && (
              <RevenueTab 
                pendingSettlements={pendingSettlements} 
                projects={projects}
                onInfuse={() => setIsInfuseModalOpen(true)}
                onReject={handleRejectSettlement}
                onSettle={handleSettleRevenue}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                macroList={macroList}
                onNew={() => { setSelectedMacro(null); setIsMacroModalOpen(true); }}
                onEdit={(macro) => { setSelectedMacro(macro); setIsMacroModalOpen(true); }}
                onDelete={handleMacroDelete}
              />
            )}
            {activeTab === 'governance' && (
              <GovernanceTab 
                proposalsList={proposalsList}
                projects={projects}
                onNew={() => setIsProposalModalOpen(true)}
                onStatusUpdate={handleProposalStatus}
              />
            )}
            {activeTab === 'users' && (
              <UsersTab 
                targetUserId={targetUserId}
                setTargetUserId={setTargetUserId}
                walletAmount={walletAmount}
                setWalletAmount={setWalletAmount}
                walletReason={walletReason}
                setWalletReason={setWalletReason}
                onAdjust={handleWalletAdjust}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals & Feedback */}
      <AnimatePresence>
        {toasts.map(toast => (
          <AdminToast key={toast.id} {...toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </AnimatePresence>

      <AdminConfirmModal 
        isOpen={confirmConfig.open} 
        onClose={() => setConfirmConfig({ ...confirmConfig, open: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />

      <RejectionModal 
        isOpen={rejectionConfig.open}
        onClose={() => setRejectionConfig({ ...rejectionConfig, open: false })}
        onConfirm={rejectionConfig.onConfirm}
        title={rejectionConfig.title}
        message={rejectionConfig.message}
      />

      <ProjectReviewModal 
        isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} project={selectedProject}
        onIPOAction={handleIPOAction} onHaltAction={handleProjectHalt}
      />

      <BuilderReviewModal 
        isOpen={isBuilderModalOpen} onClose={() => setIsBuilderModalOpen(false)} builder={selectedBuilder}
        onVerify={handleBuilderVerification} rejectionReason={rejectionReason} setRejectionReason={setRejectionReason}
      />

      <ImageModal 
        isOpen={modalImage.open} onClose={() => setModalImage({ ...modalImage, open: false })} 
        imageUrl={modalImage.url} title={modalImage.title} 
      />

      <MilestonesModal
        isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)}
        project={selectedMilestoneProject} onVerify={handleVerifyMilestone}
      />

      <GovernanceModal 
        isOpen={isProposalModalOpen} onClose={() => setIsProposalModalOpen(false)}
        projects={projects.filter(p => p.ipo_status === 'completed')} onSave={handleProposalSave}
      />

      <MacroAnalyticsModal 
        isOpen={isMacroModalOpen} onClose={() => { setIsMacroModalOpen(false); setSelectedMacro(null); }}
        data={selectedMacro} onSave={handleMacroSave}
      />

      <RevenueSettlementModal 
        isOpen={isSettlementModalOpen} onClose={() => setIsSettlementModalOpen(false)} result={settlementResult}
      />

      <InfuseRevenueModal 
        isOpen={isInfuseModalOpen} onClose={() => setIsInfuseModalOpen(false)}
        projects={projects} infuseForm={infuseForm} setInfuseForm={setInfuseForm} onSubmit={handleInfuseRevenue}
      />
    </div>
  );
};

export default AdminPortal;
