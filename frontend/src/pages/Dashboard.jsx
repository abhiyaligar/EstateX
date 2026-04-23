import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Wallet, TrendingUp, ArrowUpRight, Clock, AlertCircle, CheckCircle2, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import builderService from '../services/builderService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState({
    wallet: { balance: 0, recent_transactions: [] },
    portfolio: []
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData(user?.role === 'builder');
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSubmitForReview = async () => {
    try {
      setLoading(true);
      await builderService.submitForReview();
      await fetchDashboard();
      alert("Profile submitted for Admin review successfully!");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to submit for review. Ensure all details are complete.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', value: 400000 },
    { name: 'Feb', value: 450000 },
    { name: 'Mar', value: 420000 },
    { name: 'Apr', value: 580000 },
    { name: 'May', value: (dashboardData?.wallet?.balance || 0) > 0 ? (dashboardData.wallet.balance - 10000) : 510000 },
    { name: 'Jun', value: dashboardData?.wallet?.balance || 680000 },
  ];
  
  const stats = [
    { 
      title: 'Total Portfolio Value', 
      value: loading ? '...' : `₹${((dashboardData?.wallet?.balance || 0) + ((dashboardData?.portfolio?.length || 0) * 10000)).toLocaleString()}`, 
      icon: Wallet, 
      change: '+0.0%', 
      isPositive: true 
    },
    { 
      title: user?.role === 'builder' ? 'Construction Revenue' : 'Properties Owned', 
      value: loading ? '...' : (user?.role === 'builder' 
        ? `₹${(dashboardData?.builder_wallet?.balance || 0).toLocaleString()}` 
        : (dashboardData?.portfolio?.length || 0).toString()), 
      icon: user?.role === 'builder' ? Briefcase : Home, 
      change: user?.role === 'builder' ? 'Business Balance' : ((dashboardData?.portfolio?.length || 0) > 0 ? '+1 recently' : 'No assets'), 
      isPositive: true 
    },
    { 
      title: 'Current Wallet Balance', 
      value: loading ? '...' : `₹${(dashboardData?.wallet?.balance || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      change: 'Active', 
      isPositive: true 
    },
  ];

  const recentActivity = (dashboardData?.wallet?.recent_transactions || []).map(tx => ({
    title: tx.transaction_type ? (tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1).replace('_', ' ')) : 'Transaction',
    desc: tx.description || `Ref: ${tx.id?.substring(0,8) || 'N/A'}`,
    amount: tx.transaction_type === 'deposit' ? `+₹${tx.amount}` : `-₹${tx.amount}`,
    time: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recent',
    type: tx.transaction_type === 'deposit' ? 'positive' : 'neutral'
  })).slice(0, 3);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white font-heading uppercase">
            Sovereign <span className="opacity-30 italic">Session</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-500 font-medium tracking-wide uppercase">
            Identified: {user?.email || 'Premium Member'}
          </p>
        </div>
        <div className="flex gap-4">
           <Link to="/properties">
             <Button variant="outline" className="px-8 border-white/10 hover:bg-white/5">Markets</Button>
           </Link>
           {user?.role === 'builder' && (
             <div className="flex gap-4">
                <Link to="/wallet">
                  <Button variant="outline" className="px-8 border-white/10 hover:bg-white/5">Builder Wallet</Button>
                </Link>
                <Link to="/dashboard/add-property">
                  <Button 
                    className="px-8 shadow-2xl shadow-white/10" 
                    disabled={dashboardData?.builder_profile?.verification_status !== 'approved'}
                  >
                    Deploy Asset
                  </Button>
                </Link>
             </div>
           )}
        </div>
      </div>

      {/* Builder Verification Status Bar */}
      {user?.role === 'builder' && (
        <div className={`mb-8 border-l-4 p-6 ${
          !dashboardData?.builder_profile ? 'bg-indigo-500/10 border-indigo-500' :
          dashboardData.builder_profile.verification_status === 'approved' ? 'bg-green-500/10 border-green-500' :
          dashboardData.builder_profile.verification_status === 'pending' ? 'bg-amber-500/10 border-amber-500' :
          dashboardData.builder_profile.verification_status === 'rejected' ? 'bg-red-500/10 border-red-500' :
          dashboardData.builder_profile.verification_status === 'revision_required' ? 'bg-blue-500/10 border-blue-500' :
          'bg-indigo-500/10 border-indigo-500'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                !dashboardData?.builder_profile ? 'bg-indigo-500/20 text-indigo-500' :
                dashboardData.builder_profile.verification_status === 'approved' ? 'bg-green-500/20 text-green-500' :
                dashboardData.builder_profile.verification_status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                dashboardData.builder_profile.verification_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                dashboardData.builder_profile.verification_status === 'revision_required' ? 'bg-blue-500/20 text-blue-500' :
                'bg-indigo-500/20 text-indigo-500'
              }`}>
                {!dashboardData?.builder_profile ? <Shield /> :
                 dashboardData.builder_profile.verification_status === 'approved' ? <CheckCircle2 /> :
                 dashboardData.builder_profile.verification_status === 'pending' ? <Clock /> :
                 dashboardData.builder_profile.verification_status === 'rejected' ? <AlertCircle /> :
                 dashboardData.builder_profile.verification_status === 'revision_required' ? <AlertCircle /> :
                 <Shield />}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold uppercase tracking-tight">
                  {!dashboardData?.builder_profile ? 'Action Required: Set Up Profile' : 
                   `Verification Status: ${dashboardData.builder_profile.verification_status.replace('_', ' ')}`}
                </h4>
                <p className="text-sm text-secondary-500 max-w-2xl">
                  {!dashboardData?.builder_profile ? 'You haven\'t set up your builder profile yet. This is required before you can post properties.' :
                   dashboardData.builder_profile.verification_status === 'approved' ? 'Your profile is fully verified. You can now post properties and manage projects.' :
                   dashboardData.builder_profile.verification_status === 'pending' ? 'Your profile is currently under review by our administration. This typically takes 24-48 hours.' :
                   dashboardData.builder_profile.verification_status === 'rejected' ? `Your profile was rejected. Reason: ${dashboardData.builder_profile.rejection_reason || 'See details below.'}` :
                   dashboardData.builder_profile.verification_status === 'revision_required' ? `The administration has requested some revisions. Feedback: ${dashboardData.builder_profile.rejection_reason}` :
                   'You need to submit your profile for admin approval before you can post properties.'}
                </p>
              </div>
            </div>
            
            {(dashboardData.builder_profile?.verification_status !== 'approved' && dashboardData.builder_profile?.verification_status !== 'pending') && (
              <Link to="/dashboard/verification" className="shrink-0">
                <Button className="h-14 px-8 font-bold text-lg shadow-lg">
                  {!dashboardData?.builder_profile || dashboardData.builder_profile.verification_status === 'details_required' ? 'Setup Profile' : 'Edit & Re-submit'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="flex flex-col p-8 bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[var(--radius)]">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">{stat.title}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-white/5 text-white border border-white/10">
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white font-heading tracking-tighter">{stat.value}</span>
              </div>
              <div className="mt-4 flex items-center text-[10px] uppercase tracking-widest">
                 <ArrowUpRight size={14} className="text-green-400 mr-2" />
                 <span className="font-bold text-green-400">{stat.change}</span>
                 <span className="text-zinc-600 ml-2">Delta / 30D</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 overflow-visible p-8 bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[var(--radius)]">
           <h3 className="text-xs font-bold text-zinc-500 mb-10 uppercase tracking-[0.3em]">Institutional Growth</h3>
           <div className="w-full">
             {!loading && (
               <ResponsiveContainer width="100%" aspect={2.5}>
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 600}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 600}} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                     itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
                     cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                   />
                   <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.4)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               </ResponsiveContainer>
             )}
             {loading && (
               <div className="w-full aspect-[2.5] flex items-center justify-center text-zinc-600 text-[10px] uppercase tracking-[0.4em] bg-white/[0.01] rounded-[var(--radius)] border border-white/5">
                 Matrix Synchronization...
               </div>
             )}
           </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-8 bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[var(--radius)]">
           <h3 className="text-xs font-bold text-zinc-500 mb-10 uppercase tracking-[0.3em]">Ledger Events</h3>
           <div className="space-y-8">
               {(recentActivity.length > 0 ? recentActivity : [
                 { title: 'No Ledger Events', desc: 'Awaiting first transaction sequence', amount: null, time: '', type: 'info' }
               ]).map((activity, i) => (
                 <div key={i} className="flex gap-6 items-start">
                    <div className="bg-white/5 p-3 rounded-[var(--radius)] text-zinc-400 border border-white/5 h-10 w-10 flex items-center justify-center shrink-0">
                       <Clock size={16} />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-white tracking-tight">{activity.title}</p>
                       <p className="text-xs text-zinc-500 mt-1 font-medium">{activity.desc}</p>
                       <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-widest">{activity.time}</p>
                    </div>
                    {activity.amount && (
                       <div className={`text-sm font-bold tracking-tighter ${activity.type === 'positive' ? 'text-green-400' : 'text-white'}`}>
                          {activity.amount}
                       </div>
                    )}
                 </div>
              ))}
           </div>
           <Button variant="ghost" className="w-full mt-12 text-[10px] tracking-[0.3em] font-bold uppercase border border-white/5 hover:bg-white/5 py-6">Audit All Events</Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
