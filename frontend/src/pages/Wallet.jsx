import React, { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Building, Trash2, Clock, Loader2, Minus, Shield, X, AlertCircle, CheckCircle2, ArrowRight, Briefcase, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import AddBankAccountModal from '../components/profile/AddBankAccountModal';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui/Loader';

const Wallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [builderWalletData, setBuilderWalletData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState(1); // 1 = Amount, 2 = OTP
  const [withdrawOtp, setWithdrawOtp] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [activeWalletType, setActiveWalletType] = useState('personal'); // 'personal' or 'builder'

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const isBuilder = user?.role === 'builder';
      
      const calls = [
        walletService.getWalletContext(),
        userService.getBankAccounts()
      ];
      
      if (isBuilder) {
        calls.push(walletService.getBuilderWalletContext());
      }

      const results = await Promise.all(calls);
      setWalletData(results[0]);
      setBankAccounts(results[1]);
      if (isBuilder) {
        setBuilderWalletData(results[2]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || bankAccounts.length === 0) return;
    setIsDepositing(true);
    try {
      // Deposits always go to personal for now as per system logic
      await walletService.depositFunds(parseFloat(depositAmount), bankAccounts[0].id);
      setDepositAmount('');
      setShowDepositModal(false);
      await fetchData(true);
    } catch (error) {
      console.error("Deposit failed", error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || bankAccounts.length === 0) return;
    setIsWithdrawing(true);
    try {
      if (withdrawStep === 1) {
        if (activeWalletType === 'builder') {
          await walletService.initiateBuilderWithdrawal(parseFloat(withdrawAmount), bankAccounts[0].id);
        } else {
          await walletService.initiateWithdrawal(parseFloat(withdrawAmount), bankAccounts[0].id);
        }
        setWithdrawStep(2);
      } else {
        if (activeWalletType === 'builder') {
          await walletService.verifyBuilderWithdrawal(withdrawOtp);
        } else {
          await walletService.verifyWithdrawal(withdrawOtp);
        }
        setWithdrawAmount('');
        setWithdrawOtp('');
        setWithdrawStep(1);
        setShowWithdrawModal(false);
        await fetchData(true);
      }
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert(error.response?.data?.detail || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
         <Loader size={32} text="SYNCHRONIZING LIQUIDITY NODES..." />
      </div>
    );
  }

  const activeData = activeWalletType === 'builder' ? builderWalletData : walletData;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-gold/30 pb-20 px-6 md:px-12 pt-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Institutional Header */}
        <header className="mb-16 space-y-8 border-b border-border pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-12">
             <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                   <WalletIcon size={14} className="text-accent-orange animate-pulse" />
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Capital Ledger</p>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-black tracking-[-0.05em] uppercase leading-[0.9]">
                  Sovereign <br className="hidden md:block" /> <span className="text-foreground/10">Liquidity</span>
                </h1>
                <p className="text-sm md:text-lg text-foreground/40 max-w-2xl leading-relaxed mt-4">
                  Dual-node auditing of your capital assets. Manage universal personal funds alongside institutional business liquidity.
                </p>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { setActiveWalletType('personal'); setShowDepositModal(true); }}
                  className="bg-foreground text-background px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-orange transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={14} /> Deposit Capital
                </button>
                <button 
                  onClick={() => { setWithdrawStep(1); setWithdrawOtp(''); setShowWithdrawModal(true); }}
                  className="border border-border text-foreground px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/[0.05] transition-all flex items-center justify-center gap-3"
                >
                  <Minus size={14} /> Withdraw Funds
                </button>
             </div>
          </div>
          
          {/* Node Switcher for Builders */}
          {user?.role === 'builder' && (
            <div className="flex gap-8 pt-4">
               <button 
                 onClick={() => setActiveWalletType('personal')}
                 className={`flex items-center gap-3 pb-4 border-b-2 transition-all ${activeWalletType === 'personal' ? 'border-accent-orange text-foreground' : 'border-transparent text-foreground/30 hover:text-foreground/50'}`}
               >
                  <User size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Node</span>
               </button>
               <button 
                 onClick={() => setActiveWalletType('builder')}
                 className={`flex items-center gap-3 pb-4 border-b-2 transition-all ${activeWalletType === 'builder' ? 'border-accent-orange text-foreground' : 'border-transparent text-foreground/30 hover:text-foreground/50'}`}
               >
                  <Briefcase size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Business Node</span>
               </button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Main Financial Audit Column */}
          <div className="lg:col-span-2 space-y-16">
             {/* Balance Node */}
             <div className="p-8 md:p-12 bg-foreground/[0.03] border border-border relative overflow-hidden group hover:border-accent-gold/30 transition-all duration-500">
                <div className="relative z-10 space-y-8">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">
                        {activeWalletType === 'builder' ? 'Institutional Business Balance' : 'Universal Liquid Balance'}
                      </p>
                      <div className="bg-foreground/[0.03] p-3 border border-border">
                         <Shield size={20} className="text-accent-orange" />
                      </div>
                   </div>
                   <h2 className="text-5xl md:text-8xl font-heading font-black tracking-tighter">
                     ₹{(activeData?.balance || 0).toLocaleString()}
                   </h2>
                   <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-accent-gold">
                      <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                      Audited & Verified
                   </div>
                </div>
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
             </div>

             {/* Ledger Audit */}
             <div className="space-y-10">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                     {activeWalletType === 'builder' ? 'Institutional Ledger Sequence' : 'Universal Ledger Sequence'}
                   </h3>
                   <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-foreground/20">
                      <span>Live Sync Active</span>
                   </div>
                </div>
                <div className="space-y-4">
                   {activeData?.recent_transactions?.length > 0 ? (
                     activeData.recent_transactions.slice(0, 5).map((tx, i) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.05 }}
                         key={tx.id} 
                         className="flex items-center justify-between p-6 bg-foreground/[0.03] border border-border hover:bg-foreground/[0.04] transition-all group"
                       >
                         <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 flex items-center justify-center border ${Number(tx.amount) >= 0 ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-foreground/10 text-foreground/40 bg-foreground/5'}`}>
                               {Number(tx.amount) >= 0 ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-foreground uppercase tracking-tight mb-1">{(tx.transaction_type || 'TRANSACTION').replace('_', ' ')}</p>
                               <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                                 {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} // {tx.description || 'System Audit'}
                               </p>
                            </div>
                         </div>
                          <div className="text-right">
                            <p className={`text-lg font-black tracking-tighter ${Number(tx.amount) >= 0 ? 'text-accent-gold' : 'text-foreground'}`}>
                               {Number(tx.amount) >= 0 ? '+' : '-'}₹{Math.abs(Number(tx.amount)).toLocaleString()}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-foreground/10">Success</p>
                          </div>
                       </motion.div>
                     ))
                   ) : (
                     <div className="py-20 text-center border border-border bg-foreground/[0.03]">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/10">Zero Transaction Data Identified</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Bank & Security Column */}
          <div className="space-y-16">
             {/* Bank Nodes */}
             <div className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Linked Bank Nodes</h3>
                <div className="space-y-4">
                   {bankAccounts.length > 0 ? (
                     bankAccounts.map((bank) => (
                       <div key={bank.id} className="p-6 bg-foreground/[0.03] border border-border space-y-4 group hover:border-foreground/10 transition-all">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-4">
                                <Building size={16} className="text-accent-orange" />
                                <div>
                                   <p className="text-xs font-bold text-foreground uppercase tracking-tight">{bank.bank_name}</p>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">Audit Node: ****{bank.account_number.slice(-4)}</p>
                                </div>
                             </div>
                             <button className="text-foreground/10 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-10 text-center border-2 border-dashed border-border text-foreground/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Bank Nodes Connected</p>
                     </div>
                   )}
                   <button 
                     onClick={() => setShowAddBankModal(true)}
                     className="w-full py-4 border border-border text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center gap-3"
                   >
                     <Plus size={14} /> Connect New Node
                   </button>
                </div>
             </div>

             {/* Security Signature */}
             <div className="p-8 bg-foreground/[0.03] border border-border space-y-6 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-3"><Shield size={14} className="text-accent-orange" /><p className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Grade Security</p></div>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                     Your capital ledger is secured by bank-grade encryption nodes. All deployments are audited in real-time by the Sovereign compliance engine.
                   </p>
                   <button className="text-[9px] font-black uppercase tracking-widest text-foreground hover:text-accent-orange transition-colors flex items-center gap-2">Audit Compliance Node <ArrowRight size={10} /></button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Institutional Modals */}
      <AddBankAccountModal isOpen={showAddBankModal} onClose={() => setShowAddBankModal(false)} onSuccess={() => fetchData(true)} />
      
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Capital Deployment" subtitle="Deposit Sequence">
        <form onSubmit={handleDeposit} className="space-y-10 py-4">
          <div className="space-y-4">
             <label className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30">Deployment Amount (INR)</label>
             <input 
               type="number"
               placeholder="ENTER VALUE..."
               value={depositAmount}
               onChange={(e) => setDepositAmount(e.target.value)}
               className="w-full bg-foreground/[0.04] border border-border p-6 text-2xl font-bold tracking-tighter focus:outline-none focus:border-accent-orange transition-all text-foreground"
               required
             />
          </div>
          <div className="p-6 bg-foreground/[0.02] border border-border space-y-4">
             <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20">Source Node</p>
             {bankAccounts.length > 0 ? (
               <div className="flex items-center gap-4">
                 <Building size={16} className="text-accent-orange" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{bankAccounts[0].bank_name} // ****{bankAccounts[0].account_number.slice(-4)}</span>
               </div>
             ) : (
               <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Action Required: Link Bank Node</p>
             )}
          </div>
          <button 
            type="submit" 
            disabled={isDepositing || bankAccounts.length === 0}
            className="w-full bg-foreground text-background py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-accent-orange transition-all disabled:opacity-50"
          >
            {isDepositing ? 'SYNCHRONIZING...' : 'AUTHORIZE DEPLOYMENT'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showWithdrawModal} onClose={() => { setShowWithdrawModal(false); setWithdrawStep(1); setWithdrawOtp(''); }} title="Capital Liquidation" subtitle={`${activeWalletType === 'builder' ? 'Business' : 'Universal'} Withdrawal Sequence`}>
        <form onSubmit={handleWithdraw} className="space-y-10 py-4">
          {withdrawStep === 1 ? (
            <div className="space-y-4">
               <label className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30">Liquidation Amount (INR)</label>
               <input 
                 type="number"
                 placeholder="ENTER VALUE..."
                 value={withdrawAmount}
                 onChange={(e) => setWithdrawAmount(e.target.value)}
                 className="w-full bg-foreground/[0.04] border border-border p-6 text-2xl font-bold tracking-tighter focus:outline-none focus:border-accent-orange transition-all text-foreground"
                 required
               />
            </div>
          ) : (
            <div className="space-y-4">
               <label className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30">OTP Verification</label>
               <input 
                 type="text"
                 placeholder="6-DIGIT CODE"
                 value={withdrawOtp}
                 onChange={(e) => setWithdrawOtp(e.target.value)}
                 maxLength={6}
                 className="w-full bg-foreground/[0.04] border border-border p-6 text-2xl font-bold tracking-widest text-center focus:outline-none focus:border-accent-orange transition-all text-foreground"
                 required
               />
               <p className="text-[9px] text-foreground/40 text-center uppercase tracking-widest">A verification code has been sent to your email.</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isWithdrawing || bankAccounts.length === 0}
            className="w-full bg-foreground text-background py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-accent-orange transition-all disabled:opacity-50"
          >
            {isWithdrawing ? 'SYNCHRONIZING...' : (withdrawStep === 1 ? 'INITIATE LIQUIDATION' : 'VERIFY LIQUIDATION')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Wallet;
