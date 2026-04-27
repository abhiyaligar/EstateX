import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, KeyRound, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error);
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
          className="w-full max-w-[360px] md:max-w-[400px] space-y-8 md:space-y-10 relative z-10"
        >
          {/* Titles - Compacted */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none">Welcome Back</h1>
            <p className="text-zinc-500 text-[10px] md:text-[11px] font-medium tracking-wide">Secure access to your institutional portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="investor@domain.com"
                required
                className="w-full bg-transparent border-b border-white/5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 font-medium"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border-b border-white/5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-900 font-medium"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative w-3.5 h-3.5 border border-white/10 rounded-none bg-transparent flex items-center justify-center transition-all group-hover:border-[#D4AF37]">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.rememberMe && <div className="w-1.5 h-1.5 bg-[#D4AF37]" />}
                </div>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Remember me</span>
              </label>
              <button type="button" className="text-[9px] font-bold text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Forgot Password?</button>
            </div>

            {error && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest text-center">{error}</p>}

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#c4a132] transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-800">
              <span className="bg-[#0a0a0a] px-3">Or</span>
            </div>
          </div>

          {/* Google Auth */}
          <button 
            onClick={loginWithGoogle}
            className="w-full border border-white/5 py-4 font-bold uppercase tracking-[0.1em] text-[9px] flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-white/40 hover:text-white"
          >
            <Chrome size={12} className="text-[#D4AF37]" />
            Continue with Google
          </button>

          {/* Footer Link */}
          <p className="text-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            No account? <Link to="/register" className="text-[#D4AF37] hover:underline underline-offset-4">Sign Up</Link>
          </p>
        </motion.div>
      </main>

      {/* Footer - Extra Compact */}
      <footer className="px-6 md:px-12 h-14 md:h-16 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[8px] font-bold text-zinc-700 uppercase tracking-widest gap-2 md:gap-0">
        <div className="hidden sm:block">© 2024 EstateX Institutional Wealth Management.</div>
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
