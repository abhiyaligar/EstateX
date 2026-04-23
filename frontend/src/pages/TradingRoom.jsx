import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  X,
  Edit2,
  Trash2,
  Maximize2,
  LineChart,
  BarChart3,
  History,
  ArrowLeft,
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import exchangeService from '../services/exchangeService';
import propertyService from '../services/propertyService';

// --- Sub-Components ---

const OrderBookRow = ({ price, quantity, type, isHeader = false, total = 0, maxTotal = 1 }) => (
  <div className="relative group overflow-hidden">
    {/* Relative depth bar background */}
    {!isHeader && (
      <div 
        className={`absolute inset-0 opacity-10 transition-transform duration-500 ease-out origin-right ${type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ transform: `scaleX(${total / maxTotal})` }}
      />
    )}
    <div className={`grid grid-cols-2 relative z-10 text-[10px] py-1.5 px-4 transition-colors ${!isHeader ? 'hover:bg-white/5' : 'text-zinc-600 uppercase tracking-widest font-bold'}`}>
      <span className={isHeader ? '' : type === 'buy' ? 'text-green-400 font-mono font-bold' : 'text-red-400 font-mono font-bold'}>
        {isHeader ? 'Price' : `₹${price.toLocaleString()}`}
      </span>
      <span className={`text-right ${isHeader ? '' : 'text-zinc-400 font-mono'}`}>
         {isHeader ? 'Quantity' : `${quantity} BK`}
      </span>
    </div>
  </div>
);

const TradeHistoryRow = ({ price, quantity, time, type }) => (
  <div className="flex items-center justify-between text-[10px] py-2 px-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
     <div className="flex items-center gap-2">
        <div className={`w-1 h-1 rounded-full ${type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`font-mono font-medium ${type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>₹{price.toLocaleString()}</span>
     </div>
     <span className="text-zinc-500 font-mono">{quantity} BK</span>
     <span className="text-zinc-700 text-[8px] font-medium">{time}</span>
  </div>
);

const ProjectSelector = ({ projects, selectedProject, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-zinc-900 border border-white/5 px-4 md:px-6 py-4 rounded-[var(--radius)] hover:border-white/20 transition-all group w-full md:w-auto"
      >
        <div className="h-8 w-8 bg-white flex items-center justify-center rounded-[var(--radius)]">
          <Layers size={16} className="text-black" />
        </div>
        <div className="text-left">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold leading-none mb-1">Select Asset Cluster</p>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold uppercase tracking-tight text-white">{selectedProject?.title || 'Select Project'}</h2>
            <ChevronDown size={14} className={`text-zinc-700 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-72 bg-[#111] border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-white/5 bg-black/40">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Search properties..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-md py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-white/20 text-white placeholder:text-zinc-700"
                    autoFocus
                  />
               </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { onSelect(p); setIsOpen(false); setSearchQuery(''); }}
                            className={`w-full text-left p-4 hover:bg-white/5 flex items-center justify-between group transition-colors ${selectedProject?.id === p.id ? 'bg-white/5' : ''}`}
                        >
                            <div>
                                <p className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-primary-400">{p.title}</p>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">₹{p.market_price?.toLocaleString()} / BK</p>
                            </div>
                            {selectedProject?.id === p.id && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                        </button>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-700 font-bold">No assets found</p>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

const TradingRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [publicOrderBook, setPublicOrderBook] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  
  // UI State
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  
  const [chartTimeframe, setChartTimeframe] = useState('1H');

  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        const projectsData = await propertyService.getProperties('active');
        setProjects(projectsData);
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

  const refreshLiveData = async () => {
    if (!selectedProject) return;
    try {
      const [history, book] = await Promise.all([
        exchangeService.getTradeHistory(selectedProject.id),
        exchangeService.getPublicOrderBook(selectedProject.id)
      ]);
      setTradeHistory(history);
      setPublicOrderBook(book);
    } catch (error) {
      console.error("Live data fetch failed", error);
    }
  };

  useEffect(() => {
    refreshLiveData();
    const interval = setInterval(refreshLiveData, 3000); 
    return () => clearInterval(interval);
  }, [selectedProject]);

  // Calculations
  const buyOrders = useMemo(() => {
    const orders = publicOrderBook.filter(o => o.order_type === 'buy').sort((a,b) => b.price_per_brick - a.price_per_brick);
    let total = 0;
    return orders.map(o => {
        total += o.unfilled_quantity;
        return { ...o, cumulativeTotal: total };
    });
  }, [publicOrderBook]);

  const sellOrders = useMemo(() => {
    const orders = publicOrderBook.filter(o => o.order_type === 'sell').sort((a,b) => a.price_per_brick - b.price_per_brick);
    let total = 0;
    return orders.map(o => {
        total += o.unfilled_quantity;
        return { ...o, cumulativeTotal: total };
    });
  }, [publicOrderBook]);

  const maxDepth = useMemo(() => {
    const buyTotal = buyOrders.length > 0 ? buyOrders[buyOrders.length - 1].cumulativeTotal : 0;
    const sellTotal = sellOrders.length > 0 ? sellOrders[sellOrders.length - 1].cumulativeTotal : 0;
    return Math.max(buyTotal, sellTotal, 1);
  }, [buyOrders, sellOrders]);

  const chartData = useMemo(() => {
    if (!tradeHistory.length) return [];
    return tradeHistory.slice().reverse().map(t => ({
      time: new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: t.price,
      vol: t.quantity
    }));
  }, [tradeHistory]);

  const latestPrice = tradeHistory.length > 0 ? tradeHistory[0].price : (selectedProject?.market_price || 0);
  const priceChange = tradeHistory.length > 1 ? ((tradeHistory[0].price - tradeHistory[1].price) / tradeHistory[1].price * 100).toFixed(2) : 0;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProject || !quantity || !price) return;
    try {
      setIsPlacing(true);
      await exchangeService.placeOrder({
        project_id: selectedProject.id,
        order_type: orderType,
        quantity: parseInt(quantity),
        price_per_brick: parseFloat(price)
      });
      setQuantity('');
      // Notification would go here
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlacing(false);
      refreshLiveData();
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-white/5 border-t-white animate-spin mx-auto rounded-full" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Synchronizing Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
        {/* Header Bar */}
        <header className="h-auto md:h-20 border-b border-white/5 px-4 md:px-6 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/50 backdrop-blur-xl shrink-0 z-30">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)} 
                    className="mr-2 border border-white/5 bg-white/5 hover:bg-white/10 hidden md:flex"
                    leftIcon={<ArrowLeft size={14} />}
                >
                    Return
                </Button>
                
                {/* Mobile Back Button */}
                <div className="flex items-center justify-between w-full md:hidden">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-white text-black font-bold text-xs">
                        EX
                    </div>
                </div>

                <ProjectSelector 
                    projects={projects} 
                    selectedProject={selectedProject} 
                    onSelect={setSelectedProject} 
                />
                
                <div className="flex gap-6 md:gap-12 border-l border-white/5 pl-6 w-full md:w-auto overflow-x-auto">
                    <div className="space-y-1 shrink-0">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Mark Price</p>
                        <div className="flex items-center gap-2">
                             <span className="text-base md:text-lg font-mono font-bold tracking-tighter">₹{latestPrice.toLocaleString()}</span>
                             <span className={`text-[10px] font-bold ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                             </span>
                        </div>
                    </div>
                    <div className="space-y-1 shrink-0">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">24h Vol</p>
                        <span className="text-sm font-mono font-medium text-zinc-300">1,248.50 BK</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-full">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Market Live</span>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full"><Activity size={18} /></Button>
            </div>
        </header>

        {/* Main Terminal Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            {/* Left Column: Charts */}
            <div className="w-full md:flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/5 overflow-hidden min-h-[400px]">
                {/* Price Chart Section */}
                <div className="flex-1 flex flex-col min-h-0 bg-black/20">
                    <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between shrink-0">
                        <div className="flex gap-1">
                            {['1M', '5M', '1H', '1D', '1W'].map(tf => (
                                <button 
                                    key={tf}
                                    onClick={() => setChartTimeframe(tf)}
                                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${chartTimeframe === tf ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                             <button className="text-zinc-600 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="tradingGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05}/>
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#3f3f46', fontSize: 9, fontWeight: 600}} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    domain={['auto', 'auto']} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#3f3f46', fontSize: 9, fontWeight: 600}}
                                    orientation="right"
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' || 700 }}
                                />
                                <Area 
                                    type="stepAfter" 
                                    dataKey="price" 
                                    stroke="#fff" 
                                    strokeWidth={1.5} 
                                    fillOpacity={1} 
                                    fill="url(#tradingGradient)" 
                                    animationDuration={500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volume Section */}
                <div className="h-40 border-t border-white/5 bg-black/40 shrink-0">
                    <div className="h-8 px-6 flex items-center border-b border-white/5">
                        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-700 font-bold">Transaction Volume</p>
                    </div>
                    <div className="h-full w-full px-6 py-4">
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={chartData}>
                                <Bar dataKey="vol" fill="#18181b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle Column: Orderbook */}
            <div className="w-full md:w-80 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40 shrink-0 min-h-[300px]">
                <div className="h-12 border-b border-white/5 px-6 flex items-center shrink-0">
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2">
                        <BarChart3 size={12} className="text-zinc-600" />
                        Orderbook
                    </h3>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <OrderBookRow isHeader />
                    
                    {/* Sell Orders (Asks) - Red */}
                    <div className="overflow-hidden flex flex-col-reverse justify-end">
                        {sellOrders.map((o, i) => (
                            <OrderBookRow 
                                key={i} 
                                price={o.price_per_brick} 
                                quantity={o.unfilled_quantity} 
                                type="sell" 
                                total={o.cumulativeTotal}
                                maxTotal={maxDepth}
                            />
                        ))}
                    </div>

                    {/* Spread Section */}
                    <div className="py-4 my-2 border-y border-white/5 bg-black/60 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-mono font-bold tracking-tighter text-white">₹{latestPrice.toLocaleString()}</span>
                            <div className={`h-2 w-2 rounded-full ${parseFloat(priceChange) >= 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mt-1">Real-time Matcher Spread</p>
                    </div>

                    {/* Buy Orders (Bids) - Green */}
                    <div className="overflow-hidden">
                         {buyOrders.map((o, i) => (
                            <OrderBookRow 
                                key={i} 
                                price={o.price_per_brick} 
                                quantity={o.unfilled_quantity} 
                                type="buy" 
                                total={o.cumulativeTotal}
                                maxTotal={maxDepth}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Trade Input & Recent Trades */}
            <div className="w-full md:w-96 flex flex-col bg-black shrink-0 min-h-[500px]">
                {/* Trade Form */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5 mb-8">
                        <button 
                            onClick={() => setOrderType('buy')} 
                            className={`flex-1 py-4 text-[10px] font-bold uppercase rounded-md tracking-[0.2em] transition-all ${orderType === 'buy' ? 'bg-white text-black shadow-2xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            BUY BRICK
                        </button>
                        <button 
                            onClick={() => setOrderType('sell')} 
                            className={`flex-1 py-4 text-[10px] font-bold uppercase rounded-md tracking-[0.2em] transition-all ${orderType === 'sell' ? 'bg-red-500 text-white shadow-2xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            SELL BRICK
                        </button>
                    </div>

                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Price Limit</label>
                                <span className="text-[10px] font-mono text-zinc-700">₹ INR</span>
                             </div>
                             <input 
                                type="number" 
                                step="0.01" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-[#111] border border-white/5 h-14 px-6 text-base font-mono focus:border-white/20 transition-all focus:outline-none"
                                placeholder="0.00"
                             />
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Quantity</label>
                                <span className="text-[10px] font-mono text-zinc-700">BK BRICK</span>
                             </div>
                             <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-[#111] border border-white/5 h-14 px-6 text-base font-mono focus:border-white/20 transition-all focus:outline-none"
                                placeholder="0"
                             />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5 border-dashed">
                             <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Total Position</p>
                             <p className="text-sm font-mono font-bold text-white">₹{((parseFloat(price) || 0) * (parseInt(quantity) || 0)).toLocaleString()}</p>
                        </div>

                        <Button 
                            type="submit" 
                            size="lg"
                            isLoading={isPlacing}
                            variant={orderType === 'buy' ? 'primary' : 'danger'} 
                            className="w-full shadow-2xl tracking-[0.3em] font-bold py-8 text-xs"
                        >
                            {orderType === 'buy' ? 'Execute Acquisition' : 'Execute Divestment'}
                        </Button>
                    </form>
                </div>

                {/* Ledger / Recent Trades */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="h-12 border-b border-white/5 px-8 flex items-center justify-between shrink-0">
                        <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2">
                            <History size={12} className="text-zinc-600" />
                            Recent Trades
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tradeHistory.slice(0, 50).map((t, i) => (
                            <TradeHistoryRow 
                                key={i} 
                                price={t.price} 
                                quantity={t.quantity} 
                                time={new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                type={t.type || (i % 2 === 0 ? 'buy' : 'sell')} // Mock type if missing
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TradingRoom;
