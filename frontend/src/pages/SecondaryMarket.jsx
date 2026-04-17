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
  Trash2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import exchangeService from '../services/exchangeService';
import propertyService from '../services/propertyService';
import { supabase } from '../utils/supabaseClient';

// --- Sub-Components ---

const OrderBookRow = ({ price, quantity, type, isHeader = false }) => (
  <div className={`grid grid-cols-2 text-[10px] py-1 transition-colors ${!isHeader ? 'hover:bg-white/5' : 'text-white/20 uppercase tracking-widest'}`}>
    <span className={isHeader ? '' : type === 'buy' ? 'text-green-500 font-mono' : 'text-red-500 font-mono'}>
      {isHeader ? 'Price' : `₹${price.toLocaleString()}`}
    </span>
    <span className={`text-right ${isHeader ? '' : 'text-white/50 font-mono'}`}>
       {isHeader ? 'Quantity' : `${quantity} BK`}
    </span>
  </div>
);

const LedgerRow = ({ price, quantity, time }) => (
  <div className="flex items-center justify-between text-[10px] py-1.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
     <div className="flex items-center gap-1.5">
        <Activity size={10} className="text-white/20" />
        <span className="text-white/80 font-mono">₹{price.toLocaleString()}</span>
     </div>
     <span className="text-white/30 font-mono">{quantity} BK</span>
     <span className="text-white/20 text-[8px]">{time}</span>
  </div>
);

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
             <h3 className="text-xl font-bold uppercase tracking-tight">Modify Intent</h3>
             <p className="text-[10px] uppercase tracking-widest text-white/30">ID: {order.id.substring(0,8)}... ({order.order_type})</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20}/></button>
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
                 <Button className="flex-1 h-12 text-[10px] bg-white text-black font-bold" onClick={() => onModify(order.id, newPrice, newQuantity)}>SUBMIT MODS</Button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page ---

