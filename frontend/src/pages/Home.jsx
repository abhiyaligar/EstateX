import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Shield, Zap, BarChart3, Lock, Clock, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Initializing Neural Link...",
    "Scanning Sector 7G...",
    "Verifying Liquidity Nodes...",
    "Encrypting Session Stream...",
    "Syncing Ledger State...",
    "Establishing Sovereign Connection..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + (100 / 100); // 5 seconds total for maximum 3D impact
      });
    }, 50);

    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ perspective: '3000px' }}
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 blueprint-grid-dashed opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176, 38, 255,0.05)_0%,transparent_70%)]" />

      {/* Scanning Laser Line */}
      <motion.div
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-orange/40 to-transparent z-10 blur-[1px]"
      />

      <motion.div
        initial={{ rotateX: 60, opacity: 0, z: -500 }}
        animate={{ rotateX: 0, opacity: 1, z: 0 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="relative flex flex-col items-center gap-20 max-w-lg w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Advanced 3D Logo Construct */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Multi-layered Glow */}
          <div className="absolute inset-0 bg-accent-orange/30 blur-[120px] rounded-full scale-150 opacity-30" />

          <motion.div
            animate={{
              rotateY: [0, 360],
              rotateX: [0, 10, 0],
              y: [-10, 10, -10]
            }}
            transition={{
              rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-10 h-40 w-40 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 3D Stacked Layers for Thickness */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 bg-accent-orange rounded-[2.5rem] border border-border flex items-center justify-center shadow-2xl"
                style={{
                  transform: `translateZ(${i * 4}px)`,
                  opacity: 1 - (i * 0.1),
                  filter: i > 0 ? 'brightness(0.7)' : 'none'
                }}
              >
                {i === 0 && <Zap size={80} className="text-foreground fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />}
              </div>
            ))}

            {/* Inner Core Light */}
            <div className="absolute inset-0 bg-foreground/20 rounded-[2.5rem] blur-xl animate-pulse translate-z-[15px]" />

            {/* Outer Energy Rings */}
            <motion.div
              animate={{ rotateZ: 360, rotateX: 70 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 border-[1.5px] border-accent-orange/30 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotateZ: -360, rotateY: 70 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-16 border border-border rounded-full"
            />
          </motion.div>
        </div>

        {/* Brand Reveal */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-heading font-black tracking-[-0.08em] text-foreground uppercase"
            style={{ transform: 'translateZ(50px)' }}
          >
            Estate<span className="text-accent-orange">X</span>
          </motion.h1>
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent-orange/50" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent-orange/80">{statuses[statusIndex]}</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent-orange/50" />
          </div>
        </div>

        {/* 3D Data Manifest */}
        <div className="w-full space-y-8" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg)' }}>
          <div className="h-2 w-full bg-foreground/[0.04] border border-border rounded-full relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-orange via-white to-accent-orange rounded-full shadow-[0_0_20px_rgba(176, 38, 255,1)]"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer Light */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[scan_2s_infinite]" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Latency', value: '0.4ms', color: 'text-emerald-500' },
              { label: 'Encryption', value: 'AES-256', color: 'text-foreground/60' },
              { label: 'Uptime', value: '99.99%', color: 'text-accent-orange' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1 p-4 bg-foreground/[0.02] border border-border rounded-2xl hover:bg-foreground/[0.05] transition-colors group">
                <span className="text-[7px] font-black uppercase tracking-widest text-foreground/20 group-hover:text-foreground/40 transition-colors">{stat.label}</span>
                <span className={`text-[10px] font-black font-mono ${stat.color}`}>{stat.stat_value || stat.value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="px-6 py-2 bg-accent-orange/5 border border-accent-orange/20 rounded-full flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-orange animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-orange">Sovereign Node Secured</span>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .translate-z-[15px] { transform: translateZ(15px); }
        .translate-z-[50px] { transform: translateZ(50px); }
      `}</style>
    </motion.div>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(() => {
    const hasLoaded = sessionStorage.getItem('estatex_landing_loaded');
    return !hasLoaded;
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -80]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('estatex_landing_loaded', 'true');
    setLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <div className="flex flex-col bg-background text-foreground min-h-screen font-sans selection:bg-accent-orange/10 selection:text-accent-orange overflow-x-hidden transition-colors duration-500">
        {/* Hero Section */}
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden blueprint-grid-dashed pt-32 pb-20">

          {/* Animated Background Details */}
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute top-[25%] w-full h-px border-t border-dashed border-foreground/10"></div>
            <div className="absolute top-[50%] w-full h-px border-t border-dashed border-foreground/10"></div>
            <div className="absolute top-[75%] w-full h-px border-t border-dashed border-foreground/10"></div>

            <div className="absolute left-[23%] h-full w-px border-l border-dashed border-foreground/10 hidden md:block"></div>
            <div className="absolute left-[39.5%] h-full w-px border-l border-dashed border-foreground/10"></div>
            <div className="absolute left-[61%] h-full w-px border-l border-dashed border-foreground/10"></div>
            <div className="absolute left-[77.5%] h-full w-px border-l border-dashed border-foreground/10 hidden md:block"></div>

            {/* Data Markers */}
            <div className="absolute top-10 left-10 text-[9px] font-black tracking-[0.3em] text-foreground/20 uppercase hidden lg:block">
              LAT: 51.5074 N <br /> LON: 0.1278 W
            </div>
            <div className="absolute top-10 right-10 text-[9px] font-black tracking-[0.3em] text-foreground/20 uppercase text-right hidden lg:block">
              TERMINAL: EST_X_01 <br /> NODE: ACTIVE
            </div>

            {/* Crosshairs */}
            {[25, 50, 75].map(top =>
              [23, 39.5, 61, 77.5].map(left => (
                <div key={`${top}-${left}`} className="absolute crosshair hidden md:flex" style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}></div>
              ))
            )}
          </div>

          <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center">

            {/* Floating Nodes with Parallax */}
            <motion.div style={{ y: y1 }} className="absolute top-[0%] left-[5%] lg:left-[20%] -translate-x-1/2 w-48 space-y-3 hidden lg:block">
              <div className="h-10 w-10 bg-accent-orange/5 border border-accent-orange/10 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-accent-orange fill-accent-orange" />
              </div>
              <p className="text-[11px] font-black text-foreground leading-tight tracking-tight uppercase">
                Trade, Store, and <br /> Invest in Real Estate Assets 24/7
              </p>
            </motion.div>

            <motion.div style={{ y: y2 }} className="absolute z-20 top-[25%] right-[-8%] lg:right-[8%] w-56 space-y-4 hidden lg:block text-right flex flex-col items-end">
              <div className="space-y-1">
                <p className="text-[12px] font-black text-foreground opacity-70">Regulated.</p>
                <p className="text-[12px] font-black text-foreground opacity-70">Built for Execution</p>
                <p className="text-[12px] font-black text-accent-orange underline decoration-2 underline-offset-4">With Institutional Liquidity</p>
              </div>
              <div className="h-8 w-8 bg-accent-orange/5 border border-accent-orange/10 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-accent-orange" />
              </div>
            </motion.div>

            {/* Central Bolt with Parallax & Glow */}
            <motion.div
              style={{ rotate }}
              className="relative mb-16 md:mb-24 orange-glow group flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-accent-orange/20 blur-[80px] md:blur-[120px] rounded-full scale-125 md:scale-150 opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 scale-[0.5] md:scale-[0.85] transition-all duration-700 group-hover:scale-[0.9]">
                <svg width="220" height="280" viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M120 0L40 160H100L80 280L220 80H140L120 0Z" fill="url(#bolt_grad)" />
                  <defs>
                    <linearGradient id="bolt_grad" x1="40" y1="0" x2="220" y2="280" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF8A00" />
                      <stop offset="1" stopColor="#B026FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="text-center space-y-4 md:space-y-10 mb-20 md:mb-28 relative">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-7xl md:text-[8rem] font-heading font-black text-foreground tracking-[-0.05em] leading-[0.85] uppercase transition-all duration-700"
              >
                Your Real <br className="hidden md:block" /> Estate Edge
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.5 }}
                className="max-w-xl mx-auto text-[14px] md:text-[22px] text-foreground font-heading font-medium tracking-tight leading-relaxed px-6"
              >
                Built for Execution. Trusted to Deliver.
              </motion.p>
            </div>

            {/* Action Button */}
            <Link to="/register">
              <button className="bg-accent-orange hover:bg-accent-orange/90 text-foreground rounded-full pl-10 pr-2 py-2 text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-8 shadow-[0_20px_60px_-10px_rgba(176, 38, 255,0.4)] transition-all hover:scale-105 hover:-rotate-1 active:scale-95 group border border-border h-16">
                <span>Request Access</span>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center transition-all group-hover:bg-white group-hover:scale-110 group-hover:rotate-12">
                  <ArrowRight size={22} className="text-accent-orange" />
                </div>
              </button>
            </Link>
          </div>

          {/* Bottom Logo Row - Scrolling Pills */}
          <div className="absolute bottom-6 md:bottom-10 w-full overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-nowrap justify-start items-center opacity-40 hover:opacity-100 transition-opacity pointer-events-none gap-4 animate-scroll">
                {[
                  'Apex Capital', 'Nova Equity', 'Nexus REIT', 'Vertex Funds',
                  'Prism Realty', 'Solaris Group', 'Quantum Assets', 'Echelon Partners',
                  'Apex Capital', 'Nova Equity', 'Nexus REIT', 'Vertex Funds'
                ].map((brand, i) => (
                  <div key={`${brand}-${i}`} className="flex-shrink-0 px-10 py-3.5 bg-foreground/5 border border-border rounded-full flex items-center gap-4 backdrop-blur-md transition-all hover:bg-foreground/10">
                    <div className="w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_10px_rgba(176, 38, 255,0.8)] animate-pulse"></div>
                    <span className="text-[11px] font-black tracking-[0.3em] text-foreground uppercase whitespace-nowrap">
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <style>{`
          .animate-scroll {
            animation: scroll 30s linear infinite;
            width: max-content;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .crosshair::before, .crosshair::after {
            background: var(--color-foreground);
            opacity: 0.2;
          }
        `}</style>
      </div>
    </>
  );
};

export default Home;
