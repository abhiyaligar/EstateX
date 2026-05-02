import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, KeyRound, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle, sendAuthOtp, verifyAuthOtp, resendOtp, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState(1); // 1 = Email, 2 = OTP Code
  const [otpCode, setOtpCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  useEffect(() => {
    let interval;
    if (loginMethod === 'otp' && otpStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginMethod, otpStep, resendTimer]);

  useEffect(() => {
    if (loginMethod === 'otp' && otpStep === 2) {
      setResendTimer(60);
    }
  }, [loginMethod, otpStep]);
  
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      const result = await resendOtp(formData.email, 'login');
      if (result.success) {
        setResendTimer(60);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginMethod === 'password') {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        // OTP Login Flow
        if (otpStep === 1) {
          const result = await sendAuthOtp(formData.email);
          if (result.success) {
            setOtpStep(2);
          } else {
            setError(result.error);
          }
        } else {
          const result = await verifyAuthOtp(formData.email, otpCode);
          if (!result.success) {
            setError(result.error);
          }
        }
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] text-white flex flex-col selection:bg-[#D4AF37]/30">
      {/* Header - More compact */}
      <nav className="h-14 md:h-16 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xs md:text-sm font-black tracking-[0.4em] uppercase text-[#D4AF37]">EstateX</span>
        </Link>
        <Link to="/register" className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
          Register
        </Link>
      </nav>

      {/* Main Content - Centered and Viewport Constrained */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Subtle Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none opacity-40" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[360px] md:max-w-[400px] space-y-4 md:space-y-6 relative z-10"
        >
          {/* Titles - Compacted */}
          <div className="text-center space-y-1 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">Welcome Back</h1>
            <p className="text-zinc-500 text-[9px] md:text-[10px] font-medium tracking-wide uppercase tracking-[0.2em]">Institutional Wealth Terminal</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-sm mb-4">
            <button 
              className={`flex-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] py-2 transition-all ${loginMethod === 'password' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white'}`}
              onClick={() => { setLoginMethod('password'); setOtpStep(1); setError(''); }}
            >
              Password
            </button>
            <button 
              className={`flex-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] py-2 transition-all ${loginMethod === 'otp' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white'}`}
              onClick={() => { setLoginMethod('otp'); setOtpStep(1); setError(''); }}
            >
              OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email Field - Always visible unless in OTP Step 2 */}
            {!(loginMethod === 'otp' && otpStep === 2) && (
              <div className="space-y-1">
                <label className="block text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="investor@domain.com"
                  required
                  className="w-full bg-transparent border-b border-white/5 py-1.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 font-medium"
                />
              </div>
            )}

            {/* Password Field */}
            {loginMethod === 'password' && (
              <div className="space-y-1">
                <label className="block text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-white/5 py-1.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 font-medium"
                />
              </div>
            )}

            {/* OTP Field */}
            {loginMethod === 'otp' && otpStep === 2 && (
              <div className="space-y-1">
                <label className="block text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Verification Code</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full bg-transparent border-b border-white/5 py-1.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 font-medium text-center tracking-[0.5em]"
                />
                <p className="text-[8px] text-zinc-600 mt-1 text-center uppercase tracking-widest">Sent to {formData.email}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`w-full text-center text-[7px] font-bold uppercase tracking-widest transition-colors ${
                      resendTimer > 0 ? 'text-zinc-700' : 'text-[#D4AF37]/70 hover:text-[#D4AF37]'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Access Code'}
                  </button>
                  <button type="button" onClick={() => setOtpStep(1)} className="w-full text-center text-[7px] text-zinc-700 hover:text-zinc-500 uppercase font-bold tracking-widest transition-colors">Change Email</button>
                </div>
              </div>
            )}

            {/* Remember & Forgot - Only for Password */}
            {loginMethod === 'password' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-3 h-3 border border-white/10 rounded-none bg-transparent flex items-center justify-center transition-all group-hover:border-[#D4AF37]">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {formData.rememberMe && <div className="w-1 h-1 bg-[#D4AF37]" />}
                  </div>
                  <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Remember</span>
                </label>
                <Link to="/forgot-password" university className="text-[8px] font-bold text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Forgot Password?</Link>
              </div>
            )}

            {error && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest text-center">{error}</p>}

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-3.5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#c4a132] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-[#D4AF37]/10"
            >
              {loading ? <Loader2 className="animate-spin" size={12} /> : (loginMethod === 'password' || otpStep === 2 ? 'Authorize Session' : 'Request Access Code')}
            </button>
          </form>

          {/* Google Auth - Moved to Bottom */}
          <div className="space-y-4 pt-1">
            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[6px] font-black uppercase tracking-[0.3em] text-zinc-800">
                <span className="bg-[#0a0a0a] px-3">Institutional SSO</span>
              </div>
            </div>

            <button 
              onClick={loginWithGoogle}
              className="w-full border border-white/5 py-3 font-bold uppercase tracking-[0.1em] text-[8px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/50 hover:text-white"
            >
              <Chrome size={10} className="text-[#D4AF37]" />
              Continue with Google
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] mt-4">
            New Entity? <Link to="/register" className="text-[#D4AF37] hover:underline underline-offset-4">Register Now</Link>
          </p>
        </motion.div>
      </main>

      {/* Footer - Extra Compact */}
      <footer className="px-6 md:px-12 h-10 md:h-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[7px] font-bold text-zinc-800 uppercase tracking-[0.3em] gap-2 md:gap-0">
        <div className="hidden sm:block">© 2024 EstateX.</div>
        <div className="flex gap-4 md:gap-6">
           {['Privacy', 'Terms', 'Disclosure'].map(link => (
             <button key={link} className="hover:text-white transition-colors">{link}</button>
           ))}
        </div>
      </footer>
    </div>
  );
};

export default Login;
