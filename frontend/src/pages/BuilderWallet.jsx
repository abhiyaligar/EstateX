import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { walletService } from '../services/walletService';
import { Building, ArrowUpRight, ArrowDownRight, Clock, Loader2, Minus, Shield, Award, Briefcase } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import builderService from '../services/builderService';

const BuilderWallet = () => {
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawStep, setWithdrawStep] = useState(1); // 1 = Amount, 2 = OTP
    const [otp, setOtp] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        company_name: '',
        bank_account_name: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc_code: ''
    });
    const [isSavingBank, setIsSavingBank] = useState(false);

    const fetchData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await walletService.getBuilderWalletContext();
            setWalletData(data);
            // Also fetch builder profile for bank details
            const profile = await builderService.getProfile().catch(() => null);
            if (profile) {
                setBankDetails({
                    company_name: profile.company_name || '',
                    bank_account_name: profile.bank_account_name || '',
                    bank_name: profile.bank_name || '',
                    bank_account_number: profile.bank_account_number || '',
                    bank_ifsc_code: profile.bank_ifsc_code || ''
                });
            }
        } catch (error) {
            console.error("Failed to fetch builder wallet data", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        
        setIsWithdrawing(true);
        try {
            if (withdrawStep === 1) {
                if (!withdrawAmount) return;
                await walletService.initiateBuilderWithdrawal(parseFloat(withdrawAmount), 'business_bank_default');
                setWithdrawStep(2);
            } else {
                if (!otp) return;
                await walletService.verifyBuilderWithdrawal(otp);
                setWithdrawAmount('');
                setOtp('');
                setWithdrawStep(1);
                setShowWithdrawModal(false);
                await fetchData();
                alert("Withdrawal verified successfully!");
            }
        } catch (error) {
            const msg = error.response?.data?.detail || "Withdrawal failed.";
            alert(msg);
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleRegisterBank = async (e) => {
        e.preventDefault();
        setIsSavingBank(true);
        try {
            await builderService.updateBankAccount(bankDetails);
            alert("Bank account details registered successfully!");
            setShowRegisterModal(false);
            await fetchData(true);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to register bank account.");
        } finally {
            setIsSavingBank(false);
        }
    };

    if (loading) return <div className="py-24"><Loader size={48} text="Accessing business ledger..." /></div>;

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-1.5 rounded-lg">
                            <Briefcase size={16} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Business Account</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-foreground font-heading">
                        Builder Wallet
                    </h1>
                    <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                        Manage construction revenue, milestone payouts, and business withdrawals.
                    </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl max-w-md">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                        <Shield size={14} className="inline mr-1 mb-1" />
                        <strong>Security Note:</strong> These funds are architecturally separated from your personal investments. Withdrawals require business authentication.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Balance Card */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-slate-900 text-foreground border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <CardContent className="p-10 relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Withdrawable Revenue</p>
                                    <h2 className="text-6xl font-bold font-heading text-foreground tracking-tight">
                                        ₹{(walletData?.balance || 0).toLocaleString()}
                                    </h2>
                                </div>
                                <div className="bg-foreground/10 p-4 rounded-2xl backdrop-blur-md border border-border">
                                    <Building size={32} className="text-indigo-400" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-500 text-foreground border-none px-10 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-600/20"
                                    onClick={() => setShowWithdrawModal(true)}
                                >
                                    <Minus size={20} className="mr-2" /> Release to Bank
                                </Button>
                            </div>
                        </CardContent>
                        {/* Decorative background element */}
                        <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12">
                            <Building size={300} />
                        </div>
                    </Card>

                    {/* Transaction History */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-8">
                            <div>
                                <CardTitle className="text-xl">Business Ledger</CardTitle>
                                <CardDescription>Construction earnings & operational withdrawals</CardDescription>
                            </div>
                            <div className="bg-secondary-50 dark:bg-slate-800 p-2 rounded-xl">
                                <Clock className="text-secondary-400" size={20} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {walletData?.recent_transactions?.length > 0 ? (
                                    walletData.recent_transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-secondary-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-200 border border-transparent hover:border-secondary-100 dark:hover:border-slate-700">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-3 rounded-2xl ${tx.transaction_type === 'milestone_payout' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-secondary-100 text-secondary-600 dark:bg-slate-800 dark:text-secondary-400'}`}>
                                                    {tx.transaction_type === 'milestone_payout' ? <Award size={24} /> : <ArrowUpRight size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary-900 dark:text-foreground text-lg leading-tight capitalize">
                                                        {tx.transaction_type === 'milestone_payout' ? 'Phase Payout' : tx.transaction_type.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                                                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {tx.description || 'Project Fund Release'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xl font-bold font-heading ${tx.transaction_type === 'milestone_payout' ? 'text-indigo-600 dark:text-indigo-400' : 'text-secondary-900 dark:text-foreground'}`}>
                                                    {tx.transaction_type === 'milestone_payout' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                                                </p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-slate-800 text-secondary-500">
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-secondary-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-secondary-100 dark:border-slate-800">
                                        <Building className="mx-auto text-secondary-300 dark:text-slate-700 mb-4" size={48} />
                                        <p className="text-secondary-500 dark:text-slate-400 font-medium">No business transactions found yet.</p>
                                        <p className="text-xs text-secondary-400 mt-1">Funds will appear when project milestones are approved.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Support & Guides */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 text-foreground overflow-hidden relative">
                        <CardContent className="p-8 relative z-10">
                            <h3 className="text-xl font-bold mb-3 tracking-tight">Withdrawal Process</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed opacity-90">
                                Funds released to your Builder Wallet are available for immediate withdrawal to your registered business bank account.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm text-indigo-50">
                                    <div className="h-5 w-5 rounded-full bg-foreground/20 flex items-center justify-center text-[10px] font-bold">1</div>
                                    Verify project milestone
                                </li>
                                <li className="flex items-center gap-3 text-sm text-indigo-50">
                                    <div className="h-5 w-5 rounded-full bg-foreground/20 flex items-center justify-center text-[10px] font-bold">2</div>
                                    Funds land in Business Wallet
                                </li>
                                <li className="flex items-center gap-3 text-sm text-indigo-50">
                                    <div className="h-5 w-5 rounded-full bg-foreground/20 flex items-center justify-center text-[10px] font-bold">3</div>
                                    Transfer to Bank via OTP
                                </li>
                            </ul>
                            <Button 
                                className="w-full bg-white text-indigo-600 hover:bg-primary-50 border-none font-bold h-12 rounded-xl"
                                onClick={() => setShowRegisterModal(true)}
                            >
                                {bankDetails.bank_account_number ? 'Update Bank Account' : 'Register New Account'}
                            </Button>
                        </CardContent>
                        <div className="absolute -right-12 -bottom-12 opacity-10">
                            <Shield size={160} />
                        </div>
                    </Card>

                    <Card className="border-secondary-100 dark:border-slate-800 bg-secondary-50/30 dark:bg-slate-900/30">
                        <CardHeader>
                            <CardTitle className="text-base">Support & Audit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-secondary-500 leading-relaxed">
                                Need technical assistance with fund releases? Our builder support desk is active.
                            </p>
                            <Button variant="outline" className="w-full border-secondary-200 dark:border-slate-700 text-secondary-600 dark:text-slate-300">
                                Download Yearly Statement
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Withdraw Modal */}
            <Modal
                isOpen={showWithdrawModal}
                onClose={() => { setShowWithdrawModal(false); setWithdrawStep(1); setOtp(''); }}
                title="Business Revenue Withdrawal"
            >
                <form onSubmit={handleWithdraw} className="space-y-6 pt-2">
                    {withdrawStep === 1 ? (
                      <>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-start gap-4 mb-2">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl">
                                <Shield className="text-indigo-500" size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Security Verification</p>
                                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">An OTP will be sent to your registered email to authorize this withdrawal.</p>
                            </div>
                        </div>

                        <Input
                            label="Amount to Withdraw (INR)"
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                            className="h-14 text-lg"
                        />
                      </>
                    ) : (
                      <>
                        <Input
                            label="Business OTP Verification"
                            type="text"
                            placeholder="6-DIGIT CODE"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            className="h-14 tracking-widest text-center text-xl"
                        />
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 text-center">We've sent a 6-digit code to your email.</p>
                      </>
                    )}

                    <div className="py-2">
                        <p className="text-[10px] text-secondary-500 text-center uppercase font-bold tracking-widest">Payout Destination</p>
                        <p className="text-sm text-secondary-900 dark:text-foreground text-center font-medium mt-1">
                            {bankDetails.bank_account_number ? `${bankDetails.bank_name} - ${bankDetails.bank_account_number}` : 'No verified account registered'}
                        </p>
                    </div>

                    <Button className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20" type="submit" isLoading={isWithdrawing}>
                        {withdrawStep === 1 ? 'Initiate Payout' : 'Verify & Execute'}
                    </Button>
                </form>
            </Modal>

            {/* Register Bank Modal */}
            <Modal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                title="Register Business Bank Account"
            >
                <form onSubmit={handleRegisterBank} className="space-y-4 pt-2">
                    <Input
                        label="Official Company Name"
                        value={bankDetails.company_name}
                        onChange={(e) => setBankDetails({ ...bankDetails, company_name: e.target.value })}
                        required
                        placeholder="e.g. Acme Constructions Ltd"
                    />
                    <Input
                        label="Account Holder Name"
                        value={bankDetails.bank_account_name}
                        onChange={(e) => setBankDetails({ ...bankDetails, bank_account_name: e.target.value })}
                        required
                        placeholder="Official Bank Account Name"
                    />
                    <Input
                        label="Bank Name"
                        value={bankDetails.bank_name}
                        onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                        required
                        placeholder="e.g. HDFC Bank"
                    />
                    <Input
                        label="Account Number"
                        value={bankDetails.bank_account_number}
                        onChange={(e) => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
                        required
                        placeholder="0000000000000000"
                    />
                    <Input
                        label="IFSC Code"
                        value={bankDetails.bank_ifsc_code}
                        onChange={(e) => setBankDetails({ ...bankDetails, bank_ifsc_code: e.target.value.toUpperCase() })}
                        required
                        placeholder="HDFC0001234"
                    />
                    
                    <div className="pt-4">
                        <Button className="w-full h-14 text-lg font-bold" type="submit" isLoading={isSavingBank}>
                            Save Bank Details
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BuilderWallet;
