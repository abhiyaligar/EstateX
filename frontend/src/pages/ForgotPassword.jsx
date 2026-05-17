import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, ArrowLeft, Mail, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your institutional email');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await userService.requestPasswordReset(email);
      setSuccess('A 6-digit authorization code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request authorization. Verify your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  useEffect(() => {
    if (step === 2) {
      setResendTimer(60);
    }
  }, [step]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      const result = await resendOtp(email, 'forgot_password');
      if (result.success) {
        setResendTimer(60);
        setSuccess('A new 6-digit code has been sent.');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend authorization code.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all security fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Access keys do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Access key must be at least 8 characters');
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await userService.resetPassword(email, otp, newPassword);
      setSuccess('Access key updated. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Identity verification failed. Invalid code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      {/* Header */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-border bg-background z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-accent-orange rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(176, 38, 255,0.4)] transition-transform group-hover:scale-105">
            <Zap size={20} className="text-foreground fill-white" />
          </div>
          <span className="text-lg md:text-xl font-heading font-black tracking-tighter text-foreground uppercase">EstateX</span>
        </Link>
        <Link to="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-accent-orange/5 rounded-full blur-[160px] pointer-events-none opacity-20" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-12 relative z-10"
        >
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground leading-[0.9] uppercase">
              {step === 1 ? 'Recovery' : 'Verification'}
            </h1>
            <p className="text-foreground/40 text-[11px] font-medium tracking-[0.1em] uppercase">
              {step === 1 ? 'Initiate identity restoration protocol.' : 'Confirm authorization code sent to your terminal.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOTP} 
                className="space-y-10"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Institutional Email</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="investor@domain.com"
                      required
                      className="w-full bg-transparent border-b border-border py-4 pl-10 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/20 font-medium"
                    />
                  </div>
                </div>

                {error && <p className="text-accent-orange text-[10px] font-black uppercase tracking-[0.2em] text-center bg-accent-orange/5 py-2 border border-accent-orange/10 rounded-lg">{error}</p>}
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent-orange text-foreground py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-accent-orange/90 transition-all flex items-center justify-center gap-4 shadow-[0_20px_60px_-10px_rgba(176, 38, 255,0.3)] hover:scale-[1.02] hover:-rotate-1 active:scale-[0.98] group"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      Authorize Recovery
                      <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                        <ArrowRight size={18} />
                      </div>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword} 
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Verification Code</label>
                    <div className="relative group/input">
                      <ShieldCheck className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value); setError(''); }}
                        placeholder="000000"
                        required
                        maxLength={6}
                        className="w-full bg-transparent border-b border-border py-4 pl-10 text-2xl tracking-[0.6em] focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/5 font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <p className="text-[9px] text-foreground/30 uppercase tracking-widest">{success || `Code sent to terminal`}</p>
                       <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                          resendTimer > 0 ? 'text-foreground/20' : 'text-accent-orange hover:text-accent-orange/80'
                        }`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">New Access Key</label>
                    <div className="relative group/input">
                      <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-b border-border py-4 pl-10 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/20 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Confirm Access Key</label>
                    <div className="relative group/input">
                      <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-b border-border py-4 pl-10 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/20 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-accent-orange text-[10px] font-black uppercase tracking-[0.2em] text-center bg-accent-orange/5 py-2 border border-accent-orange/10 rounded-lg">{error}</p>}
                {success && success.includes('Redirecting') && <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] text-center bg-emerald-500/5 py-2 border border-emerald-500/10 rounded-lg">{success}</p>}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent-orange text-foreground py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-accent-orange/90 transition-all flex items-center justify-center gap-4 shadow-[0_20px_60px_-10px_rgba(176, 38, 255,0.3)] hover:scale-[1.02] hover:-rotate-1 active:scale-[0.98] group"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      Finalize Recovery
                      <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                        <ArrowRight size={18} />
                      </div>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default ForgotPassword;
