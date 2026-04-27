import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  Shield, 
  Clock, 
  ExternalLink, 
  Eye, 
  PlusCircle,
  AlertTriangle,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import propertyService from '../services/propertyService';
import revenueService from '../services/revenueService';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 rounded-full bg-${color}-500 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-${color}-500/10 border border-${color}-500/20 rounded-xl`}>
          <Icon className={`text-${color}-500`} size={20} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-bold">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tighter">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalProjects: 0,
    activeIpos: 0,
    avgFunding: 0
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getBuilderProjects();
        setProjects(data);
        
        // Calculate stats
        const totalVal = data.reduce((acc, p) => acc + (p.financial?.total_budget || 0), 0);
        const active = data.filter(p => p.ipo_status === 'active').length;
        const avgFunding = data.length > 0 
          ? data.reduce((acc, p) => acc + (p.financial?.funding_raised / p.financial?.total_budget * 100 || 0), 0) / data.length 
          : 0;

        setStats({
          totalValue: totalVal,
          totalProjects: data.length,
          activeIpos: active,
          avgFunding: Math.round(avgFunding)
        });
      } catch (err) {
        console.error("Failed to fetch builder projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [revenueForm, setRevenueForm] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleDepositRevenue = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await revenueService.depositRental({
        project_id: selectedProject.id,
        amount: parseFloat(revenueForm.amount),
        month: parseInt(revenueForm.month),
        year: parseInt(revenueForm.year)
      });
      alert("Rental deposit initiated. Pending Admin approval.");
      setIsRevenueModalOpen(false);
      setRevenueForm({ ...revenueForm, amount: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader size={48} text="Synchronizing Project Nodes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 lg:p-12 space-y-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
        <div>
          <h1 className="text-5xl font-bold uppercase tracking-tighter leading-none mb-4">
            Project <span className="text-white/20">Portfolio</span>
          </h1>
          <p className="text-sm text-white/40 max-w-xl leading-relaxed uppercase tracking-widest font-medium">
            Manage your fractionalized real estate assets, monitor IPO performance, and track construction milestones.
          </p>
        </div>
        <Button 
          variant="primary" 
          className="h-14 px-8 text-[11px] font-bold tracking-[0.2em] rounded-none group"
          onClick={() => navigate('/dashboard/add-property')}
        >
          LIST NEW PROPERTY 
          <PlusCircle className="ml-3 group-hover:rotate-90 transition-transform" size={18} />
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Value Listed" value={`₹${(stats.totalValue / 10000000).toFixed(2)}Cr`} icon={TrendingUp} color="blue" />
        <StatCard title="Active Listings" value={stats.totalProjects} icon={Building2} color="purple" />
        <StatCard title="IPO In Progress" value={stats.activeIpos} icon={Shield} color="amber" />
        <StatCard title="Avg Funding" value={`${stats.avgFunding}%`} icon={Clock} color="green" />
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Asset Inventory Control</h3>
           <span className="text-[10px] uppercase tracking-widest text-white/20">{projects.length} Nodes Found</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.length === 0 ? (
            <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Building2 className="text-white/20" size={32} />
              </div>
              <h4 className="text-xl font-bold uppercase tracking-tight mb-2 text-white/60">No properties listed yet</h4>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-8">Start your journey by tokenizing your first asset</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/add-property')}>INITIALIZE FIRST ASSET</Button>
            </Card>
          ) : (
            projects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="hover:border-white/20 transition-colors bg-[#0a0a0a] group overflow-hidden">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                    {/* Visual & Summary */}
                    <div className="lg:w-1/3 p-6 flex flex-col justify-between">
                       <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xl font-bold uppercase tracking-tighter text-white group-hover:text-primary-400 transition-colors">{project.title}</h4>
                            <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                              project.ipo_status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              project.ipo_status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              'bg-white/10 text-white/40 border-white/10'
                            }`}>
                              {project.ipo_status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/30">
                            <MapPin size={12} />
                            <span className="text-[10px] uppercase tracking-widest">{project.location?.city}, {project.location?.state}</span>
                          </div>
                       </div>
                       
                       <div className="mt-8">
                          <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 mb-2">
                             <span>Funding Progress</span>
                             <span className="font-bold text-white">{Math.round((project.financial?.funding_raised / project.financial?.total_budget) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-none overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${(project.financial?.funding_raised / project.financial?.total_budget) * 100}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="h-full bg-green-500"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Financial Nodes */}
                    <div className="lg:w-1/4 p-6 bg-white/[0.01]">
                       <h5 className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-4 font-bold">Token Metrics</h5>
                       <div className="space-y-4">
                          <div className="flex justify-between items-baseline">
                             <span className="text-[10px] uppercase text-white/30">Total Bricks</span>
                             <span className="text-sm font-bold font-mono">{project.financial?.total_bricks?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                             <span className="text-[10px] uppercase text-white/30">IPO Price</span>
                             <span className="text-sm font-bold font-mono text-green-500">₹{project.financial?.ipo_price}</span>
                          </div>
                          <div className="flex justify-between items-baseline pt-4 border-t border-white/5">
                             <span className="text-[10px] uppercase text-white/30 font-bold">Valuation</span>
                             <span className="text-sm font-bold">₹{(project.financial?.total_budget / 10000000).toFixed(2)}Cr</span>
                          </div>
                       </div>
                    </div>

                    {/* Compliance & Operations */}
                    <div className="lg:flex-1 p-6 flex flex-col justify-between items-end">
                       <div className="flex gap-2 mb-6">
                           <div className={`p-2 border ${project.compliance?.rera_approved ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                              <Shield size={12} className={project.compliance?.rera_approved ? 'text-green-500' : 'text-red-500'} />
                           </div>
                           <div className={`p-2 border ${project.status === 'approved' || project.status === 'active' ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                              <CheckCircle2 size={12} className={project.status === 'approved' || project.status === 'active' ? 'text-green-500' : 'text-amber-500'} />
                           </div>
                       </div>

                        <div className="flex flex-wrap gap-2 justify-end w-full">
                          <Button 
                            variant="outline" 
                            className="text-[10px] h-10 px-4 tracking-widest rounded-none border-white/5 hover:bg-white/5"
                            onClick={() => navigate(`/properties/${project.id}`)}
                          >
                            VIEW LISTING
                            <ExternalLink className="ml-2" size={14} />
                          </Button>
                          <Button 
                            variant="primary" 
                            className="text-[10px] h-10 px-4 tracking-widest rounded-none"
                            onClick={() => { setSelectedProject(project); setIsRevenueModalOpen(true); }}
                          >
                            DEPOSIT RENTAL
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-[10px] h-10 px-4 tracking-widest rounded-none border-blue-500/20 text-blue-400"
                            onClick={() => navigate(`/dashboard/builder-wallet`)}
                          >
                            PROJECT ESCROW
                            <ChevronRight className="ml-1" size={16} />
                          </Button>
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Revenue Deposit Modal */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <Card className="max-w-md w-full bg-[#0a0a0a] border-white/10 shadow-2xl">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-xl font-bold uppercase tracking-tighter">Deposit Rental Income</CardTitle>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Project: {selectedProject?.title}</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleDepositRevenue} className="space-y-6">
                   <Input 
                     label="Amount (INR)" 
                     placeholder="e.g. 50000" 
                     type="number"
                     required
                     value={revenueForm.amount}
                     onChange={(e) => setRevenueForm({...revenueForm, amount: e.target.value})}
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest text-white/40">Month</label>
                         <select 
                           className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-primary-500 outline-none"
                           value={revenueForm.month}
                           onChange={(e) => setRevenueForm({...revenueForm, month: e.target.value})}
                         >
                            {Array.from({length: 12}, (_, i) => (
                              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest text-white/40">Year</label>
                         <Input 
                           type="number"
                           value={revenueForm.year}
                           onChange={(e) => setRevenueForm({...revenueForm, year: e.target.value})}
                         />
                      </div>
                   </div>
                   <div className="flex gap-3 pt-4">
                      <Button type="button" variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={() => setIsRevenueModalOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="primary" className="flex-1 uppercase tracking-widest text-[10px]">Initiate Deposit</Button>
                   </div>
                </form>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
