import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight, 
  Briefcase, 
  Clock, 
  Filter, 
  ChevronDown, 
  Info,
  Layers,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import exchangeService from '../services/exchangeService';
import propertyService from '../services/propertyService';

const SecondaryMarket = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, holdings, history
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  
  // Form State
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [ipoQuantity, setIpoQuantity] = useState('');
  
  // Initial Fetch
  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        const [projectsData, holdingsData, ordersData] = await Promise.all([
          propertyService.getProperties('active'),
          exchangeService.getPortfolio(),
          exchangeService.getOpenOrders('open')
        ]);
        
        setProjects(projectsData);
        setHoldings(holdingsData);
        setOpenOrders(ordersData);
        
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, []);

  // Fetch Project Specific Data (Trade History)
  useEffect(() => {
    if (!selectedProject) return;

    const fetchProjectData = async () => {
      try {
        const history = await exchangeService.getTradeHistory(selectedProject.id);
        setTradeHistory(history);
      } catch (error) {
        console.error("Failed to fetch trade history", error);
      }
    };

    fetchProjectData();
    // Live update simulation via polling
    const interval = setInterval(fetchProjectData, 5000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProject || !quantity || !price) return;

    try {
      await exchangeService.placeOrder({
        project_id: selectedProject.id,
        order_type: orderType,
        quantity: parseInt(quantity),
        price_per_brick: parseFloat(price)
      });
      // Refresh orders
      const orders = await exchangeService.getOpenOrders('open');
      setOpenOrders(orders);
      // Reset form
      setQuantity('');
      setPrice('');
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Failed to place order", error);
      alert(error.response?.data?.detail || "Order failed");
    }
  };

  // Handle IPO Subscription
  const handleIPOSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedProject || !ipoQuantity) return;

    try {
      await exchangeService.subscribeToIPO(selectedProject.id, parseInt(ipoQuantity));
      // Refresh holdings
      const holdingsData = await exchangeService.getPortfolio();
      setHoldings(holdingsData);
      setIpoQuantity('');
      alert("IPO Subscription successful!");
    } catch (error) {
      console.error("IPO Subscription failed", error);
      alert(error.response?.data?.detail || "IPO failed");
    }
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (!tradeHistory.length) return [];
    return tradeHistory
      .slice()
      .reverse()
      .map(t => ({
        time: new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: t.price
      }));
  }, [tradeHistory]);

  const latestPrice = tradeHistory.length > 0 ? tradeHistory[0].price : (selectedProject?.market_price || 0);

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-none border-2 border-white/10 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-heading uppercase">
            Secondary <span className="text-white/40">Market</span>
          </h1>
          <p className="mt-2 text-sm text-white/40 max-w-lg">
            Institutional-grade equity exchange for modular real estate. Buy, sell, and manage your Bricks with real-time liquidity matching.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#111] p-1 border border-white/5">
          {['marketplace', 'holdings', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-white text-black' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'marketplace' && (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Project Selection & Chart - Left 8 Units */}
            <div className="lg:col-span-8 space-y-6">
              <Card noPadding className="relative overflow-visible">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                  <div className="relative group">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Active Project</label>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                        {selectedProject?.title || "Select Project"}
                      </h2>
                      <ChevronDown size={16} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    {/* Simplified Custom Dropdown */}
                    <select 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={selectedProject?.id || ''}
                      onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-8">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 block">Market Value</span>
                      <span className="text-2xl font-bold text-white">₹{latestPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 block">Total Supply</span>
                      <span className="text-2xl font-bold text-white/40">{selectedProject?.total_bricks || 0} BK</span>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] w-full p-6 pt-12">
                  <div className="absolute top-32 left-12 flex items-center gap-2 z-10">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Exchange Feed</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} 
                        dy={10}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} 
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="stepAfter" 
                        dataKey="price" 
                        stroke="#fff" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* IPO Section */}
              <Card className="border-l-4 border-l-white/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-white/40" />
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Primary Market Access</h3>
                    </div>
                    <p className="text-xs text-white/40">
                      Participate in the Initial Project Offering (IPO). Purchase Equity Bricks directly from the project developer at the fixed listing price.
                    </p>
                  </div>
                  <form onSubmit={handleIPOSubscribe} className="flex gap-2 w-full md:w-auto">
                    <Input 
                      placeholder="BK Qty" 
                      className="w-24 md:w-32" 
                      type="number"
                      value={ipoQuantity}
                      onChange={(e) => setIpoQuantity(e.target.value)}
                    />
                    <Button type="submit" className="whitespace-nowrap">Subscribe IPO</Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Trading Desk - Right 4 Units */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="flex flex-col h-full">
                <div className="mb-8">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Order Execution</h3>
                  <div className="flex bg-white/5 p-1 border border-white/5">
                    <button 
                      onClick={() => setOrderType('buy')}
                      className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${orderType === 'buy' ? 'bg-white text-black' : 'text-white/40'}`}
                    >
                      BUY ASSET
                    </button>
                    <button 
                      onClick={() => setOrderType('sell')}
                      className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${orderType === 'sell' ? 'bg-red-500 text-white' : 'text-white/40'}`}
                    >
                      SELL ASSET
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-6 flex-1">
                  <div className="space-y-4">
                    <Input 
                      label="Limit Price (₹)" 
                      placeholder="Enter brick price" 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      helperText={`Market: ₹${latestPrice.toLocaleString()}`}
                    />
                    <Input 
                      label="Quantity (BK)" 
                      placeholder="Number of bricks" 
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      helperText={`Estimated Total: ₹${(parseFloat(price || 0) * parseInt(quantity || 0)).toLocaleString()}`}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white/30">Exchange Fee (0.1%)</span>
                      <span className="text-white/60">₹{(parseFloat(price || 0) * parseInt(quantity || 0) * 0.001).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold mb-6">
                      <span className="text-white/40 uppercase tracking-tighter">Total Impact</span>
                      <span className="text-white">₹{(parseFloat(price || 0) * parseInt(quantity || 0) * 1.001).toLocaleString()}</span>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-16 text-sm flex items-center gap-3"
                      variant={orderType === 'buy' ? 'primary' : 'danger'}
                    >
                      <ArrowLeftRight size={18} />
                      {orderType === 'buy' ? 'CONFIRM PURCHASE' : 'CONFIRM LIQUIDATION'}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3">
                  <Info size={16} className="text-white/20 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                    Orders are matched instantly against existing liquidity. Circuit breakers (+20%/-10%) apply to ensure market stability.
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Other tabs placeholder */}
        {activeTab === 'holdings' && (
          <motion.div 
            key="holdings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card noPadding>
              <div className="p-8 border-b border-white/5">
                <h3 className="text-xl font-bold uppercase tracking-tight">Brick Portfolio</h3>
                <p className="text-xs text-white/40 mt-1">Legally backed equity holdings across the EstateX ecosystem.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="p-6 md:p-8">Project</th>
                      <th className="p-6 md:p-8">Holdings</th>
                      <th className="p-6 md:p-8">Avg. Price</th>
                      <th className="p-6 md:p-8">Market Value</th>
                      <th className="p-6 md:p-8">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">
                          No brick holdings found in the vault.
                        </td>
                      </tr>
                    ) : holdings.map(h => {
                      const proj = projects.find(p => p.id === h.project_id);
                      return (
                        <tr key={h.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                          <td className="p-6 md:p-8">
                            <span className="block font-bold text-white uppercase">{proj?.title || 'Unknown Project'}</span>
                            <span className="text-[10px] text-white/30 truncate block max-w-[200px]">{h.project_id}</span>
                          </td>
                          <td className="p-6 md:p-8 font-mono text-white/60">{h.quantity} BK</td>
                          <td className="p-6 md:p-8 font-mono text-white/60">₹{proj?.market_price?.toLocaleString() || '---'}</td>
                          <td className="p-6 md:p-8">
                             <span className="block font-bold text-white">₹{(h.quantity * (proj?.market_price || 0)).toLocaleString()}</span>
                             <span className="text-[10px] text-green-500 font-bold">+0.00%</span>
                          </td>
                          <td className="p-6 md:p-8">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] tracking-widest border border-white/10"
                              onClick={() => { setSelectedProject(proj); setActiveTab('marketplace'); setOrderType('sell'); }}
                            >
                              TRADE
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card noPadding>
               <div className="p-8 border-b border-white/5">
                <h3 className="text-xl font-bold uppercase tracking-tight">Active Market Intents</h3>
                <p className="text-xs text-white/40 mt-1">Your open buy and sell orders currently waiting for matcher execution.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="p-6 md:p-8">Asset</th>
                      <th className="p-6 md:p-8">Type</th>
                      <th className="p-6 md:p-8">Qty/Price</th>
                      <th className="p-6 md:p-8">Unfilled</th>
                      <th className="p-6 md:p-8">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">
                          No active orders in the orderbook.
                        </td>
                      </tr>
                    ) : openOrders.map(o => {
                      const proj = projects.find(p => p.id === o.project_id);
                      return (
                        <tr key={o.id} className="border-b border-white/5">
                          <td className="p-6 md:p-8 font-bold uppercase">{proj?.title || 'N/A'}</td>
                          <td className="p-6 md:p-8">
                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest ${o.order_type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {o.order_type}
                            </span>
                          </td>
                          <td className="p-6 md:p-8">
                            <span className="block text-white font-mono">{o.quantity} BK</span>
                            <span className="text-[10px] text-white/40">AT ₹{o.price_per_brick.toLocaleString()}</span>
                          </td>
                          <td className="p-6 md:p-8 font-mono text-white/40">{o.unfilled_quantity} BK</td>
                          <td className="p-6 md:p-8">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{o.status}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'history' && (
           <motion.div 
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
           >
              <Card noPadding>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Public Trade Ledger</h3>
                    <p className="text-xs text-white/40 mt-1">Immutable record of all matched liquidity events.</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <Filter size={14} />
                    Filters Applied: <span className="text-white">{selectedProject?.title}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                        <th className="p-6 md:p-8">Execution ID</th>
                        <th className="p-6 md:p-8">Timestamp</th>
                        <th className="p-6 md:p-8">Quantity</th>
                        <th className="p-6 md:p-8">Match Price</th>
                        <th className="p-6 md:p-8">Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeHistory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">
                            No market matches documented for this asset.
                          </td>
                        </tr>
                      ) : tradeHistory.map(t => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <td className="p-6 md:p-8 font-mono text-white/40 text-[10px] uppercase">{t.id.substring(0, 18)}...</td>
                          <td className="p-6 md:p-8 text-xs text-white/60 font-mono">
                            {new Date(t.executed_at).toLocaleDateString()} {new Date(t.executed_at).toLocaleTimeString()}
                          </td>
                          <td className="p-6 md:p-8 font-bold text-white">{t.quantity} BK</td>
                          <td className="p-6 md:p-8 font-bold text-white">₹{t.price.toLocaleString()}</td>
                          <td className="p-6 md:p-8">
                             <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-green-500 bg-green-500/5 py-1 px-2 border border-green-500/20 w-fit">
                               <Layers size={10} /> Verified Match
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecondaryMarket;
