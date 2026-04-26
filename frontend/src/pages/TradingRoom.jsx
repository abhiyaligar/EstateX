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
  Shield,
  ArrowLeft,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createChart, ColorType, AreaSeries, HistogramSeries, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { supabase } from '../utils/supabaseClient';

import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import exchangeService from '../services/exchangeService';
import propertyService from '../services/propertyService';
import governanceService from '../services/governanceService';
import { walletService } from '../services/walletService';
import Toast from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';

// --- Sub-Components ---

const OrderBookRow = ({ price, quantity, type, isHeader = false, total = 0, maxTotal = 1, onClick }) => (
  <div 
    className="relative group overflow-hidden cursor-pointer"
    onClick={() => !isHeader && onClick && onClick(price)}
  >
    {/* Relative depth bar background */}
    {!isHeader && (
      <div 
        className={`absolute inset-0 opacity-10 transition-transform duration-500 ease-out origin-right ${type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ transform: `scaleX(${total / maxTotal})` }}
      />
    )}
    <div className="flex justify-between items-center h-7 px-3 md:px-5 relative z-10">
      <span className={`text-[10px] md:text-[11px] font-mono font-bold ${isHeader ? 'text-zinc-600' : type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
        {isHeader ? 'PRICE' : `₹${price.toLocaleString()}`}
      </span>
      <span className={`text-[10px] md:text-[11px] font-mono font-bold ${isHeader ? 'text-zinc-600' : 'text-zinc-300'}`}>
        {isHeader ? 'QUANTITY' : quantity.toLocaleString()}
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

const TradeForm = ({ 
    orderType, 
    setOrderType, 
    price, 
    setPrice, 
    quantity, 
    setQuantity, 
    handlePlaceOrder, 
    isPlacing, 
    handleQuickFillQuantity,
    latestPrice
}) => (
    <form onSubmit={handlePlaceOrder} className="space-y-6">
        {/* Buy/Sell Segmented Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
            <button 
                type="button"
                onClick={() => setOrderType('buy')} 
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-lg relative ${orderType === 'buy' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
                {orderType === 'buy' && (
                    <motion.div layoutId="orderTypeBg" className="absolute inset-0 bg-green-500/10 border border-green-500/20 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.1)]" />
                )}
                <span className="relative z-10">Acquisition</span>
            </button>
            <button 
                type="button"
                onClick={() => setOrderType('sell')} 
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-lg relative ${orderType === 'sell' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
                 {orderType === 'sell' && (
                    <motion.div layoutId="orderTypeBg" className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.1)]" />
                )}
                <span className="relative z-10">Divestment</span>
            </button>
        </div>

        <div className="space-y-4">
            {/* Price Input */}
            <div className="space-y-1.5">
                 <div className="flex justify-between items-end px-1">
                    <label className="text-[8px] uppercase font-black text-zinc-600 tracking-[0.3em]">Price Limit</label>
                    <span className="text-[9px] font-mono font-bold text-zinc-800">INR</span>
                 </div>
                 <div className="relative group">
                    <input 
                        type="number" 
                        step="0.01" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-white/5 h-12 px-5 text-sm font-mono focus:border-white/20 focus:bg-zinc-950 transition-all focus:outline-none rounded-xl text-white placeholder:text-zinc-800"
                        placeholder="0.00"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <TrendingUp size={14} className="text-zinc-800 group-focus-within:text-zinc-600 transition-colors" />
                    </div>
                 </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
                 <div className="flex justify-between items-end px-1">
                    <label className="text-[8px] uppercase font-black text-zinc-600 tracking-[0.3em]">Quantity</label>
                    <span className="text-[9px] font-mono font-bold text-zinc-800">BRICKS</span>
                 </div>
                 <div className="relative group">
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-white/5 h-12 px-5 text-sm font-mono focus:border-white/20 focus:bg-zinc-950 transition-all focus:outline-none rounded-xl text-white placeholder:text-zinc-800"
                        placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Layers size={14} className="text-zinc-800 group-focus-within:text-zinc-600 transition-colors" />
                    </div>
                 </div>
                 
                 {/* Quick Percent Buttons */}
                 <div className="grid grid-cols-4 gap-1.5 mt-3">
                    {[25, 50, 75, 100].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => handleQuickFillQuantity(p)}
                            className="py-2 text-[9px] font-black border border-white/5 bg-zinc-950/50 hover:bg-white/5 hover:border-white/10 text-zinc-600 hover:text-zinc-300 transition-all uppercase tracking-widest rounded-lg"
                        >
                            {p === 100 ? 'MAX' : `${p}%`}
                        </button>
                    ))}
                 </div>
            </div>
        </div>

        {/* Trade Summary Card */}
        <div className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 border-dashed relative overflow-hidden group">
             <div className="flex items-center justify-between relative z-10">
                 <div className="space-y-0.5">
                    <p className="text-[8px] uppercase font-black text-zinc-700 tracking-[0.2em]">Total Commitment</p>
                    <p className="text-sm font-mono font-black text-white">₹{((parseFloat(price) || 0) * (parseInt(quantity) || 0)).toLocaleString()}</p>
                 </div>
                 <Zap size={16} className="text-zinc-800 group-hover:text-primary-500/20 transition-colors" />
             </div>
             {/* Subtle animated background glow */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <Button 
            type="submit" 
            size="lg"
            isLoading={isPlacing}
            variant={orderType === 'buy' ? 'primary' : 'danger'} 
            className={`w-full shadow-2xl tracking-[0.4em] font-black py-5 text-[10px] rounded-xl transition-all ${orderType === 'buy' ? 'hover:shadow-green-500/10' : 'hover:shadow-red-500/10'}`}
        >
            {orderType === 'buy' ? 'PLACE ACQUISITION ORDER' : 'PLACE DIVESTMENT ORDER'}
        </Button>
    </form>
);

const PropertySearchModal = ({ projects, selectedProject, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-5 px-2 py-1 group transition-all relative"
      >
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-white/20 group-hover:bg-white/5 transition-all">
          <Search size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>
        <div className="text-left">
          <p className="text-[7px] uppercase tracking-[0.3em] text-zinc-600 font-black leading-none mb-1 group-hover:text-zinc-400 transition-colors hidden md:block">Asset Identifier</p>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base md:text-lg font-black uppercase tracking-tighter text-white group-hover:text-primary-400 transition-colors truncate max-w-[120px] md:max-w-none">
              {selectedProject?.title || 'Select Asset'}
            </h2>
            <ChevronDown size={10} className="text-zinc-700 group-hover:text-white transition-all group-hover:translate-y-0.5" />
          </div>
        </div>
        
        {/* Subtle hover indicator */}
        <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-500 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-2xl overflow-hidden"
            >
              {/* Search Header */}
              <div className="p-6 border-b border-white/5 flex items-center gap-4">
                <Search size={22} className="text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search by name, location, or asset code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xl font-medium focus:outline-none text-white placeholder:text-zinc-800"
                  autoFocus
                />
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  <div className="p-4 grid grid-cols-1 gap-2">
                    {filteredProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { onSelect(p); setIsOpen(false); setSearchQuery(''); }}
                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between group transition-all ${selectedProject?.id === p.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/5">
                              <Layers size={20} className={selectedProject?.id === p.id ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white group-hover:text-primary-400">{p.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">₹{p.market_price?.toLocaleString()}</span>
                                <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                                  {typeof p.location === 'object' && p.location !== null 
                                    ? `${p.location.city || ''}, ${p.location.state || ''}`.trim().replace(/^, |, $/g, '') || 'Prime Cluster'
                                    : p.location || 'Prime Cluster'}
                                </span>
                              </div>
                           </div>
                        </div>
                        {selectedProject?.id === p.id && (
                          <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[9px] font-bold uppercase tracking-widest rounded-full">Active</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center opacity-40">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="text-sm uppercase tracking-[0.3em] font-bold">No results for "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-900/30 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600">
                <div className="flex items-center gap-6">
                  <span>ENTER to select</span>
                  <span>ESC to close</span>
                </div>
                <span>{filteredProjects.length} Assets Found</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const ModifyOrderModal = ({ isOpen, onClose, order, onModify }) => {
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    if (order) {
      setNewPrice(order.price_per_brick.toString());
      setNewQuantity(order.unfilled_quantity.toString());
    }
  }, [order]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-md p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
           <div>
             <h3 className="text-xl font-bold uppercase tracking-tight text-white">Modify Intent</h3>
             <p className="text-[10px] uppercase tracking-widest text-white/30">ID: {order.id.substring(0,8)}... ({order.order_type})</p>
           </div>
           <button onClick={onClose} className="p-2 text-white hover:bg-white/5 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="space-y-6">
           <Input 
             label="New Limit Price" 
             type="number" 
             step="0.01" 
             value={newPrice} 
             onChange={(e) => setNewPrice(e.target.value)} 
           />
           <Input 
             label="New Quantity (BK)" 
             type="number" 
             value={newQuantity} 
             onChange={(e) => setNewQuantity(e.target.value)} 
           />

           <div className="pt-6 border-t border-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest mb-4 leading-relaxed">
                Modification involves an atomic Cancel + Re-place operation. This will move your order to the back of the queue (FIFO reset).
              </p>
              <div className="flex gap-4">
                 <Button variant="outline" className="flex-1 h-12 text-[10px]" onClick={onClose}>CLOSE</Button>
                 <Button className="flex-1 h-12 text-[10px] bg-primary-600 hover:bg-primary-700 text-white font-bold" onClick={() => onModify(order.id, newPrice, newQuantity)}>SUBMIT MODS</Button>
              </div>
           </div>
        </div>
      </motion.div>
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
  const [ohlcvData, setOhlcvData] = useState([]);
  
  // Vault & Governance State
  const [activeTab, setActiveTab] = useState('exchange');
  const [holdings, setHoldings] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isHolder, setIsHolder] = useState(false);
  const [modifyingOrder, setModifyingOrder] = useState(null);
  
  // UI State
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  
  const [chartTimeframe, setChartTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('candlestick');
  const [mobileTab, setMobileTab] = useState('chart');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Phase One UI State
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, orderId: null });
  const [walletBalance, setWalletBalance] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        const [projectsData, walletData] = await Promise.all([
          propertyService.getProperties('active'),
          walletService.getWalletContext().catch(() => ({ balance: 0 }))
        ]);
        setProjects(projectsData);
        setWalletBalance(walletData.balance || 0);
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
      const [history, book, ohlcv, govProposals, userPortfolio, orders, walletData] = await Promise.all([
        exchangeService.getTradeHistory(selectedProject.id),
        exchangeService.getPublicOrderBook(selectedProject.id),
        exchangeService.getOHLCV(selectedProject.id, chartTimeframe.toLowerCase()),
        governanceService.getProposals(selectedProject.id).catch(() => []),
        exchangeService.getPortfolio().catch(() => []),
        exchangeService.getOpenOrders().catch(() => []),
        walletService.getWalletContext().catch(() => ({ balance: 0 }))
      ]);
      setTradeHistory(history);
      setPublicOrderBook(book);
      setOhlcvData(ohlcv);
      setProposals(govProposals);
      setOpenOrders(orders);
      setWalletBalance(walletData.balance || 0);

      const holding = userPortfolio.find(h => h.project_id === selectedProject.id);
      setIsHolder(holding && holding.quantity > 0);
      setHoldings(userPortfolio);
    } catch (error) {
      console.error("Live data fetch failed", error);
    }
  };

  useEffect(() => {
    refreshLiveData();
    if (!selectedProject) return;

    const tradeChannel = supabase
      .channel('public:trades')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trades', filter: `project_id=eq.${selectedProject.id}` },
        () => refreshLiveData()
      )
      .subscribe();

    const orderChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `project_id=eq.${selectedProject.id}` },
        () => refreshLiveData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tradeChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [selectedProject, chartTimeframe]);

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

  const marketSpread = useMemo(() => {
    if (buyOrders.length === 0 || sellOrders.length === 0) return { spread: 0, percent: 0 };
    const highestBid = buyOrders[0].price_per_brick;
    const lowestAsk = sellOrders[0].price_per_brick;
    const spread = lowestAsk - highestBid;
    const percent = (spread / lowestAsk) * 100;
    return { spread, percent };
  }, [buyOrders, sellOrders]);

  const formattedChartData = useMemo(() => {
    if (!ohlcvData || !ohlcvData.length) return { price: [], volume: [] };
    
    // Sort chronologically ascending
    const sorted = [...ohlcvData].sort((a, b) => a.time - b.time);
    
    const priceData = sorted.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        value: d.close
    }));
    
    const volData = sorted.map(d => ({
        time: d.time,
        value: d.volume || d.value || 0,
        color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    }));

    return { price: priceData, volume: volData };
  }, [ohlcvData]);

  const volume24h = useMemo(() => {
    if (!ohlcvData || !ohlcvData.length) return 0;
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    return ohlcvData
        .filter(d => d.time >= oneDayAgo)
        .reduce((acc, d) => acc + (d.value || d.volume || 0), 0);
  }, [ohlcvData]);

  const priceChartContainerRef = React.useRef(null);
  const volChartContainerRef = React.useRef(null);

  useEffect(() => {
    if (!priceChartContainerRef.current || formattedChartData.price.length === 0 || activeTab !== 'exchange') return;
    
    const priceChart = createChart(priceChartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#71717a' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.02)' }, horzLines: { color: 'rgba(255, 255, 255, 0.02)' } },
      width: priceChartContainerRef.current.clientWidth,
      height: priceChartContainerRef.current.clientHeight,
      timeScale: { timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderVisible: false }
    });

    let mainSeries;
    if (chartType === 'candlestick') {
      mainSeries = priceChart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineColor: '#22c55e',
        priceLineStyle: 2,
      });
    } else if (chartType === 'line') {
      mainSeries = priceChart.addSeries(LineSeries, {
        color: '#fff',
        lineWidth: 1.5,
      });
    } else {
      mainSeries = priceChart.addSeries(AreaSeries, {
        lineColor: '#fff',
        topColor: 'rgba(255, 255, 255, 0.05)',
        bottomColor: 'rgba(255, 255, 255, 0)',
        lineWidth: 1.5,
        priceLineVisible: false
      });
    }
    mainSeries.setData(formattedChartData.price);

    // Volume Series (Unified Overlay)
    const volumeSeries = priceChart.addSeries(HistogramSeries, {
        color: 'rgba(34, 197, 94, 0.15)',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });
    volumeSeries.setData(formattedChartData.volume);
    
    // Position volume at the bottom (15% of height for desktop)
    volumeSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.85,
            bottom: 0,
        },
    });

    // Smart Spacing: Avoid "Fat Candles" for low data points
    if (formattedChartData.price.length < 50) {
        priceChart.timeScale().applyOptions({
            barSpacing: 10,
        });
    } else {
        priceChart.timeScale().fitContent();
    }

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect) {
        priceChart.applyOptions({ 
          width: entries[0].contentRect.width, 
          height: entries[0].contentRect.height 
        });
      }
    });
    resizeObserver.observe(priceChartContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
      priceChart.remove();
    };
  }, [formattedChartData.price, formattedChartData.volume, chartType, activeTab, mobileTab]);

  // Combined Price & Volume Metrics

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
      showToast(`${orderType.toUpperCase()} order placed successfully`, "success");
      setQuantity('');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to place order", "error");
    } finally {
      setIsPlacing(false);
      refreshLiveData();
    }
  };

  const handleQuickFillPrice = (val) => {
    setPrice(val.toString());
  };

  const handleQuickFillQuantity = (percentage) => {
    if (!selectedProject) return;
    
    if (orderType === 'buy') {
      if (!price || parseFloat(price) <= 0) {
        showToast("Please enter a price first", "error");
        return;
      }
      const maxQty = Math.floor(walletBalance / parseFloat(price));
      setQuantity(Math.floor(maxQty * (percentage / 100)).toString());
    } else {
      const holding = holdings.find(h => h.project_id === selectedProject.id);
      const maxQty = holding ? holding.quantity : 0;
      setQuantity(Math.floor(maxQty * (percentage / 100)).toString());
    }
  };

  const handleCancelOrder = async (orderId) => {
    setConfirmCancel({ isOpen: true, orderId });
  };

  const executeCancelOrder = async () => {
    const orderId = confirmCancel.orderId;
    if (!orderId) return;
    
    try {
      await exchangeService.cancelOrder(orderId);
      showToast("Order cancelled successfully", "success");
      setConfirmCancel({ isOpen: false, orderId: null });
      refreshLiveData();
    } catch (err) { 
      console.error(err); 
      showToast("Failed to cancel order", "error");
    }
  };

  const handleModifyExecute = async (orderId, newPrice, newQty) => {
    const targetOrder = openOrders.find(o => o.id === orderId);
    if (!targetOrder) return;
    try {
       await exchangeService.cancelOrder(orderId);
       await exchangeService.placeOrder({
         project_id: targetOrder.project_id,
         order_type: targetOrder.order_type,
         quantity: parseInt(newQty),
         price_per_brick: parseFloat(newPrice)
       });
       setModifyingOrder(null);
       refreshLiveData();
    } catch (err) {
       console.error(err);
    }
  };

  const handleVote = async (proposalId, optionIndex) => {
    if (!isHolder) return;
    try {
      await governanceService.castVote(proposalId, optionIndex);
      refreshLiveData();
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden relative">
        {/* Mobile-Optimized Header (Groww Style) */}
        <header className="h-16 md:h-20 border-b border-white/10 px-4 md:px-8 flex items-center justify-between bg-[#080808]/95 backdrop-blur-3xl sticky top-0 z-[110] shadow-2xl">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(-1)} 
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-zinc-400 md:hidden"
                >
                    <ArrowLeft size={18} />
                </button>
                
                <div className="hidden md:block">
                        <button 
                        onClick={() => navigate(-1)} 
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Return</span>
                    </button>
                </div>

                <div className="h-8 w-px bg-white/5 hidden lg:block" />
                
                <PropertySearchModal 
                    projects={projects} 
                    selectedProject={selectedProject} 
                    onSelect={setSelectedProject} 
                />
            </div>

            {/* Price Metrics - Mobile Right Side */}
            <div className="flex md:hidden flex-col items-end">
                <span className="text-base font-mono font-black tracking-tighter text-white leading-none">₹{latestPrice.toLocaleString()}</span>
                <div className={`flex items-center gap-1 mt-1 text-[9px] font-black ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(priceChange) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(priceChange))}%
                </div>
            </div>

                {/* Desktop Metrics HUD */}
                <div className="hidden md:flex items-center gap-10 overflow-x-auto no-scrollbar ml-6 border-l border-white/5 pl-10">
                    <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-black">24h Change</p>
                        <div className={`flex items-center gap-1.5 text-[11px] font-mono font-bold ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-black">24h High</p>
                        <span className="text-[11px] font-mono font-bold text-zinc-400">₹{(latestPrice * 1.05).toFixed(2)}</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-black">24h Low</p>
                        <span className="text-[11px] font-mono font-bold text-zinc-400">₹{(latestPrice * 0.92).toFixed(2)}</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-black">24h Volume</p>
                        <span className="text-[11px] font-mono font-bold text-zinc-400">{volume24h.toLocaleString()} <span className="text-[9px] text-zinc-700">BK</span></span>
                    </div>
                </div>


            <div className="flex items-center gap-6 hidden md:flex">
                {/* Modern Segmented Control */}
                <div className="flex bg-zinc-950 p-1 border border-white/5 rounded-xl">
                   {[
                     { id: 'exchange', label: 'Exchange' },
                     { id: 'holdings', label: 'My Vault' },
                     { id: 'governance', label: 'DAO', icon: <Shield size={10} /> }
                   ].filter(t => t.id !== 'governance' || proposals.length > 0).map((tab) => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`relative px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] font-black transition-all rounded-lg flex items-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                     >
                        {activeTab === tab.id && (
                          <motion.div 
                            layoutId="activeTabHeader" 
                            className="absolute inset-0 bg-white/10 rounded-lg border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {tab.icon} {tab.label}
                        </span>
                     </button>
                   ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-full">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-green-500/80 font-black">Live Matcher</span>
                </div>
            </div>
        </header>

        {/* Main Layout Area */}
        <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {activeTab === 'exchange' && (
                    <motion.div 
                        key="exchange"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col md:flex-row pb-20 md:pb-0 min-h-0"
                    >
                        {/* Left Column: Charts */}
                        {/* Left Column: Unified Technical Chart */}
                        <div className={`flex-1 flex flex-col border-r border-white/5 overflow-hidden ${mobileTab !== 'chart' ? 'hidden md:flex' : 'flex'}`}>
                            <div className="flex-1 flex flex-col min-h-0 bg-black/20 relative">
                                {/* Chart Header / Timeframes */}
                                <div className="h-8 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-zinc-950/20">
                                    <div className="flex bg-zinc-900/50 rounded-md border border-white/5 relative">
                                        {['1m', '5m', '1h', '1D', '1W', '1M'].map((tf) => (
                                            <button 
                                                key={tf}
                                                onClick={() => setChartTimeframe(tf)}
                                                className={`relative px-3 py-1 text-[9px] font-black tracking-tighter transition-all z-10 ${chartTimeframe === tf ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            >
                                                {chartTimeframe === tf && (
                                                    <motion.div 
                                                        layoutId="activeTimeframe"
                                                        className="absolute inset-0 bg-white/10 rounded-md border border-white/5"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-20">{tf}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 border-l border-white/5 pl-4 ml-2">
                                         <button 
                                            onClick={() => setChartType('candlestick')}
                                            className={`p-1.5 rounded-md transition-all ${chartType === 'candlestick' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            title="Candlestick Chart"
                                         >
                                            <TrendingUp size={12} />
                                         </button>
                                         <button 
                                            onClick={() => setChartType('line')}
                                            className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            title="Line Chart"
                                         >
                                            <LineChart size={12} />
                                         </button>
                                         <div className="w-px h-4 bg-white/5 mx-1" />
                                         <button className="text-zinc-600 hover:text-white transition-colors p-1.5"><Maximize2 size={12} /></button>
                                    </div>
                                </div>

                                {/* Unified Chart Area */}
                                <div className="flex-1 min-h-[350px] md:min-h-0 relative overflow-hidden bg-[#050505]">
                                    <div ref={priceChartContainerRef} className="absolute inset-0 [&_a]:hidden" />
                                    
                                    {/* Real-time Status Overlay */}
                                    <div className="absolute top-3 left-4 flex flex-col gap-1 pointer-events-none z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-[8px] uppercase tracking-[0.2em] text-white font-black">{selectedProject?.title}</p>
                                        </div>
                                        <p className="text-[7px] text-zinc-600 font-mono">VOL 24H: {volume24h.toLocaleString()}</p>
                                    </div>

                                    {formattedChartData.price.length === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                                            <Activity size={24} className="text-zinc-800 mb-2 animate-pulse" />
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black">Syncing Market Data...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Orderbook (Visible below chart on Mobile) */}
                        <div className={`w-full md:w-64 lg:w-72 flex flex-col border-r border-white/5 bg-black/20 shrink-0 ${mobileTab !== 'chart' ? 'hidden md:flex' : 'flex'}`}>
                            <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-zinc-950/20">
                                <h3 className="text-[9px] uppercase font-black tracking-[0.2em] flex items-center gap-2 text-zinc-500">
                                    <BarChart3 size={12} className="text-zinc-700" />
                                    Orderbook
                                </h3>
                            </div>
                            
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <OrderBookRow isHeader />
                                
                                {/* Sell Orders (Asks) - Red */}
                                <div className="overflow-hidden flex flex-col-reverse justify-end">
                                    {sellOrders.slice(-5).map((o, i) => (
                                        <OrderBookRow 
                                            key={i} 
                                            price={o.price_per_brick} 
                                            quantity={o.unfilled_quantity} 
                                            type="sell" 
                                            total={o.cumulativeTotal}
                                            maxTotal={maxDepth}
                                            onClick={handleQuickFillPrice}
                                        />
                                    ))}
                                </div>

                                {/* Spread Section */}
                                <div className="py-2 border-y border-white/5 bg-zinc-950/40 flex flex-col items-center justify-center relative">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xl font-mono font-black tracking-tighter ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ₹{latestPrice.toLocaleString()}
                                        </span>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Spread</span>
                                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                                                {marketSpread.spread > 0 ? `₹${marketSpread.spread.toFixed(2)} (${marketSpread.percent.toFixed(2)}%)` : '0.00 (0%)'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Small signal bar */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600/20" />
                                 </div>

                                {/* Buy Orders (Bids) - Green */}
                                <div className="overflow-hidden">
                                     {buyOrders.slice(0, 5).map((o, i) => (
                                        <OrderBookRow 
                                            key={i} 
                                            price={o.price_per_brick} 
                                            quantity={o.unfilled_quantity} 
                                            type="buy" 
                                            total={o.cumulativeTotal}
                                            maxTotal={maxDepth}
                                            onClick={handleQuickFillPrice}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                                {/* Right Column: Trade Input & Recent Trades */}
                                <div className="hidden md:flex w-full md:w-80 lg:w-96 flex flex-col bg-black/20 shrink-0">
                                    {/* Trade Form */}
                                    <div className="p-5 md:p-6 border-b border-white/5 bg-zinc-950/20">
                                        <TradeForm 
                                            orderType={orderType}
                                            setOrderType={setOrderType}
                                            price={price}
                                            setPrice={setPrice}
                                            quantity={quantity}
                                            setQuantity={setQuantity}
                                            handlePlaceOrder={handlePlaceOrder}
                                            isPlacing={isPlacing}
                                            handleQuickFillQuantity={handleQuickFillQuantity}
                                            latestPrice={latestPrice}
                                        />
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
                    </motion.div>
                )}

                {activeTab === 'holdings' && (
                    <motion.div 
                        key="holdings"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="h-full w-full overflow-y-auto p-8 space-y-8 bg-[#0a0a0a]"
                    >
                        <div className="max-w-6xl mx-auto space-y-8">
                             {/* My Active Intents Table */}
                             <Card noPadding>
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                   <div>
                                      <h2 className="text-xl font-bold uppercase tracking-tighter text-white">My Active Intents</h2>
                                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Pending matches in the global orderbook</p>
                                   </div>
                                </div>
                                <div className="overflow-x-auto">
                                   <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-600 bg-black/20">
                                          <th className="p-6">Intent ID</th>
                                          <th className="p-6">Type</th>
                                          <th className="p-6">Price</th>
                                          <th className="p-6">Unfilled Qty</th>
                                          <th className="p-6 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {openOrders.length === 0 ? (
                                           <tr><td colSpan="5" className="p-20 text-center text-zinc-600 uppercase tracking-widest text-xs">No active intents in the matcher.</td></tr>
                                        ) : openOrders.map(o => (
                                          <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                            <td className="p-6 font-mono text-[10px] text-zinc-500">{o.id.substring(0,18)}...</td>
                                            <td className="p-6">
                                               <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${o.order_type === 'buy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{o.order_type}</span>
                                            </td>
                                            <td className="p-6 font-mono text-white">₹{o.price_per_brick.toLocaleString()}</td>
                                            <td className="p-6 font-mono text-zinc-400">{o.unfilled_quantity} BK</td>
                                            <td className="p-6 text-right">
                                               <div className="flex justify-end gap-2">
                                                  <Button size="sm" variant="ghost" className="h-9 px-4 text-white hover:bg-white/10" onClick={() => setModifyingOrder(o)}>
                                                    <Edit2 size={12} className="mr-2" /> Modify
                                                  </Button>
                                                  <Button size="sm" variant="ghost" className="h-9 px-4 text-red-500 hover:bg-red-500/10" onClick={() => handleCancelOrder(o.id)}>
                                                    <Trash2 size={12} className="mr-2" /> Cancel
                                                  </Button>
                                               </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                   </table>
                                </div>
                             </Card>

                             {/* Equity Inventory Table */}
                             <Card noPadding>
                                <div className="p-8 border-b border-white/5">
                                   <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Equity Inventory</h2>
                                   <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Legally backed assets in your digital vault</p>
                                </div>
                                <div className="overflow-x-auto">
                                   <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-zinc-600 bg-black/20">
                                          <th className="p-6">Asset Cluster</th>
                                          <th className="p-6 text-center">Volume</th>
                                          <th className="p-6 text-center">Inventory Value</th>
                                          <th className="p-6 text-center">P&L Status</th>
                                          <th className="p-6 text-right">Ops</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {holdings.length === 0 ? (
                                          <tr><td colSpan="5" className="p-20 text-center text-zinc-600 uppercase tracking-widest text-xs">Vault empty. Begin acquisition on the exchange.</td></tr>
                                        ) : holdings.map(h => {
                                           const proj = projects.find(p => p.id === h.project_id);
                                           const currentVal = h.quantity * (proj?.market_price || 0);
                                           const costBasis = h.total_cost_basis || 0;
                                           const pnl = currentVal - costBasis;
                                           const roi = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                                           return (
                                             <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                               <td className="p-6 font-bold uppercase text-sm text-white">
                                                   <div className="flex flex-col">
                                                       {proj?.title || h.project_id}
                                                       <span className="text-[10px] font-mono text-zinc-600 font-normal">AVG COST: ₹{(costBasis / (h.quantity || 1)).toFixed(2)}</span>
                                                   </div>
                                               </td>
                                               <td className="p-6 font-mono text-zinc-400 text-center">{h.quantity} BK</td>
                                               <td className="p-6 font-mono font-bold text-white text-center">₹{currentVal.toLocaleString()}</td>
                                               <td className="p-6 font-mono font-bold text-center">
                                                   <div className="flex flex-col">
                                                       <span className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                           {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toLocaleString()}
                                                       </span>
                                                       <span className={`text-[10px] ${pnl >= 0 ? 'text-green-500/60' : 'text-red-500/60'}`}>
                                                           {pnl >= 0 ? '+' : ''}{roi.toFixed(2)}%
                                                       </span>
                                                   </div>
                                               </td>
                                               <td className="p-6 text-right">
                                                  <Button size="sm" variant="outline" onClick={() => { setSelectedProject(proj); setActiveTab('exchange'); }}>TRADE</Button>
                                                </td>
                                             </tr>
                                           );
                                        })}
                                      </tbody>
                                   </table>
                                </div>
                             </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'governance' && (
                    <motion.div 
                        key="governance"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="h-full w-full overflow-y-auto p-8 bg-[#0a0a0a]"
                    >
                        <div className="max-w-6xl mx-auto">
                             <Card noPadding>
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                   <div>
                                      <h2 className="text-xl font-bold uppercase tracking-tighter text-white">On-Chain Consensus Protocols</h2>
                                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Weighted voting for {selectedProject?.title}</p>
                                   </div>
                                   {!isHolder && (
                                     <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 text-[8px] uppercase tracking-widest font-bold text-red-500">
                                       VOTING DISABLED: NO EQUITY DETECTED
                                     </div>
                                   )}
                                </div>
                                <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 bg-black/20">
                                   {proposals.map(p => (
                                     <div key={p.id} className="bg-white/[0.02] border border-white/5 p-8 space-y-6 relative group hover:border-white/10 transition-all">
                                        <div className="absolute top-6 right-6">
                                           <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${p.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'text-zinc-600 border-white/5'}`}>{p.status}</span>
                                        </div>
                                        <div>
                                           <h4 className="text-lg font-bold uppercase tracking-tight text-white pr-16">{p.title}</h4>
                                           <p className="text-[11px] text-zinc-400 uppercase mt-2 leading-relaxed line-clamp-2">{p.description}</p>
                                        </div>

                                        <div className="space-y-4">
                                           {p.options.map((opt, idx) => {
                                              const totalWeight = p.total_votes || 1;
                                              const weight = p.vote_distribution?.[idx] || 0;
                                              const percentage = Math.round((weight / totalWeight) * 100);
                                              return (
                                                 <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between text-[8px] uppercase tracking-widest font-bold">
                                                       <span className="text-zinc-400">{opt}</span>
                                                       <span className="text-zinc-600 font-mono">{percentage}% ({weight.toLocaleString()} BK)</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                       <div className="h-full bg-white transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    {p.status === 'active' && isHolder && (
                                                       <Button 
                                                         variant="ghost" 
                                                         className="w-full h-10 text-[9px] font-bold tracking-[0.2em] border border-white/5 hover:bg-white text-white hover:text-black mt-4"
                                                         onClick={() => handleVote(p.id, idx)}
                                                       >
                                                          CAST WEIGHTED VOTE
                                                       </Button>
                                                    )}
                                                 </div>
                                              );
                                           })}
                                        </div>
                                        <div className="pt-6 border-t border-white/5 flex justify-between text-[9px] uppercase tracking-widest text-zinc-600 font-mono">
                                           <span>ENDS: {new Date(p.end_date).toLocaleDateString()}</span>
                                           <span>TOTAL POWER: {p.total_votes.toLocaleString()}</span>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Sticky Mobile Action Buttons (Groww Style) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 flex gap-3 z-[70]">
            <button 
                onClick={() => { setOrderType('buy'); setIsTradeModalOpen(true); }}
                className="flex-1 py-4 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            >
                BUY ASSET
            </button>
            <button 
                onClick={() => { setOrderType('sell'); setIsTradeModalOpen(true); }}
                className="flex-1 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
                SELL ASSET
            </button>
        </div>

        {/* Mobile Trade Modal */}
        <Modal 
            isOpen={isTradeModalOpen} 
            onClose={() => setIsTradeModalOpen(false)}
            title={orderType === 'buy' ? 'Acquire Bricks' : 'Divest Bricks'}
        >
            <div className="p-1">
                <TradeForm 
                    orderType={orderType}
                    setOrderType={setOrderType}
                    price={price}
                    setPrice={setPrice}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    handlePlaceOrder={(e) => {
                        handlePlaceOrder(e);
                        setIsTradeModalOpen(false);
                    }}
                    isPlacing={isPlacing}
                    handleQuickFillQuantity={handleQuickFillQuantity}
                    latestPrice={latestPrice}
                />
            </div>
        </Modal>

        <ModifyOrderModal 
          isOpen={!!modifyingOrder} 
          onClose={() => setModifyingOrder(null)} 
          order={modifyingOrder} 
          onModify={handleModifyExecute} 
        />

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={confirmCancel.isOpen}
          onClose={() => setConfirmCancel({ isOpen: false, orderId: null })}
          title="Confirm Cancellation"
        >
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-500 leading-relaxed">
                Are you sure you want to withdraw this intent? This will unlock your assets and move them back to your digital vault. If you re-place this order later, it will be placed at the back of the queue.
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setConfirmCancel({ isOpen: false, orderId: null })}
              >
                KEEP ORDER
              </Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={executeCancelOrder}
              >
                CANCEL ORDER
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast Notification */}
        <Toast 
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
    </div>
  );
};

export default TradingRoom;
