import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Wallet, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState({
    wallet: { balance: 0, recent_transactions: [] },
    portfolio: []
  });

  React.useEffect(() => {
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
    fetchDashboard();
  }, []);

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
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white font-heading">
            Welcome back, {user?.email || 'Investor'}!
          </h1>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Here's what's happening with your property portfolio today.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/properties">
             <Button variant="outline">Browse Markets</Button>
           </Link>
           {user?.role === 'builder' && (
             <Link to="/dashboard/add-property">
               <Button>Add New Project</Button>
             </Link>
           )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{stat.title}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-secondary-900 dark:text-white font-heading">{stat.value}</span>
              </div>
              <div className="mt-2 flex items-center text-sm">
                 <ArrowUpRight size={16} className="text-green-500 mr-1" />
                 <span className="font-medium text-green-500">{stat.change}</span>
                 <span className="text-secondary-400 ml-1">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
           <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4 font-heading">Portfolio Performance</h3>
           <div className="h-72 w-full min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{ stroke: '#c4b5fd', strokeWidth: 1, strokeDasharray: '4 4' }}
                 />
                 <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </Card>

        {/* Recent Activity */}
        <Card>
           <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6 font-heading">Recent Activity</h3>
           <div className="space-y-6">
               {(recentActivity.length > 0 ? recentActivity : [
                 { title: 'No recent activity', desc: 'Your transactions will appear here', amount: null, time: '', type: 'info' }
               ]).map((activity, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-secondary-100 p-2 rounded-full text-secondary-500 dark:bg-slate-800 dark:text-secondary-400 h-8 w-8 flex items-center justify-center shrink-0">
                       <Clock size={14} />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-semibold text-secondary-900 dark:text-white">{activity.title}</p>
                       <p className="text-xs text-secondary-500 dark:text-secondary-400">{activity.desc}</p>
                       <p className="text-xs text-secondary-400 mt-1">{activity.time}</p>
                    </div>
                    {activity.amount && (
                       <div className={`text-sm font-semibold ${activity.type === 'positive' ? 'text-green-500' : 'text-secondary-900 dark:text-white'}`}>
                          {activity.amount}
                       </div>
                    )}
                 </div>
              ))}
           </div>
           <Button variant="ghost" className="w-full mt-6 text-primary-600 dark:text-primary-400">View All Activity</Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
