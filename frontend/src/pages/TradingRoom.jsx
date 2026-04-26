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
          <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black leading-none mb-1.5 group-hover:text-zinc-400 transition-colors">Asset Identifier</p>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-primary-400 transition-colors">
              {selectedProject?.title || 'Select Asset'}
            </h2>
            <ChevronDown size={14} className="text-zinc-700 group-hover:text-white transition-all group-hover:translate-y-0.5" />
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
    priceChart.timeScale().fitContent();

    const handleResizePrice = () => {
      if (priceChartContainerRef.current) {
         priceChart.applyOptions({ width: priceChartContainerRef.current.clientWidth, height: priceChartContainerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResizePrice);

    return () => {
      window.removeEventListener('resize', handleResizePrice);
      priceChart.remove();
    };
  }, [formattedChartData.price, chartType, activeTab]);

  useEffect(() => {
    if (!volChartContainerRef.current || formattedChartData.volume.length === 0 || activeTab !== 'exchange') return;
    
    const volChart = createChart(volChartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#71717a' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      width: volChartContainerRef.current.clientWidth,
      height: volChartContainerRef.current.clientHeight,
      timeScale: { visible: false },
      rightPriceScale: { visible: false }
    });

    const volumeSeries = volChart.addSeries(HistogramSeries, {
      color: '#18181b',
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    });
    volumeSeries.setData(formattedChartData.volume);
    volChart.timeScale().fitContent();

    const handleResizeVol = () => {
      if (volChartContainerRef.current) {
         volChart.applyOptions({ width: volChartContainerRef.current.clientWidth, height: volChartContainerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResizeVol);

    return () => {
      window.removeEventListener('resize', handleResizeVol);
      volChart.remove();
    };
  }, [formattedChartData.volume, activeTab]);

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
        {/* Header Bar - Re-imagined for Premium Look */}
        <header className="h-auto md:h-20 border-b border-white/10 px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#080808]/80 backdrop-blur-2xl sticky top-0 z-[60] shadow-[0_1px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Return</span>
                </button>

                <div className="h-10 w-px bg-white/5 hidden lg:block" />
                
                <PropertySearchModal 
                    projects={projects} 
                    selectedProject={selectedProject} 
                    onSelect={setSelectedProject} 
                />
                
                <div className="flex gap-8 md:gap-10 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="space-y-1 hidden lg:block">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-bold">Volume 24h</p>
                        <span className="text-xs font-mono font-bold text-zinc-400">{volume24h.toLocaleString()} <span className="text-[10px] text-zinc-600 font-normal">BK</span></span>
                    </div>
                    
                    <div className="h-6 w-px bg-white/5 hidden lg:block" />

                    <div className="space-y-1 shrink-0">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-bold">Mark Price</p>
                        <div className="flex items-center gap-2.5">
                             <span className="text-base md:text-xl font-mono font-black tracking-tighter text-white">₹{latestPrice.toLocaleString()}</span>
                             <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-black ${parseFloat(priceChange) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {parseFloat(priceChange) >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                {Math.abs(parseFloat(priceChange))}%
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
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

                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-full hidden lg:flex">
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
                        className="h-full w-full flex"
                    >
                        {/* Left Column: Charts */}
                        <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
                            {/* Price Chart Section */}
                            <div className="flex-1 flex flex-col min-h-0 bg-black/20">
                                <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between shrink-0">
                                    <div className="flex gap-4">
                                        <div className="flex gap-1 bg-[#111] border border-white/5 p-0.5 rounded-sm">
                                            {['1m', '5m', '1h', '1d'].map(tf => (
                                                <button 
                                                    key={tf}
                                                    onClick={() => setChartTimeframe(tf)}
                                                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all ${chartTimeframe === tf ? 'bg-primary-600 text-white' : 'text-zinc-600 hover:text-white'}`}
                                                >
                                                    {tf}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-1 bg-[#111] border border-white/5 p-0.5 rounded-sm">
                                            {['area', 'line', 'candlestick'].map(type => (
                                                <button 
                                                    key={type}
                                                    onClick={() => setChartType(type)}
                                                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all ${chartType === type ? 'bg-primary-600 text-white' : 'text-zinc-600 hover:text-white'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                         <button className="text-zinc-600 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 relative">
                                    <div ref={priceChartContainerRef} className="absolute inset-6 [&_a]:hidden" />
                                    {formattedChartData.price.length === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                                            <Activity size={32} className="text-zinc-700 mb-3 animate-pulse" />
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Waiting for market data...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Volume Section */}
                            <div className="h-40 border-t border-white/5 bg-black/40 shrink-0 flex flex-col">
                                <div className="h-8 px-6 flex items-center border-b border-white/5 shrink-0">
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-700 font-bold">Transaction Volume</p>
                                </div>
                                <div className="flex-1 px-6 py-4 relative">
                                    <div ref={volChartContainerRef} className="absolute inset-0 px-6 py-4 [&_a]:hidden" />
                                    {formattedChartData.volume.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-800 font-bold">No volume recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Orderbook */}
                        <div className="w-80 flex flex-col border-r border-white/5 bg-black/40 shrink-0">
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
                                            onClick={handleQuickFillPrice}
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
                                            onClick={handleQuickFillPrice}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Trade Input & Recent Trades */}
                        <div className="w-96 flex flex-col bg-black shrink-0">
                            {/* Trade Form */}
                            <div className="p-8 border-b border-white/5">
                                <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5 mb-8">
                                    <button 
                                        onClick={() => setOrderType('buy')} 
                                        className={`flex-1 py-4 text-[10px] font-bold uppercase rounded-md tracking-[0.2em] transition-all ${orderType === 'buy' ? 'bg-primary-600 text-white shadow-2xl shadow-primary-900/40' : 'text-zinc-500 hover:text-zinc-300'}`}
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
                                         <div className="grid grid-cols-4 gap-2 mt-2">
                                            {[25, 50, 75, 100].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => handleQuickFillQuantity(p)}
                                                    className="py-2 text-[8px] font-bold border border-white/5 bg-zinc-900/50 hover:bg-white/10 text-zinc-500 hover:text-white transition-all uppercase tracking-widest rounded-sm"
                                                >
                                                    {p === 100 ? 'MAX' : `${p}%`}
                                                </button>
                                            ))}
                                         </div>
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
                                          <th className="p-6">Volume</th>
                                          <th className="p-6">Inventory Value</th>
                                          <th className="p-6 text-right">Ops</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {holdings.length === 0 ? (
                                          <tr><td colSpan="4" className="p-20 text-center text-zinc-600 uppercase tracking-widest text-xs">Vault empty. Begin acquisition on the exchange.</td></tr>
                                        ) : holdings.map(h => {
                                           const proj = projects.find(p => p.id === h.project_id);
                                           return (
                                             <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                               <td className="p-6 font-bold uppercase text-sm text-white">{proj?.title || h.project_id}</td>
                                               <td className="p-6 font-mono text-zinc-400">{h.quantity} BK</td>
                                               <td className="p-6 font-mono font-bold text-white">₹{(h.quantity * (proj?.market_price || 0)).toLocaleString()}</td>
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
