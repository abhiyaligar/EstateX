import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Search,
  Newspaper,
  Lock,
  MapPin,
  ChevronRight
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
        {isHeader ? 'PRICE' : price === null ? 'MARKET' : `₹${price.toLocaleString()}`}
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
        <span className={`font-mono font-medium ${type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{price ? `₹${price.toLocaleString()}` : 'MARKET'}</span>
     </div>
     <span className="text-zinc-500 font-mono">{quantity} BK</span>
     <span className="text-zinc-700 text-[8px] font-medium">{time}</span>
  </div>
);

const TradeForm = ({ 
    orderType, 
    setOrderType, 
    executionMode,
    setExecutionMode,
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
            {/* Execution Type Toggle & Price Input */}
            <div className="space-y-1.5">
                 <div className="flex justify-between items-end px-1">
                    <div className="flex items-center gap-3">
                        <label className="text-[8px] uppercase font-black text-zinc-600 tracking-[0.3em]">Execution</label>
                        <div className="flex bg-zinc-900 rounded-md p-0.5 border border-white/5">
                            <button 
                                type="button"
                                onClick={() => setExecutionMode('limit')}
                                className={`px-2 py-0.5 text-[7px] font-black uppercase rounded-[4px] transition-all ${executionMode === 'limit' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}
                            >
                                Limit
                            </button>
                            <button 
                                type="button"
                                onClick={() => setExecutionMode('market')}
                                className={`px-2 py-0.5 text-[7px] font-black uppercase rounded-[4px] transition-all ${executionMode === 'market' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}
                            >
                                Market
                            </button>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-800">INR</span>
                 </div>
                 <div className="relative group">
                    <input 
                        type="number" 
                        step="0.01" 
                        value={executionMode === 'market' ? '' : price} 
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={executionMode === 'market'}
                        className={`w-full bg-zinc-950/50 border border-white/5 h-12 px-5 text-sm font-mono focus:border-white/20 focus:bg-zinc-950 transition-all focus:outline-none rounded-xl text-white placeholder:text-zinc-800 ${executionMode === 'market' ? 'opacity-50 cursor-not-allowed italic' : ''}`}
                        placeholder={executionMode === 'market' ? "BEST AVAILABLE PRICE" : "0.00"}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <TrendingUp size={14} className={`${executionMode === 'market' ? 'text-zinc-900' : 'text-zinc-800'} group-focus-within:text-zinc-600 transition-colors`} />
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
                    <p className="text-sm font-mono font-black text-white">
                        {executionMode === 'market' ? 'ESTIMATED' : `₹${((parseFloat(price) || 0) * (parseInt(quantity) || 0)).toLocaleString()}`}
                    </p>
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
  
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(query);
    let locationMatch = false;
    if (typeof p.location === 'string') {
        locationMatch = p.location.toLowerCase().includes(query);
    } else if (typeof p.location === 'object' && p.location !== null) {
        locationMatch = (p.location.city?.toLowerCase().includes(query)) || 
                        (p.location.state?.toLowerCase().includes(query));
    }
    return titleMatch || locationMatch;
  });
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-5 px-2 py-1 group transition-all relative"
      >
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-white/20 group-hover:bg-white/5 transition-all relative">
          <Search size={16} className="text-zinc-500 group-hover:text-white transition-colors relative z-10" />
          <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 blur-xl transition-all rounded-full" />
        </div>
        <div className="text-left">
          <p className="text-[7px] uppercase tracking-[0.4em] text-zinc-600 font-black leading-none mb-1.5 group-hover:text-zinc-400 transition-colors hidden md:block">Asset Protocol // Live</p>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base md:text-lg font-black uppercase tracking-tighter text-white group-hover:text-primary-400 transition-colors truncate max-w-[120px] md:max-w-none">
              {selectedProject?.title || 'Select Asset'}
            </h2>
            <ChevronDown size={10} className="text-zinc-700 group-hover:text-white transition-all group-hover:translate-y-0.5" />
          </div>
        </div>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[10000] flex items-start md:items-start justify-center pt-0 md:pt-[10vh] px-0 md:px-4 pointer-events-none overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/90 md:bg-black/80 backdrop-blur-xl md:backdrop-blur-md pointer-events-auto"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                className="relative w-full md:max-w-2xl h-full md:h-auto md:max-h-[85vh] bg-[#080808] md:bg-zinc-950 md:border md:border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] md:rounded-2xl overflow-hidden flex flex-col pointer-events-auto"
              >
                <div className="p-5 md:p-8 border-b border-white/5 flex items-center gap-3 md:gap-5 bg-[#0a0a0a] md:bg-white/[0.01] shrink-0">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                    <Search size={18} className="text-primary-500 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      placeholder="Search name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-lg md:text-2xl font-black tracking-tight focus:outline-none text-white placeholder:text-zinc-600 uppercase"
                      autoFocus
                    />
                    <p className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-500 font-bold mt-0.5 truncate">Asset Discovery Protocol</p>
                  </div>
                  <button 
                      onClick={() => setIsOpen(false)} 
                      className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#080808] md:bg-transparent">
                  {filteredProjects.length > 0 ? (
                    <div className="p-2 md:p-4 grid grid-cols-1 gap-2">
                      {filteredProjects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { onSelect(p); setIsOpen(false); setSearchQuery(''); }}
                          className={`w-full text-left p-3 md:p-4 rounded-xl flex items-center justify-between group transition-all ${selectedProject?.id === p.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                          <div className="flex items-center gap-3 md:gap-5 min-w-0">
                            <div className="h-12 w-12 md:h-16 md:w-16 bg-zinc-900/50 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary-500/30 transition-all relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Layers size={20} className={selectedProject?.id === p.id ? 'text-primary-500' : 'text-zinc-700 group-hover:text-primary-400'} />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`text-sm md:text-lg font-black uppercase tracking-tight truncate ${selectedProject?.id === p.id ? 'text-primary-400' : 'text-white'}`}>{p.title}</h3>
                                  {selectedProject?.id === p.id && (
                                      <div className="px-1 py-0.5 bg-primary-500/10 border border-primary-500/20 rounded text-[6px] md:text-[7px] font-black text-primary-500 tracking-widest uppercase">Active</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                  <div className="flex items-center gap-1">
                                      <MapPin size={8} className="text-zinc-700" />
                                      <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-zinc-500 truncate max-w-[80px] md:max-w-none">
                                          {typeof p.location === 'object' && p.location !== null 
                                              ? `${p.location.city || ''}, ${p.location.state || ''}`.trim().replace(/^, |, $/g, '') || 'Prime Cluster'
                                              : p.location || 'Prime Cluster'}
                                      </span>
                                  </div>
                                  <div className="h-1 w-1 bg-zinc-800 rounded-full hidden md:block" />
                                  <div className="flex items-center gap-1">
                                      <span className="text-[8px] md:text-[10px] font-mono font-bold text-zinc-400">₹{p.ipo_price?.toLocaleString()}</span>
                                      <span className="text-[7px] md:text-[8px] uppercase font-black text-zinc-700 tracking-widest">Base</span>
                                  </div>
                                </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                              <div className="text-[9px] md:text-[11px] font-mono font-black text-white bg-white/5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">
                                  EX-{String(p.id).slice(0, 4).toUpperCase()}
                              </div>
                              <ChevronRight size={12} className="text-zinc-800 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-zinc-700 gap-4">
                      <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-900 flex items-center justify-center">
                          <Activity size={24} className="animate-pulse" />
                      </div>
                      <p className="text-[10px] uppercase font-black tracking-[0.4em]">No matching neural assets found</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                          <kbd className="px-1 md:px-1.5 py-0.5 rounded bg-zinc-800 text-[6px] md:text-[8px] font-black text-zinc-400 border border-white/5">↵</kbd>
                          <span className="text-[6px] md:text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Select</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                          <kbd className="px-1 md:px-1.5 py-0.5 rounded bg-zinc-800 text-[6px] md:text-[8px] font-black text-zinc-400 border border-white/5">ESC</kbd>
                          <span className="text-[6px] md:text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Dismiss</span>
                      </div>
                  </div>
                  <div className="text-[6px] md:text-[8px] uppercase tracking-[0.2em] text-zinc-600 font-black whitespace-nowrap ml-2">
                      {filteredProjects.length} Assets
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
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
  const [currentPrice, setCurrentPrice] = useState(0);
  const [publicOrderBook, setPublicOrderBook] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [ohlcvData, setOhlcvData] = useState([]);
  
  // Vault & Governance State
  const [bookMode, setBookMode] = useState('book'); // book, news, dao, vault
  const [mobileTab, setMobileTab] = useState('chart');
  const [holdings, setHoldings] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isHolder, setIsHolder] = useState(false);
  const [modifyingOrder, setModifyingOrder] = useState(null);
  
  // UI State
  const [orderType, setOrderType] = useState('buy');
  const [executionMode, setExecutionMode] = useState('limit'); // limit or market
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const refreshTimerRef = React.useRef(null);
  
  const [chartTimeframe, setChartTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('candlestick');
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
          setCurrentPrice(projectsData[0].market_price || 0);
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
      const [history, book, ohlcv, govProposals, userPortfolio, orders, walletData, projectDetails] = await Promise.all([
        (bookMode === 'history' || tradeHistory.length === 0) ? exchangeService.getTradeHistory(selectedProject.id) : Promise.resolve(tradeHistory),
        exchangeService.getPublicOrderBook(selectedProject.id),
        exchangeService.getOHLCV(selectedProject.id, chartTimeframe.toLowerCase()),
        governanceService.getProposals(selectedProject.id).catch(() => []),
        exchangeService.getPortfolio().catch(() => []),
        exchangeService.getOpenOrders().catch(() => []),
        walletService.getWalletContext().catch(() => ({ balance: 0 })),
        propertyService.getPropertyById(selectedProject.id).catch(() => null)
      ]);
      setTradeHistory(history);
      setPublicOrderBook(book);
      setOhlcvData(ohlcv);
      setProposals(govProposals);
      setOpenOrders(orders);
      setWalletBalance(walletData.balance || 0);
      if (projectDetails) {
          setCurrentPrice(projectDetails.market_price || 0);
      }

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
  }, [selectedProject, chartTimeframe]);

  useEffect(() => {
    if (bookMode === 'history') {
      refreshLiveData();
    }
  }, [bookMode]);
  useEffect(() => {
    if (!selectedProject) return;

    const debouncedRefresh = () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
            refreshLiveData();
        }, 500);
    };

    const tradeChannel = supabase
      .channel('public:trades')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trades', filter: `project_id=eq.${selectedProject.id}` },
        () => debouncedRefresh()
      )
      .subscribe();

    const orderChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `project_id=eq.${selectedProject.id}` },
        () => debouncedRefresh()
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      supabase.removeChannel(tradeChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [selectedProject, chartTimeframe]);


  const buyOrders = useMemo(() => {
    const orders = publicOrderBook.filter(o => o.order_type === 'buy').sort((a,b) => {
        if (a.price_per_brick === null && b.price_per_brick === null) return 0;
        if (a.price_per_brick === null) return -1;
        if (b.price_per_brick === null) return 1;
        return b.price_per_brick - a.price_per_brick;
    });
    let total = 0;
    return orders.map(o => {
        total += o.unfilled_quantity;
        return { ...o, cumulativeTotal: total };
    });
  }, [publicOrderBook]);

  const sellOrders = useMemo(() => {
    const orders = publicOrderBook.filter(o => o.order_type === 'sell').sort((a,b) => {
        if (a.price_per_brick === null && b.price_per_brick === null) return 0;
        if (a.price_per_brick === null) return -1;
        if (b.price_per_brick === null) return 1;
        return a.price_per_brick - b.price_per_brick;
    });
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
    const highestBid = buyOrders.find(o => o.price_per_brick !== null)?.price_per_brick;
    const lowestAsk = sellOrders.find(o => o.price_per_brick !== null)?.price_per_brick;
    
    if (!highestBid || !lowestAsk) return { spread: 0, percent: 0 };
    
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
  const chartInstanceRef = React.useRef(null);
  const mainSeriesRef = React.useRef(null);
  const volumeSeriesRef = React.useRef(null);
  const currentChartTypeRef = React.useRef(chartType);

  // Initialize Chart Instance
  useEffect(() => {
    if (!priceChartContainerRef.current || loading) return;

    const chart = createChart(priceChartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#71717a' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.02)' }, horzLines: { color: 'rgba(255, 255, 255, 0.02)' } },
      width: priceChartContainerRef.current.clientWidth,
      height: priceChartContainerRef.current.clientHeight,
      timeScale: { timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderVisible: false }
    });

    chartInstanceRef.current = chart;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ 
          width: entries[0].contentRect.width, 
          height: entries[0].contentRect.height 
        });
      }
    });
    resizeObserver.observe(priceChartContainerRef.current);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (chart) chart.remove();
      chartInstanceRef.current = null;
    };
  }, [loading]);

  // Sync Data & Handle Type Changes
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const chart = chartInstanceRef.current;

    // Handle Series Type Changes (Candle vs Line vs Area)
    if (mainSeriesRef.current && currentChartTypeRef.current !== chartType) {
        chart.removeSeries(mainSeriesRef.current);
        mainSeriesRef.current = null;
    }

    if (!mainSeriesRef.current) {
        if (chartType === 'candlestick') {
            mainSeriesRef.current = chart.addSeries(CandlestickSeries, {
                upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
                wickUpColor: '#22c55e', wickDownColor: '#ef4444',
                priceLineVisible: true, priceLineWidth: 1, priceLineColor: '#22c55e', priceLineStyle: 2,
            });
        } else if (chartType === 'line') {
            mainSeriesRef.current = chart.addSeries(LineSeries, { color: '#fff', lineWidth: 1.5 });
        } else {
            mainSeriesRef.current = chart.addSeries(AreaSeries, {
                lineColor: '#fff', topColor: 'rgba(255, 255, 255, 0.05)', bottomColor: 'rgba(255, 255, 255, 0)',
                lineWidth: 1.5, priceLineVisible: false
            });
        }
        currentChartTypeRef.current = chartType;
    }

    // Initialize/Update Volume Series
    if (!volumeSeriesRef.current) {
        volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
            color: 'rgba(34, 197, 94, 0.15)',
            priceFormat: { type: 'volume' },
            priceScaleId: '', 
        });
        volumeSeriesRef.current.priceScale().applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
        });
    }

    // Push Data
    if (formattedChartData.price.length > 0) {
        mainSeriesRef.current.setData(formattedChartData.price);
        volumeSeriesRef.current.setData(formattedChartData.volume);

        // Smart Spacing
        if (formattedChartData.price.length < 50) {
            chart.timeScale().applyOptions({ barSpacing: 10 });
        } else {
            chart.timeScale().fitContent();
        }
    }
  }, [formattedChartData, chartType, mobileTab]);

  // Combined Price & Volume Metrics

  const latestPrice = currentPrice || (tradeHistory.length > 0 ? tradeHistory[0].price : (selectedProject?.market_price || 0));
  const priceChange = tradeHistory.length > 1 ? ((tradeHistory[0].price - tradeHistory[1].price) / tradeHistory[1].price * 100).toFixed(2) : 0;

  // Portfolio & Holding Stats
  const activeHolding = useMemo(() => 
    holdings.find(h => h.project_id === selectedProject?.id), 
  [holdings, selectedProject]);

  const activeHoldingStats = useMemo(() => {
    if (!activeHolding || !latestPrice) return { quantity: 0, pnl: 0, percent: 0, avgPrice: 0 };
    const avgPrice = activeHolding.average_buy_price || 0;
    const currentVal = activeHolding.quantity * latestPrice;
    const costBasis = activeHolding.quantity * avgPrice;
    const pnl = currentVal - costBasis;
    const percent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { quantity: activeHolding.quantity, pnl, percent, avgPrice };
  }, [activeHolding, latestPrice]);

   const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProject || !quantity || (executionMode === 'limit' && !price)) return;
    try {
      setIsPlacing(true);
      await exchangeService.placeOrder({
        project_id: selectedProject.id,
        order_type: orderType,
        execution_type: executionMode,
        quantity: parseInt(quantity),
        price_per_brick: executionMode === 'market' ? null : parseFloat(price)
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
    if (val === null) {
      setExecutionMode('market');
      setPrice('');
    } else {
      setExecutionMode('limit');
      setPrice(val.toString());
    }
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
    <div className="h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden relative">
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
                        className="group flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white"
                        title="Return to Dashboard"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
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


        </header>

        {/* Main Layout Area */}
        <div className="flex-1 h-full overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.div 
                    key="terminal"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col md:flex-row pb-20 md:pb-0 overflow-y-auto md:overflow-hidden custom-scrollbar"
                >
                        {/* Left Column: Charts */}
                        {/* Left Column: Unified Technical Chart */}
                        {/* Left Column: Unified Technical Chart */}
                        <div className={`flex-[0_0_62vh] md:flex-1 flex flex-col border-r border-white/5 shrink-0 md:shrink-1 ${mobileTab !== 'chart' ? 'hidden md:flex' : 'flex'}`}>
                            <div className="flex-1 flex flex-col h-full bg-black/20 relative">
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
                                <div className="flex-1 relative overflow-hidden bg-[#050505]">
                                    <div ref={priceChartContainerRef} className="h-full w-full [&_a]:hidden" />
                                    
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

                        {/* Middle Column: Multi-Mode Terminal Section */}
                        <div className={`w-full md:w-80 lg:w-96 md:flex-1 md:h-full flex flex-col border-r border-white/5 bg-black/20 shrink-0 ${mobileTab !== 'chart' ? 'hidden md:flex' : 'flex'}`}>
                            {/* Horizontal Mode Slider */}
                            <div className="flex items-center justify-around py-2 border-b border-white/5 bg-zinc-950/40 relative">
                                {[
                                    { id: 'book', icon: <BarChart3 size={14} />, label: 'Depth' },
                                    { id: 'history', icon: <Clock size={14} />, label: 'History' },
                                    { id: 'news', icon: <Newspaper size={14} />, label: 'News' },
                                    { id: 'vault', icon: <Lock size={14} />, label: 'Vault' },
                                    { id: 'dao', icon: <Shield size={14} />, label: 'DAO' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setBookMode(mode.id)}
                                        className={`relative px-4 py-1.5 flex flex-col items-center gap-1 transition-all z-10 ${bookMode === mode.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        {bookMode === mode.id && (
                                            <motion.div 
                                                layoutId="activeBookMode"
                                                className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <div className="relative z-20">{mode.icon}</div>
                                        <span className="text-[7px] uppercase font-black tracking-widest relative z-20">{mode.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="h-8 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-zinc-950/20">
                                    <h3 className="text-[8px] uppercase font-black tracking-[0.2em] flex items-center gap-2 text-zinc-500">
                                        {bookMode === 'book' && 'Market Depth (Top 5)'}
                                        {bookMode === 'history' && 'Market Settlement Ledger'}
                                        {bookMode === 'news' && 'Global Intelligence HUD'}
                                        {bookMode === 'vault' && 'Asset Allocation Protocol'}
                                        {bookMode === 'dao' && 'Governance Core Sync'}
                                    </h3>
                                    <div className="h-1 w-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                                </div>
                                
                                <div className="flex-1 flex flex-col overflow-hidden relative">
                                    <AnimatePresence mode="wait">
                                        {bookMode === 'book' && (
                                            <motion.div 
                                                key="book"
                                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className="flex-1 flex flex-col overflow-hidden"
                                            >
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
                                            </motion.div>
                                        )}

                                        {bookMode === 'news' && (
                                            <motion.div 
                                                key="news"
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                                className="p-6 space-y-6 overflow-y-auto"
                                            >
                                                <div className="space-y-4">
                                                    {[
                                                        { title: 'EstateX Market Liquidity Hits Record High', date: '2m ago', priority: 'high' },
                                                        { title: 'New DAO Proposal: Infrastructure Upgrade', date: '1h ago', priority: 'medium' },
                                                        { title: 'Global Real Estate Tokenization Outlook 2026', date: '3h ago', priority: 'low' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="group cursor-pointer">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`h-1 w-1 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                                                                <span className="text-[7px] uppercase font-black tracking-widest text-zinc-500">{item.date}</span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors leading-relaxed">{item.title}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {bookMode === 'history' && (
                                            <motion.div 
                                                key="history"
                                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className="flex-1 flex flex-col overflow-hidden"
                                            >
                                                <div className="flex-1 overflow-y-auto">
                                                    {tradeHistory.length === 0 ? (
                                                        <div className="p-12 text-center text-zinc-600 uppercase tracking-widest text-[10px]">No recent settlements found</div>
                                                    ) : tradeHistory.slice(0, 50).map((t, i) => (
                                                        <TradeHistoryRow 
                                                            key={i} 
                                                            price={t.price} 
                                                            quantity={t.quantity} 
                                                            time={new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            type={t.type || (i % 2 === 0 ? 'buy' : 'sell')}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {bookMode === 'vault' && (
                                            <motion.div 
                                                key="vault"
                                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className="flex-1 overflow-y-auto p-6 space-y-6"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
                                                        <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Owned</p>
                                                        <p className="text-sm font-mono font-black text-white">{activeHoldingStats.quantity.toLocaleString()} <span className="text-[10px] text-zinc-700">BK</span></p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
                                                        <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Unrealized P&L</p>
                                                        <p className={`text-sm font-mono font-black ${activeHoldingStats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {activeHoldingStats.pnl >= 0 ? '+' : ''}₹{Math.abs(activeHoldingStats.pnl).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl border-dashed relative overflow-hidden group">
                                                        <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-2">Vault Performance</p>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-zinc-400">Total</span>
                                                            <span className={`text-[10px] font-mono font-black ${activeHoldingStats.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {activeHoldingStats.percent >= 0 ? '+' : ''}{activeHoldingStats.percent.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(Math.max(activeHoldingStats.percent + 50, 0), 100)}%` }}
                                                                className={`h-full ${activeHoldingStats.percent >= 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between px-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Avg Buy Price</span>
                                                            <span className="text-[11px] font-mono font-bold text-zinc-300">₹{activeHoldingStats.avgPrice.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Current Value</span>
                                                            <span className="text-[11px] font-mono font-bold text-white">₹{(activeHoldingStats.quantity * latestPrice).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {bookMode === 'dao' && (
                                            <motion.div 
                                                key="dao"
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                                className="flex-1 overflow-y-auto p-6 space-y-6"
                                            >
                                                <div className="p-5 bg-primary-500/5 border border-primary-500/10 rounded-xl space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={14} className="text-primary-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Active Voting Session</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 leading-relaxed">Proposal #EX-240: Implement automated market-making for secondary pools.</p>
                                                    <Button size="sm" variant="outline" className="w-full text-[8px] h-8">Review Governance</Button>
                                                </div>
                                                <div className="space-y-4">
                                                     <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-700 font-black px-1">Your Influence</p>
                                                     <div className="flex items-center justify-between px-1">
                                                         <span className="text-[10px] text-zinc-500">Voting Power</span>
                                                         <span className="text-[10px] font-mono text-white">4,500 VP</span>
                                                     </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                                            executionMode={executionMode}
                                            setExecutionMode={setExecutionMode}
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

                        </div>
                    </motion.div>
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
                    executionMode={executionMode}
                    setExecutionMode={setExecutionMode}
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
