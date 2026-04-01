import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { kycService } from '../services/kycService';
import { CheckCircle2, Shield, Mail, CreditCard, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KYC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [kycSessionId, setKycSessionId] = useState('');
  const [kycStatus, setKycStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await kycService.getStatus();
        setKycStatus(data);
        if (data.status === 'approved') setStep(4);
      } catch (err) {
        console.error("KYC status check failed", err);
      }
    };
    checkStatus();
  }, []);

  const handleInitiate = async () => {
    if (aadhaar.length !== 12 || pan.length !== 10) {
      setError('Please provide a valid 12-digit Aadhaar and 10-character PAN.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await kycService.initiateKYC({ aadhaar, pan });
      setKycSessionId(result.kyc_session_id);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate KYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await kycService.verifyOTP(otp, kycSessionId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPAN = async () => {
    setLoading(true);
    setError('');
    try {
      await kycService.verifyPAN(pan, kycSessionId);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'PAN verification failed. Ensure the number is correct.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mx-auto text-primary-600">
               <Shield size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">Identity Verification</h2>
              <p className="text-secondary-500 max-w-sm mx-auto">
                Secure your account and unlock higher investment limits by completing our quick KYC process.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="12-digit Aadhaar Number"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                icon={CreditCard}
              />
              <Input 
                placeholder="10-character PAN Number"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                maxLength={10}
                icon={CreditCard}
              />
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              <div className="flex items-center gap-3 text-sm text-secondary-600 bg-secondary-50 dark:bg-slate-900 p-4 rounded-xl text-left">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Verified investors get 24/7 priority support.</span>
              </div>
              <Button className="w-full h-12" onClick={handleInitiate} isLoading={loading}>
                Start Verification <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        );
      case 1: // OTP
        return (
          <div className="space-y-6">
            <button onClick={() => setStep(0)} className="text-secondary-400 hover:text-secondary-600 flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">Verify Email</h2>
              <p className="text-secondary-500">Enter the 6-digit code sent to your email.</p>
            </div>
            <div className="space-y-4">
              <Input 
                icon={Mail}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button className="w-full h-12" onClick={handleVerifyOTP} isLoading={loading}>
                Verify Code
              </Button>
            </div>
          </div>
        );
      case 2: // PAN
        return (
          <div className="space-y-6">
             <div className="space-y-2">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">PAN Verification</h2>
              <p className="text-secondary-500">Government ID is required for real estate tax compliance.</p>
            </div>
            <div className="space-y-4">
              <Input 
                icon={CreditCard}
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button className="w-full h-12" onClick={handleVerifyPAN} isLoading={loading}>
                Verify PAN
              </Button>
            </div>
          </div>
        );
      case 3: // Linking Bank (Instructions for next step)
        return (
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto text-green-600">
               <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">KYC Submitted!</h2>
              <p className="text-secondary-500">Your documents are being processed. This usually takes 2-4 hours.</p>
            </div>
            <Button className="w-full h-12" onClick={() => navigate('/dashboard/profile')}>
              Go to Profile
            </Button>
          </div>
        );
      case 4: // Already Approved
        return (
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-primary-500/20">
               <Shield size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">You're Verified!</h2>
              <p className="text-secondary-500">Your identity is successfully verified. You have full access to all features.</p>
            </div>
            <Button className="w-full h-12" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="p-1">
          {/* Progress Bar */}
          {step < 3 && (
            <div className="flex h-1 gap-1 px-4 pt-4">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${
                    i <= step ? 'bg-primary-500' : 'bg-secondary-100 dark:bg-secondary-800'
                  }`}
                />
              ))}
            </div>
          )}
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default KYC;
