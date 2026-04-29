import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { exchangeService } from '../services/exchangeService';
import { Building, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const data = await exchangeService.getPortfolio();
        setHoldings(data);
      } catch (error) {
        console.error("Failed to fetch portfolio", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHoldings();
  }, []);

  const [activeView, setActiveView] = useState('assets'); // 'assets' or 'revenue'

  const totalValue = holdings.reduce((acc, curr) => acc + (curr.quantity * (curr.project?.financial?.market_value || 0)), 0);

  // Asset Allocation Calculations
  const cityAllocation = React.useMemo(() => {
    const data = {};
    holdings.forEach(h => {
       const city = h.project?.location?.city || 'Unknown';
       const val = h.quantity * (h.project?.financial?.market_value || 0);
       data[city] = (data[city] || 0) + val;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [holdings]);

  const typeAllocation = React.useMemo(() => {
    const data = {};
    holdings.forEach(h => {
       const type = h.project?.property_type || 'Unknown';
       const val = h.quantity * (h.project?.financial?.market_value || 0);
       data[type] = (data[type] || 0) + val;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [holdings]);

  const COLORS = ['#8b5cf6', '#38bdf8', '#22c55e', '#f59e0b', '#ec4899'];

  if (loading) return <div className="py-24"><Loader size={48} text="Loading your assets..." /></div>;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white font-heading">
            My Portfolio
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Track your fractional real estate investments and performance.
          </p>
          <div className="flex gap-2 mt-6">
             <Button 
               variant={activeView === 'assets' ? 'primary' : 'outline'} 
               size="sm" 
               className="text-xs font-bold tracking-widest uppercase h-9"
               onClick={() => setActiveView('assets')}
             >
               ASSET NODES
             </Button>
             <Button 
               variant={activeView === 'revenue' ? 'primary' : 'outline'} 
               size="sm" 
               className="text-xs font-bold tracking-widest uppercase h-9"
               onClick={() => setActiveView('revenue')}
             >
               REVENUE EARNINGS
             </Button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
           <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-xl text-primary-600 dark:text-primary-400">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-xs text-secondary-500 uppercase font-bold tracking-wider">Total Holdings</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">
                ₹{totalValue.toLocaleString()}
              </p>
           </div>
        </div>
      </div>

      {holdings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <Card>
                <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 flex items-center gap-2">
                   <PieChartIcon size={16} className="text-primary-500" />
                   <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-900 dark:text-white">Exposure by City</h3>
                </div>
                <div className="h-[250px] p-4">
                   <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
                      <PieChart>
                         <Pie
                           data={cityAllocation}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {cityAllocation.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </Card>

             <Card>
                <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 flex items-center gap-2">
                   <Building size={16} className="text-sky-500" />
                   <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-900 dark:text-white">Exposure by Property Type</h3>
                </div>
                <div className="h-[250px] p-4">
                   <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
                      <PieChart>
                         <Pie
                           data={typeAllocation}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {typeAllocation.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </Card>
          </div>
      )}

       <div className="grid grid-cols-1 gap-6">
        {activeView === 'assets' ? (
          holdings.length > 0 ? (
            holdings.map((holding) => {
              const currentPrice = holding.project?.financial?.market_value || 0;
              const avgPrice = holding.average_buy_price || 0;
              const profit = (currentPrice - avgPrice) * holding.quantity;
              const profitPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

              return (
                <Card key={holding.id} className="hover:border-primary-200 transition-all group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                        <img 
                          src={holding.project?.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={holding.project?.title}
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-secondary-900 dark:text-white hover:text-primary-600 transition-colors">
                              <Link to={`/properties/${holding.project_id}`}>{holding.project?.title}</Link>
                            </h3>
                            <p className="text-sm text-secondary-500 flex items-center gap-1 mt-1">
                              <Building size={14} /> {holding.project?.location?.city}, {holding.project?.location?.state}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                              <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Quantity</p>
                              <p className="font-bold text-secondary-900 dark:text-white">{holding.quantity} Bricks</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Market Price</p>
                              <p className="font-bold text-secondary-900 dark:text-white">₹{currentPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Profit/Loss</p>
                              <div className={`flex items-center gap-1 font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()} ({profitPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-secondary-50 dark:border-secondary-800 flex justify-end">
                          <Link to={`/properties/${holding.project_id}`}>
                            <Button variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-0 h-auto">
                              View Project Details <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="p-12 text-center bg-secondary-50/50 border-dashed dark:bg-slate-900/30">
              <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <Building size={32} className="text-secondary-300" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2 font-heading">Your portfolio is empty</h3>
              <p className="text-secondary-500 mb-8 max-w-sm mx-auto">
                You haven't invested in any real estate projects yet. Start by browsing the market.
              </p>
              <Link to="/properties">
                <Button size="lg" className="px-8">Browse Properties</Button>
              </Link>
            </Card>
          )
        ) : (
           <Card className="p-0 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-secondary-50 dark:bg-slate-800/50">
                    <tr className="text-[10px] uppercase tracking-widest font-bold text-secondary-400">
                       <th className="px-6 py-4">Asset</th>
                       <th className="px-6 py-4">Period</th>
                       <th className="px-6 py-4">Mature Bricks</th>
                       <th className="px-6 py-4">Payout Amount</th>
                       <th className="px-6 py-4">Date</th>
                    </tr>
                 </thead>
                 <tbody>
                    {/* In a real app, we'd fetch this from the user's transaction history filtered by type='rental_income_credit' */}
                    <tr>
                       <td colSpan="5" className="px-6 py-20 text-center text-secondary-400 uppercase tracking-widest text-xs italic">
                          No revenue earnings recorded yet. Rental income is distributed monthly for bricks held {'>'}30 days.
                       </td>
                    </tr>
                 </tbody>
              </table>
           </Card>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
