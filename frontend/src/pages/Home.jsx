import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Shield, Zap, BarChart3, Lock, Clock, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
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
            LAT: 51.5074 N <br/> LON: 0.1278 W
          </div>
          <div className="absolute top-10 right-10 text-[9px] font-black tracking-[0.3em] text-foreground/20 uppercase text-right hidden lg:block">
            TERMINAL: EST_X_01 <br/> NODE: ACTIVE
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
              Trade, Store, and <br/> Invest in Real Estate Assets 24/7
            </p>
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute top-[35%] right-[-8%] lg:right-[8%] w-56 space-y-4 hidden lg:block text-right flex flex-col items-end">
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
                    <stop offset="1" stopColor="#FF5F05" />
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
            <button className="bg-accent-orange hover:bg-accent-orange/90 text-white rounded-full pl-10 pr-2 py-2 text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-8 shadow-[0_20px_60px_-10px_rgba(255,95,5,0.4)] transition-all hover:scale-105 hover:-rotate-1 active:scale-95 group border border-white/10 h-16">
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
                   <div className="w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_10px_rgba(255,95,5,0.8)] animate-pulse"></div>
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
  );
};

export default Home;
