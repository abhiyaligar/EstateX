import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  CheckCircle2, 
  Shield, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Clock, 
  Activity, 
  Building2,
  FileText,
  ShieldCheck,
  Percent,
  Wallet
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import PropertyGallery from '../components/property/PropertyGallery';
import { Loader } from '../components/ui/Loader';
import propertyService from '../services/propertyService';
import exchangeService from '../services/exchangeService';
import governanceService from '../services/governanceService';
import Toast from '../components/ui/Toast';

const ComplianceBadge = ({ label, isApproved }) => (
  <div className={`flex items-center gap-3 p-4 border ${isApproved ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400'} transition-all duration-500`}>
    <ShieldCheck size={18} className={isApproved ? 'animate-pulse' : ''} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    <CheckCircle2 size={14} className="ml-auto" />
  </div>
);

const MilestoneStepper = ({ milestones = [] }) => (
  <div className="space-y-8 py-10">
    <div className="flex items-center gap-4 mb-8">
      <Clock size={20} className="text-[#D4AF37]" />
      <h3 className="text-xl font-bold uppercase tracking-tight">Construction Roadmap</h3>
    </div>
    <div className="relative space-y-12">
      <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-black/5 dark:bg-black/5 dark:bg-white/5" />
      {milestones.map((m, idx) => (
        <motion.div 
          key={m.id}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="relative pl-12 group"
        >
          <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 z-10 ${m.status === 'completed' ? 'bg-surface border-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-background border-black/10 dark:border-white/10 text-zinc-600 group-hover:border-zinc-400'}`}>
            <span className="text-[10px] font-black">{m.milestone_number}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-bold uppercase tracking-tight ${m.status === 'completed' ? 'text-[#D4AF37]' : 'text-foreground'}`}>{m.description}</h4>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{m.release_percentage}% Release</span>
            </div>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-medium">
              Target: {new Date(m.target_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const MacroAnalyticsCard = ({ analytics, pincode }) => {
  if (!analytics) return null;
  
  const metrics = [
    { label: 'Demand Index', value: analytics.demand_score, icon: Activity, suffix: '/100', color: 'text-blue-500' },
    { label: 'YoY Appreciation', value: analytics.yoy_growth_percentage, icon: TrendingUp, suffix: '%', color: 'text-[#D4AF37]' },
    { label: 'Rental Yield', value: analytics.avg_rental_yield, icon: Percent, suffix: '%', color: 'text-green-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-black/5 dark:border-white/5 my-10">
      {metrics.map((m, idx) => (
        <div key={idx} className="space-y-3 group">
          <div className="flex items-center gap-3">
            <m.icon size={16} className={m.color} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-600 dark:text-zinc-400 transition-colors">{m.label}</span>
          </div>
          <p className="text-3xl font-bold tracking-tighter">
            {m.value}<span className="text-sm text-zinc-700 ml-1">{m.suffix}</span>
          </p>
          <div className="h-[2px] bg-black/5 dark:bg-black/5 dark:bg-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${m.value}%` }}
              className={`h-full ${m.color.replace('text', 'bg')}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvesting, setIsInvesting] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [isHolder, setIsHolder] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const fetchProperty = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [propData, portfolioData] = await Promise.all([
        propertyService.getPropertyById(id),
        exchangeService.getPortfolio().catch(() => [])
      ]);
      
      setProperty(propData);
      const holding = portfolioData.find(h => h.project_id === id);
      setIsHolder(holding && holding.quantity > 0);
    } catch (error) {
      console.error("Failed to fetch property details", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  const handleInvest = async () => {
    try {
      setIsInvesting(true);
      await exchangeService.subscribeToIPO(id, buyAmount);
      setToast({
        open: true,
        message: `Strategic acquisition of ${buyAmount} bricks complete.`,
        type: 'success'
      });
      fetchProperty(true);
    } catch (error) {
      console.error("Investment failed", error);
      setToast({
        open: true,
        message: "Liquidity error. Check wallet balance.",
        type: 'error'
      });
    } finally {
      setIsInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader size={48} text="Synchronizing Asset DNA..." />
      </div>
    );
  }

  if (!property) return <div className="py-24 text-center text-zinc-600 uppercase font-black tracking-widest">Asset Node Not Found</div>;

  const price = property.financial?.ipo_price || 0;
  const fundingRaised = property.financial?.funding_raised || 0;
  const totalBudget = property.financial?.total_budget || 1;
  const progress = Math.min((fundingRaised / totalBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground pt-10 pb-32">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4 mb-12">
          <Link to="/ipo" className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-[#D4AF37] transition-colors">IPO Center</Link>
          <span className="text-zinc-800 dark:text-zinc-200">/</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">{property.title}</span>
        </div>

        {/* Hero Section */}
        <header className="mb-16 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-black/5 dark:border-white/5 pb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] border ${property.ipo_status === 'completed' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-[#D4AF37]/30 text-[#D4AF37] bg-surface/5'}`}>
                  {property.ipo_status === 'active' ? 'Live Deployment' : property.ipo_status === 'completed' ? 'Secondary Market' : 'Phase: Upcoming'}
                </span>
                <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-[#D4AF37]" /> {property.location?.city}, {property.location?.state}
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                {property.title}
              </h1>
            </div>
            
            <div className="text-left md:text-right space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">Initial Offering</p>
               <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[#D4AF37]">
                 ₹{property.financial?.ipo_price?.toLocaleString()}<span className="text-lg text-zinc-800 dark:text-zinc-200 ml-2">/BRICK</span>
               </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-20">
            <PropertyGallery images={property.images} />

            <MacroAnalyticsCard analytics={property.macro_analytics} pincode={property.location?.pincode} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div className="p-8 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-4">Total Supply</p>
                  <p className="text-2xl font-bold tracking-tight">{property.financial?.total_bricks?.toLocaleString()}<span className="text-[10px] text-zinc-800 dark:text-zinc-200 ml-1 uppercase">BK</span></p>
               </div>
               <div className="p-8 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-4">Area Coverage</p>
                  <p className="text-2xl font-bold tracking-tight">{property.location?.area_sqft?.toLocaleString()}<span className="text-[10px] text-zinc-800 dark:text-zinc-200 ml-1 uppercase">SQFT</span></p>
               </div>
               <div className="p-8 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-4">Investors</p>
                  <p className="text-2xl font-bold tracking-tight">{property.investor_count || 0}</p>
               </div>
               <div className="p-8 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-4">Completion</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {property.timeline?.expected_completion ? new Date(property.timeline.expected_completion).getFullYear() : '2026'}
                  </p>
               </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-[#D4AF37]" />
                <h3 className="text-xl font-bold uppercase tracking-tight">Project Narrative</h3>
              </div>
              <div className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm max-w-4xl space-y-6">
                {property.description?.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <MilestoneStepper milestones={property.milestones} />

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <Shield size={20} className="text-[#D4AF37]" />
                <h3 className="text-xl font-bold uppercase tracking-tight">Compliance & Verification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComplianceBadge label="RERA Registered" isApproved={property.compliance?.rera_approved} />
                <ComplianceBadge label="Environmental Clearance" isApproved={property.compliance?.environmental_clearance} />
                <ComplianceBadge label="Insurance Coverage" isApproved={property.compliance?.insurance_coverage} />
                <ComplianceBadge label="Builder Accreditation" isApproved={property.builder?.verification_status === 'approved'} />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-10 space-y-10">
              <Card className="bg-surface border-black/10 dark:border-white/10 p-6 md:p-10 space-y-8 md:space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
                    {property.ipo_status === 'completed' ? 'Trade Portal' : 'Acquisition Node'}
                  </h3>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Strategic Capital Deployment</p>
                </div>

                {property.ipo_status === 'completed' ? (
                  <div className="space-y-8">
                    <div className="p-4 md:p-6 bg-blue-500/5 border border-blue-500/10 space-y-4">
                      <p className="text-[10px] md:text-xs text-blue-400 leading-relaxed">
                        Initial Public Offering concluded. Asset transitioned to secondary market protocols.
                      </p>
                    </div>
                    <Link to={`/trade?assetId=${property.id}`} className="block">
                      <button className="w-full bg-surface text-black py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3">
                        Enter Trading Room <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Funding Progress</p>
                        <p className="text-xs font-bold text-[#D4AF37]">{progress.toFixed(1)}%</p>
                      </div>
                      <div className="h-1 bg-black/5 dark:bg-black/5 dark:bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-surface"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                        <span>₹{(fundingRaised / 10000000).toFixed(2)}Cr</span>
                        <span>Target: ₹{(totalBudget / 10000000).toFixed(2)}Cr</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 block ml-1">Acquisition Volume</label>
                       <div className="relative group">
                          <input 
                            type="number" 
                            min="1"
                            value={buyAmount === 0 ? '' : buyAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setBuyAmount(0);
                              } else {
                                setBuyAmount(parseInt(val) || 0);
                              }
                            }}
                            className="w-full bg-background border border-black/10 dark:border-white/10 h-14 md:h-16 px-6 text-lg md:text-xl font-bold tracking-tighter focus:border-[#D4AF37] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={property.ipo_status !== 'active'}
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 dark:text-zinc-200">BRICKS</div>
                       </div>
                       <div className="flex justify-between p-4 bg-black/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Commitment</span>
                          <span className="text-sm font-bold text-[#D4AF37]">₹{(buyAmount * price).toLocaleString()}</span>
                       </div>
                    </div>

                    <button 
                      onClick={handleInvest}
                      disabled={property.ipo_status !== 'active' || isInvesting || buyAmount <= 0}
                      className={`w-full py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${property.ipo_status === 'active' ? 'bg-white text-black hover:bg-surface' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 cursor-not-allowed border border-black/5 dark:border-white/5'}`}
                    >
                      {isInvesting ? (
                        <Zap size={14} className="animate-spin" />
                      ) : property.ipo_status === 'active' ? (
                        <>Execute Transaction <Zap size={14} /></>
                      ) : (
                        'Awaiting Deployment'
                      )}
                    </button>
                  </div>
                )}
              </Card>

              <div className="p-6 md:p-10 border border-black/5 dark:border-white/5 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-surface/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-black text-xs md:text-base">
                       {property.builder?.company_name?.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                       <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Architectural Node</p>
                       <p className="text-sm md:text-base font-bold uppercase tracking-tight">{property.builder?.company_name}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 md:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Zap key={star} size={10} className={star <= (property.builder?.average_rating || 0) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-zinc-800 dark:text-zinc-200'} />
                    ))}
                    <span className="text-[7px] md:text-[8px] font-black text-zinc-700 ml-1 md:ml-2 uppercase tracking-widest">Level {Math.ceil(property.builder?.average_rating || 0)}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Governance Integration */}
        <div className="mt-40 border-t border-black/5 dark:border-white/5 pt-32">
           <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-12">
                 <div className="h-16 w-16 bg-surface/5 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Shield size={32} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tighter uppercase leading-none">Asset Governance</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Decentralized Management Protocol</p>
                 </div>
              </div>
              <GovernanceSection projectId={id} isHolder={isHolder} />
           </div>
        </div>
      </div>

      <Toast 
        isOpen={toast.open} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
};

// Re-using the logic from the previous GovernanceSection but with matching aesthetics
const GovernanceSection = ({ projectId, isHolder }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getProposals(projectId);
      setProposals(data);
    } catch (err) {
      console.error("Failed to fetch proposals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProposals();
  }, [projectId]);

  const handleVote = async (proposalId, optionIndex) => {
    if (!isHolder) {
      alert("Verification Error: Strategic ownership required for governance.");
      return;
    }
    try {
      await governanceService.castVote(proposalId, optionIndex);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.detail || "Voting protocol failure.");
    }
  };

  if (loading) return <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 dark:text-zinc-200 animate-pulse">Scanning Governance Nodes...</div>;
  if (proposals.length === 0) return <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 dark:text-zinc-200">No Active Proposals Identified</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {proposals.map(p => (
        <Card key={p.id} className="bg-black/[0.02] dark:bg-white/[0.01] border-black/5 dark:border-white/5 hover:border-[#D4AF37]/20 transition-all duration-700">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
               <h4 className="text-xl font-bold tracking-tight uppercase">{p.title}</h4>
               <span className="text-[8px] font-black px-2 py-1 bg-surface/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-widest">{p.status}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 leading-relaxed uppercase tracking-widest font-medium">{p.description}</p>
            
            <div className="space-y-8 pt-6">
              {p.options.map((opt, idx) => {
                const totalWeight = p.total_votes || 1;
                const weight = p.vote_distribution?.[idx] || 0;
                const percentage = Math.round((weight / totalWeight) * 100);
                
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">{opt}</span>
                      <span className="text-[10px] font-mono font-bold text-[#D4AF37]">{percentage}%</span>
                    </div>
                    <div className="h-[2px] bg-black/5 dark:bg-black/5 dark:bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-surface"
                      />
                    </div>
                    {p.status === 'active' && isHolder && (
                      <button 
                        className="text-[8px] font-black uppercase tracking-[0.3em] text-[#D4AF37] hover:text-foreground transition-colors"
                        onClick={() => handleVote(p.id, idx)}
                      >
                        [ Confirm Stake ]
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PropertyDetails;
