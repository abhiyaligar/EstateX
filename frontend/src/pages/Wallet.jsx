import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Building, Trash2, Clock, Loader2, Minus, Shield } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import AddBankAccountModal from '../components/profile/AddBankAccountModal';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [wallet, banks] = await Promise.all([
        walletService.getWalletContext(),
        userService.getBankAccounts()
      ]);
      setWalletData(wallet);
      setBankAccounts(banks);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || bankAccounts.length === 0) return;
    
    setIsDepositing(true);
    try {
      await walletService.depositFunds(parseFloat(depositAmount), bankAccounts[0].id);
      setDepositAmount('');
      setShowDepositModal(false);
      await fetchData(); // Refresh
      alert("Deposit successful!");
    } catch (error) {
      console.error("Deposit failed", error);
      alert("Deposit failed. Check your bank connection.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || bankAccounts.length === 0) return;
    
    setIsWithdrawing(true);
    try {
      await walletService.withdrawFunds(parseFloat(withdrawAmount), bankAccounts[0].id);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      await fetchData(); // Refresh
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Withdrawal failed. Check your balance.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <div className="py-24"><Loader size={48} text="Loading your wallet..." /></div>;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white font-heading">
          My Wallet
        </h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Manage your funds, linked bank accounts, and view transaction history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl shadow-primary-500/20">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-primary-100 text-sm font-medium mb-1">Liquid Balance</p>
                  <h2 className="text-5xl font-bold font-heading text-white">
                    ₹{(walletData?.balance || 0).toLocaleString()}
                  </h2>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <WalletIcon size={32} />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  className="bg-white text-primary-700 hover:bg-primary-50 border-none px-8"
                  onClick={() => setShowDepositModal(true)}
                >
                  <Plus size={18} className="mr-2" /> Deposit
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <Minus size={18} className="mr-2" /> Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </div>
              <Clock className="text-secondary-400" size={20} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {walletData?.recent_transactions?.length > 0 ? (
                  walletData.recent_transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-secondary-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.transaction_type === 'deposit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary-100 text-secondary-600 dark:bg-slate-800 dark:text-secondary-400'}`}>
                          {tx.transaction_type === 'deposit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-secondary-900 dark:text-white capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            {new Date(tx.created_at).toLocaleDateString()} • {tx.description || 'System Transaction'}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.transaction_type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-secondary-900 dark:text-white'}`}>
                        {tx.transaction_type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-secondary-500">
                    No transactions yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Bank Accounts & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bank Accounts</CardTitle>
              <CardDescription>Linked sources for funds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankAccounts.length > 0 ? (
                bankAccounts.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-3 border border-secondary-100 dark:border-secondary-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building className="text-secondary-400" size={18} />
                      <div>
                        <p className="text-sm font-semibold text-secondary-900 dark:text-white">{bank.bank_name}</p>
                        <p className="text-xs text-secondary-500">****{bank.account_number.slice(-4)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-secondary-500 text-center py-4 italic border-2 border-dashed border-secondary-100 dark:border-secondary-800 rounded-xl">
                  No bank accounts linked.
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-2 border-primary-100 text-primary-600 hover:bg-primary-50 dark:border-primary-900/30 dark:text-primary-400"
                onClick={() => setShowAddBankModal(true)}
              >
                <Plus size={16} className="mr-2" /> Add Bank Account
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary-900 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                <p className="text-secondary-400 text-sm mb-4 leading-relaxed">
                  Our support team is available 24/7 for any financial or account-related inquiries.
                </p>
                <Button className="w-full bg-white text-secondary-900 hover:bg-secondary-100 border-none">
                  Contact Support
                </Button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Shield size={120} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Bank Account Modal */}
      <AddBankAccountModal 
        isOpen={showAddBankModal}
        onClose={() => setShowAddBankModal(false)}
        onSuccess={() => fetchData(true)}
      />

      {/* Deposit Modal */}
      <Modal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)}
        title="Deposit Funds"
      >
        <form onSubmit={handleDeposit} className="space-y-6">
          <Input 
            label="Amount (INR)"
            type="number"
            placeholder="Enter amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
          />
          <div className="p-4 bg-secondary-50 dark:bg-slate-900 rounded-2xl">
             <p className="text-xs text-secondary-500 uppercase font-bold mb-2">Linked Bank Account</p>
             {bankAccounts.length > 0 ? (
               <div className="flex items-center gap-3">
                 <Building size={16} className="text-primary-500" />
                 <span className="text-sm font-medium">{bankAccounts[0].bank_name} - ****{bankAccounts[0].account_number.slice(-4)}</span>
               </div>
             ) : (
               <p className="text-sm text-red-500">Please link a bank account first in profile.</p>
             )}
          </div>
          <Button className="w-full h-12" type="submit" isLoading={isDepositing} disabled={bankAccounts.length === 0}>
            Confirm Deposit
          </Button>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
      >
        <form onSubmit={handleWithdraw} className="space-y-6">
          <Input 
            label="Amount (INR)"
            type="number"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
          />
          <Button className="w-full h-12" type="submit" isLoading={isWithdrawing} disabled={bankAccounts.length === 0}>
            Confirm Withdrawal
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Wallet;
