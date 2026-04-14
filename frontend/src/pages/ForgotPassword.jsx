import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import userService from '../services/userService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await userService.requestPasswordReset(email);
      // Simulating email dispatch by showing the OTP in a toast or alert directly
      alert(`DEMO MODE:\nYour generated OTP is: ${response.otp}\nUse this to reset your password.`);
      setSuccess('OTP has been generated. Please check your email (simulated).');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request password reset. User may not exist.');
    } finally {
      setIsSubmitting(false);
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

    try {
      await userService.resetPassword(email, otp, newPassword);
      setSuccess('Password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. OTP may be invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl shadow-primary-500/10 dark:bg-slate-900 border border-secondary-100 dark:border-secondary-800">
        <div className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary-500" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            {step === 1 
              ? "Enter your email we'll send you an OTP to reset it."
              : "Enter the OTP we generated and your new password."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="space-y-4">
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                icon={Mail}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
              />
            </div>

            <div>
               <Button type="submit" className="w-full" isLoading={isSubmitting}>
                 Send OTP
               </Button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <Input
                label="6-Digit OTP Code"
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(''); }}
                placeholder="123456"
              />
              <Input
                label="New Password"
                id="newPassword"
                name="newPassword"
                type="password"
                required
                icon={Lock}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
              />
            </div>

            <div>
               <Button type="submit" className="w-full" isLoading={isSubmitting}>
                 Reset Password
               </Button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
