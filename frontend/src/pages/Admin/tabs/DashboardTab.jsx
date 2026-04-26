import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Clock, 
  Shield, 
  Lock, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import StatCard from '../components/StatCard';

const DashboardTab = ({ stats }) => {
  const [chartMetric, setChartMetric] = React.useState('volume');

  // Use real data from DB if available, otherwise fallback to high-fidelity simulation
  const historyData = stats?.growth_history?.length > 0 ? stats.growth_history : [
    { name: 'Jan', users: 400, volume: 2400 },
    { name: 'Feb', users: 800, volume: 3600 },
    { name: 'Mar', users: 1200, volume: 3200 },
    { name: 'Apr', users: 1900, volume: 4800 },
    { name: 'May', users: 2400, volume: 5200 },
    { name: 'Jun', users: 3100, volume: 6100 },
  ];

  const pieData = [
    { name: 'Locked', value: stats?.total_investments_locked_inr || 0, color: '#10b981' },
    { name: 'Escrow', value: stats?.total_platform_escrow || 0, color: '#ef4444' },
    { name: 'Projects', value: stats?.projects_active * 100000 || 0, color: '#3b82f6' },
  ];

  return (
    <motion.div 
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
         {/* Main Chart */}
         <Card className="lg:col-span-8 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                  <TrendingUp className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Growth Intelligence</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Protocol Adoption & Volume Matrix</p>
                </div>
              </div>
              <div className="flex bg-white/5 p-1 rounded-lg">
                <button 
                  onClick={() => setChartMetric('volume')}
                  className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded transition-colors ${chartMetric === 'volume' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Volume
                </button>
                <button 
                  onClick={() => setChartMetric('users')}
                  className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded transition-colors ${chartMetric === 'users' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Users
                </button>
              </div>
            </div>

            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff20" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ dy: 10 }}
                    />
                    <YAxis 
                      stroke="#ffffff20" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => chartMetric === 'volume' ? `₹${value/1000}k` : value}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', fontSize: '10px', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey={chartMetric} stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Distribution Chart */}
         <Card className="lg:col-span-4 p-8 flex flex-col items-center justify-center text-center">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">Capital Distribution</h4>
            <div className="h-[240px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', fontSize: '10px', borderRadius: '8px' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-widest text-white/30">Total</span>
                  <span className="text-lg font-bold">₹{(stats?.total_platform_escrow + stats?.total_investments_locked_inr || 0).toLocaleString()}</span>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
               {pieData.map(item => (
                 <div key={item.name} className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                    <span className="text-[8px] uppercase tracking-widest text-white/40">{item.name}</span>
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="p-8">
             <div className="flex items-center gap-3 mb-6">
                <Activity size={18} className="text-primary-500" />
                <h4 className="text-sm font-bold uppercase tracking-widest">Protocol Shortcuts</h4>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-[9px] h-12 uppercase tracking-widest border-white/5 hover:bg-white/5">Export Audit</Button>
                <Button variant="outline" className="text-[9px] h-12 uppercase tracking-widest border-white/5 hover:bg-white/5">Flush Cache</Button>
                <Button variant="outline" className="text-[9px] h-12 uppercase tracking-widest border-white/5 hover:bg-white/5">Sync Chain</Button>
                <Button variant="outline" className="text-[9px] h-12 uppercase tracking-widest border-white/5 hover:bg-white/5">Force Refresh</Button>
             </div>
          </Card>

          {/* System Health / Emergency */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/10 p-8 flex items-center justify-between">
              <div className="space-y-4 max-w-md">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                     <AlertTriangle className="text-red-500" size={20} />
                   </div>
                   <h4 className="text-lg font-bold uppercase tracking-tighter">Emergency Global Freeze</h4>
                 </div>
                 <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest">
                   Authorized protocol override to halt all exchange operations, cancel pending orders, and lock user withdrawals in case of critical node failure or attack.
                 </p>
              </div>
              <Button variant="danger" className="h-14 px-10 text-[10px] font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(239,44,44,0.2)]">EXECUTE FREEZE</Button>
          </Card>
      </div>
    </motion.div>
  );
};

export default DashboardTab;
