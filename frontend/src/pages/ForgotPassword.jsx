import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await userService.requestPasswordReset(email);
      setSuccess('A 6-digit OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request password reset. User may not exist.');
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
        setSuccess('A new 6-digit OTP has been sent to your email.');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await userService.resetPassword(email, otp, newPassword);
      setSuccess('Password reset! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. OTP may be invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col selection:bg-surface/30">
      {/* Header */}
      <nav className="h-14 md:h-16 px-6 md:px-12 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-background z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xs md:text-sm font-black tracking-[0.4em] uppercase text-[#D4AF37]">EstateX</span>
        </Link>
        <Link to="/login" className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors">
          Back to Login
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-surface/5 rounded-full blur-[120px] pointer-events-none opacity-40" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[360px] md:max-w-[400px] space-y-8 md:space-y-10 relative z-10"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-none">
              {step === 1 ? 'Reset Access' : 'Verify Identity'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 text-[10px] md:text-[11px] font-medium tracking-wide">
              {step === 1 ? 'Enter your institutional email to proceed.' : 'Enter the authorization code sent to your email.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="investor@domain.com"
                  required
                  className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-2 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>

              {error && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest text-center">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-surface text-black py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-surface transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Request Authorization'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">6-Digit Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setError(''); }}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-2 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 dark:text-zinc-100 font-medium text-center tracking-[0.5em]"
                />
                <p className="text-[9px] text-[#D4AF37]/50 mt-2 text-center uppercase tracking-widest">{success || `Code sent to ${email}`}</p>
                <div className="flex justify-center mt-4">
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                      resendTimer > 0 ? 'text-zinc-700' : 'text-[#D4AF37]/70 hover:text-[#D4AF37]'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-2 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-2 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>

              {error && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest text-center">{error}</p>}
              {success && success.includes('Redirecting') && <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest text-center">{success}</p>}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-surface text-black py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-surface transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Confirm New Password'}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-[9px] font-bold text-zinc-600 hover:text-foreground transition-colors uppercase tracking-widest">
              Return to Login
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ForgotPassword;
