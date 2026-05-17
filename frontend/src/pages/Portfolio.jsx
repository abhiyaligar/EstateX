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
          <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-[-0.05em] leading-[0.9]">
            My Portfolio
          </h1>
          <p className="mt-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground/40 max-w-xl">
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
        <div className="bg-foreground/[0.04] p-4 md:p-6 border border-border flex items-center gap-4 min-w-[240px]">
           <div className="bg-foreground/5 p-3 flex items-center justify-center text-foreground/40">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] text-foreground/30 uppercase font-black tracking-[0.2em] mb-1">Total Holdings</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">
                ₹{totalValue.toLocaleString()}
              </p>
           </div>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <Card className="bg-foreground/[0.04] border-border rounded-none">
                <div className="p-4 border-b border-border flex items-center gap-3">
                   <PieChartIcon size={16} className="text-foreground/40" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Exposure by City</h3>
                </div>
                <div className="h-[250px] p-4">
                   <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                         <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px', color: 'var(--color-foreground)' }} />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </Card>

             <Card className="bg-foreground/[0.04] border-border rounded-none">
                <div className="p-4 border-b border-border flex items-center gap-3">
                   <Building size={16} className="text-foreground/40" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Exposure by Property Type</h3>
                </div>
                <div className="h-[250px] p-4">
                   <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                         <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px', color: 'var(--color-foreground)' }} />
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
                <Card key={holding.id} className="hover:border-foreground/20 transition-all group bg-background border border-border rounded-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                      <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                        <img 
                          src={holding.project?.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                          alt={holding.project?.title}
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight group-hover:text-accent-orange transition-colors">
                              <Link to={`/properties/${holding.project_id}`}>{holding.project?.title}</Link>
                            </h3>
                            <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                              <Building size={14} className="text-foreground/20" /> {holding.project?.location?.city}, {holding.project?.location?.state}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                            <div>
                              <p className="text-[9px] text-foreground/30 uppercase font-black tracking-widest mb-1">Quantity</p>
                              <p className="text-lg font-bold text-foreground font-mono">{holding.quantity} <span className="text-[9px] text-foreground/30 uppercase tracking-widest ml-1">BK</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] text-foreground/30 uppercase font-black tracking-widest mb-1">Market Price</p>
                              <p className="text-lg font-bold text-foreground font-mono">₹{currentPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-foreground/30 uppercase font-black tracking-widest mb-1">Profit/Loss</p>
                              <div className={`flex items-center gap-1 text-sm font-bold font-mono ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {profit >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()} ({profitPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-border flex justify-end">
                          <Link to={`/properties/${holding.project_id}`}>
                            <Button variant="outline" className="text-[9px] uppercase tracking-[0.2em] h-10 px-4 rounded-none border-border hover:bg-foreground/5 hover:text-foreground">
                              VIEW PROJECT DETAILS <ArrowRight size={14} className="ml-2" />
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
            <Card className="p-12 text-center bg-foreground/[0.02] border-border border-dashed rounded-none">
              <div className="w-16 h-16 bg-foreground/5 flex items-center justify-center mx-auto mb-6">
                <Building size={32} className="text-foreground/20" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading uppercase tracking-tight">Your portfolio is empty</h3>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-8 max-w-sm mx-auto">
                You haven't invested in any real estate projects yet. Start by browsing the market.
              </p>
              <Link to="/ipo">
                <Button variant="primary" className="text-[10px] font-bold tracking-[0.2em] uppercase rounded-none h-12 px-8">BROWSE IPO CENTER</Button>
              </Link>
            </Card>
          )
        ) : (
           <Card className="p-0 overflow-hidden bg-background border-border rounded-none">
              <table className="w-full text-left">
                 <thead className="bg-foreground/[0.02] border-b border-border">
                    <tr className="text-[9px] uppercase tracking-[0.2em] font-black text-foreground/40">
                       <th className="px-6 py-4">Asset Node</th>
                       <th className="px-6 py-4">Cycle Period</th>
                       <th className="px-6 py-4">Mature Bricks</th>
                       <th className="px-6 py-4">Yield Output</th>
                       <th className="px-6 py-4">Settlement Date</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td colSpan="5" className="px-6 py-24 text-center text-foreground/30 uppercase font-black tracking-widest text-[10px]">
                          No revenue yields recorded in the active ledger.
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
