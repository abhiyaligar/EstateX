import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, KeyRound, Loader2, Chrome, Zap, ArrowRight, Sun, Moon, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { login, loginWithGoogle, sendAuthOtp, verifyAuthOtp, resendOtp, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('password'); 

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500 flex flex-col">
      {/* Header */}
      <nav className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-border bg-background sticky top-0 z-50 transition-colors">
        <Link to="/" className="flex items-center gap-3 group">
           <div className="w-10 h-10 bg-accent-orange flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(255,95,5,0.4)] transition-transform group-hover:scale-110">
             <Zap className="text-white fill-white" size={20} />
           </div>
           <span className="text-xl font-heading font-black tracking-tighter uppercase">EstateX</span>
        </Link>
        <div className="flex items-center gap-6">
           <button 
             onClick={toggleTheme}
             className="p-3 text-zinc-400 hover:text-foreground transition-colors"
           >
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <Link to="/register">
             <button className="text-[11px] uppercase tracking-[0.3em] font-black text-foreground border border-border px-8 py-3 rounded-full hover:bg-foreground/5 transition-all">Sign Up</button>
           </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 blueprint-grid">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-heading font-black tracking-tighter uppercase">Access Terminal</h1>
            <p className="text-foreground/50 font-medium text-sm tracking-tight">Institutional protocol access required for asset mapping.</p>
          </div>

          <div className="bg-background border border-border p-10 relative group">
            <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-accent-orange"></div>
            <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-accent-orange"></div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Credential Hub</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      className="w-full bg-transparent border-b border-border py-4 pl-10 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/10 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Access Key</label>
                    <Link 
                      to="/forgot-password" 
                      className="text-[9px] font-black uppercase tracking-[0.1em] text-accent-orange hover:text-accent-orange/80 transition-colors border border-accent-orange/20 px-3 py-1 rounded-full"
                    >
                      Recovery
                    </Link>
                  </div>
                  <div className="relative group/input">
                    <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent border-b border-border py-4 pl-10 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/10 font-medium"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background py-5 font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-foreground/90 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Continue Entry
                    <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                      <ArrowRight size={18} />
                    </div>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-background px-4 text-foreground/20">External Audit</span></div>
              </div>

              <button 
                onClick={() => loginWithGoogle()}
                className="w-full border border-border py-5 font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-foreground/5 transition-all flex items-center justify-center gap-4 group"
              >
                <Chrome size={18} className="group-hover:scale-110 transition-transform" />
                Auth via Google Node
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-10">
            <div className="flex items-center gap-2 opacity-30 group hover:opacity-100 transition-opacity">
              <ShieldCheck size={16} className="text-accent-orange"/>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 opacity-30 group hover:opacity-100 transition-opacity">
              <Lock size={16} className="text-accent-orange"/>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">MPC Custody</span>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="px-12 py-10 border-t border-border text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em] flex justify-between items-center">
        <span>© 2024 EstateX Protocol.</span>
        <div className="flex gap-8">
           <button className="hover:text-foreground transition-colors">Terms</button>
           <button className="hover:text-foreground transition-colors">Privacy</button>
        </div>
      </footer>
    </div>
  );
};

export default Login;