const SecondaryMarket = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, holdings
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [publicOrderBook, setPublicOrderBook] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  
  // UI Logic State
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [ipoQuantity, setIpoQuantity] = useState('');
  const [modifyingOrder, setModifyingOrder] = useState(null);
  
  // Initial Fetch
  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        const [projectsData, holdingsData] = await Promise.all([
          propertyService.getProperties('active'),
          exchangeService.getPortfolio()
        ]);
        
        setProjects(projectsData);
        setHoldings(holdingsData);
        
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

  // Fetch Live Data
  const refreshLiveData = async () => {
    if (!selectedProject) return;
    try {
      const [history, orders, book] = await Promise.all([
        exchangeService.getTradeHistory(selectedProject.id),
        exchangeService.getOpenOrders('open'),
        exchangeService.getPublicOrderBook(selectedProject.id)
      ]);
      setTradeHistory(history);
      setOpenOrders(orders);
      setPublicOrderBook(book);
    } catch (error) {
      console.error("Live data fetch failed", error);
    }
  };

  // Initialize Data
  useEffect(() => {
    refreshLiveData();
  }, [selectedProject]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!selectedProject) return;

    // 1. Subscribe to Trades (Live Ledger & Chart)
    const tradeChannel = supabase
      .channel('public:trades')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `project_id=eq.${selectedProject.id}`
        },
        (payload) => {
          console.log('New Trade Received:', payload.new);
          // Prepend new trade to history
          setTradeHistory(prev => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // 2. Subscribe to Orders (Depth / Orderbook)
    const orderChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `project_id=eq.${selectedProject.id}`
        },
        () => {
          // Re-fetch the orderbook to ensure consistency
          console.log('Orderbook change detected - refreshing depth...');
          refreshLiveData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tradeChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [selectedProject]);

  // Derived Data
  const buyOrders = useMemo(() => publicOrderBook.filter(o => o.order_type === 'buy').slice(0, 15), [publicOrderBook]);
  const sellOrders = useMemo(() => publicOrderBook.filter(o => o.order_type === 'sell').sort((a,b) => a.price_per_brick - b.price_per_brick).slice(0, 15), [publicOrderBook]);
  
  const chartData = useMemo(() => {
    if (!tradeHistory.length) return [];
    return tradeHistory.slice().reverse().map(t => ({
      time: new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: t.price
    }));
  }, [tradeHistory]);

  const latestPrice = tradeHistory.length > 0 ? tradeHistory[0].price : (selectedProject?.market_price || 0);

  // Handlers
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
      setQuantity(''); setPrice('');
      alert("Order pushed to network!");
      refreshLiveData();
    } catch (err) { alert(err.response?.data?.detail || "Order execution failed"); }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to withdraw this intent and unlock your assets?")) return;
    try {
      await exchangeService.cancelOrder(orderId);
      alert("Order cancelled. Assets released to vault.");
      refreshLiveData();
    } catch (err) { alert(err.response?.data?.detail || "Cancellation failed"); }
  };

  const handleModifyExecute = async (orderId, newPrice, newQty) => {
    const targetOrder = openOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    try {
       // 1. Cancel
       await exchangeService.cancelOrder(orderId);
       // 2. Re-place
       await exchangeService.placeOrder({
         project_id: targetOrder.project_id,
         order_type: targetOrder.order_type,
         quantity: parseInt(newQty),
         price_per_brick: parseFloat(newPrice)
       });
       setModifyingOrder(null);
       alert("Order successfully modified (Cancel + Re-place complete).");
       refreshLiveData();
    } catch (err) { alert(err.response?.data?.detail || "Modification failed mid-sequence."); }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/5 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
         <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <h1 className="text-xl font-bold uppercase tracking-tighter transition-colors group-hover:text-primary-500">
                  {selectedProject?.title}
                </h1>
                <ChevronDown size={14} className="text-white/20" />
              </div>
              <select 
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedProject?.id}
                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            
            <div className="flex gap-8 border-l border-white/10 pl-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-white/30 block">Live Price</span>
                <span className="text-sm font-bold font-mono">₹{latestPrice.toLocaleString()}</span>
              </div>
            </div>
         </div>

         <div className="flex bg-[#111] p-0.5 border border-white/5">
            <button onClick={() => setActiveTab('marketplace')} className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold ${activeTab === 'marketplace' ? 'bg-white text-black' : 'text-white/30'}`}>Exchange</button>
            <button onClick={() => setActiveTab('holdings')} className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold ${activeTab === 'holdings' ? 'bg-white text-black' : 'text-white/30'}`}>My Vault</button>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'marketplace' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <div className="md:col-span-3 order-3 md:order-1">
               <Card noPadding className="h-[600px] flex flex-col">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Public Orderbook</h3>
                    <p className="text-[8px] text-white/20 uppercase mt-1">Real-time buy/sell intents</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     <div>
                       <OrderBookRow isHeader />
                       <div className="flex flex-col-reverse">
                         {sellOrders.map((o, i) => (
                           <OrderBookRow key={i} price={o.price_per_brick} quantity={o.unfilled_quantity} type="sell" />
                         ))}
                       </div>
                     </div>
                     <div className="py-3 border-y border-white/5 text-center">
                        <span className="text-sm font-bold font-mono text-white/80">₹{latestPrice.toLocaleString()}</span>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Mark Price</p>
                     </div>
                     <div className="space-y-1">
                        {buyOrders.map((o, i) => (
                           <OrderBookRow key={i} price={o.price_per_brick} quantity={o.unfilled_quantity} type="buy" />
                        ))}
                     </div>
                  </div>
               </Card>
            </div>

            <div className="md:col-span-6 order-1 md:order-2 space-y-6">
               <Card noPadding className="h-[450px] relative">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Node-01 Live Feed</span>
                  </div>
                  <div className="h-[350px] w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 8}} dy={10} />
                        <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 8}} dx={-10} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0', fontSize: '10px' }} />
                        <Area type="stepAfter" dataKey="price" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
            </div>

            <div className="md:col-span-3 order-2 md:order-3 space-y-6">
               <Card>
                  <div className="flex bg-[#111] p-0.5 border border-white/5 mb-6">
                    <button onClick={() => setOrderType('buy')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-all ${orderType === 'buy' ? 'bg-white text-black' : 'text-white/20'}`}>BUY</button>
                    <button onClick={() => setOrderType('sell')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-all ${orderType === 'sell' ? 'bg-red-500 text-white' : 'text-white/20'}`}>SELL</button>
                  </div>
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <Input label="Limit Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <Input label="Quantity (BK)" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    <div className="pt-4 space-y-2 border-t border-white/5">
                       <Button type="submit" variant={orderType === 'buy' ? 'primary' : 'danger'} className="w-full h-12 text-[10px] tracking-[0.2em]">PLACE ORDER</Button>
                    </div>
                  </form>
               </Card>

               <Card noPadding className="h-[300px] flex flex-col">
                  <div className="p-4 border-b border-white/5">
                     <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Live Ledger</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                     {tradeHistory.slice(0, 5).map((t, i) => (
                       <LedgerRow key={i} price={t.price} quantity={t.quantity} time={new Date(t.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                     ))}
                  </div>
               </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'holdings' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
             {/* My Active Intents Table */}
             <Card noPadding>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div>
                      <h2 className="text-xl font-bold uppercase tracking-tighter">My Active Intents</h2>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Pending matches in the global orderbook</p>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                          <th className="p-8">Intent ID</th>
                          <th className="p-8">Type</th>
                          <th className="p-8">Price</th>
                          <th className="p-8">Unfilled Qty</th>
                          <th className="p-8 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openOrders.length === 0 ? (
                           <tr><td colSpan="5" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">No active intents in the matcher.</td></tr>
                        ) : openOrders.map(o => (
                          <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <td className="p-8 font-mono text-[10px] text-white/40">{o.id.substring(0,18)}...</td>
                            <td className="p-8">
                               <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${o.order_type === 'buy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{o.order_type}</span>
                            </td>
                            <td className="p-8 font-mono text-white">₹{o.price_per_brick.toLocaleString()}</td>
                            <td className="p-8 font-mono text-white/60">{o.unfilled_quantity} BK</td>
                            <td className="p-8 text-right">
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
                   <h2 className="text-xl font-bold uppercase tracking-tighter">Equity Inventory</h2>
                   <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Legally backed assets in your digital vault</p>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
                          <th className="p-8">Asset Cluster</th>
                          <th className="p-8">Volume</th>
                          <th className="p-8">Inventory Value</th>
                          <th className="p-8 text-right">Ops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.length === 0 ? (
                          <tr><td colSpan="4" className="p-20 text-center text-white/20 uppercase tracking-widest text-xs">Vault empty. Begin acquisition on the exchange.</td></tr>
                        ) : holdings.map(h => {
                           const proj = projects.find(p => p.id === h.project_id);
                           return (
                             <tr key={h.id} className="border-b border-white/5">
                               <td className="p-8 font-bold uppercase text-sm">{proj?.title || h.project_id}</td>
                               <td className="p-8 font-mono text-white/60">{h.quantity} BK</td>
                               <td className="p-8 font-bold">₹{(h.quantity * (proj?.market_price || 0)).toLocaleString()}</td>
                               <td className="p-8 text-right">
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedProject(proj); setActiveTab('marketplace'); }}>TRADE</Button>
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
      </AnimatePresence>

      <ModifyOrderModal 
        isOpen={!!modifyingOrder} 
        onClose={() => setModifyingOrder(null)} 
        order={modifyingOrder} 
        onModify={handleModifyExecute} 
      />
    </div>
  );
};

export default SecondaryMarket;
