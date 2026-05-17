import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Zap, Shield, Globe } from 'lucide-react';

const Trading = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto blueprint-grid-dashed min-h-[60vh] flex flex-col justify-center">
        <div className="space-y-8">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-orange">Trading Infrastructure</p>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] uppercase max-w-4xl">
            High Performance <br /> Execution.
          </h1>
          <p className="max-w-2xl text-lg text-foreground/50 font-medium leading-relaxed">
            Access deep liquidity across global real estate markets with enterprise-grade execution protocols and MPC-secured custody.
          </p>
          <div className="pt-6">
            <Link to="/trade">
              <button className="bg-accent-orange hover:bg-accent-orange/90 text-white rounded-full px-8 py-3.5 text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_-10px_rgba(176, 38, 255,0.4)] transition-all hover:scale-105 active:scale-95 border border-border">
                Go to Trades
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border">
         {[
           { id: 'institutional', title: 'Institutional', icon: Shield, desc: 'Enterprise-grade execution with dark pools and high-volume OTC capabilities for institutional entities.' },
           { id: 'derivatives', title: 'Derivatives', icon: BarChart3, desc: 'Advanced perpetual swaps and futures on tokenized real estate indexes with advanced risk engines.' },
           { id: 'liquidity', title: 'Liquidity', icon: Zap, desc: 'Aggregated liquidity from global market makers ensuring zero-slippage execution on large block trades.' }
         ].map((item, i) => (
           <div key={i} id={item.id} className="space-y-6 group pt-20 -mt-20">
             <div className="h-12 w-12 bg-accent-orange/5 border border-accent-orange/10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-accent-orange/10">
               <item.icon size={24} className="text-accent-orange" />
             </div>
             <h3 className="text-2xl font-heading font-black tracking-tighter uppercase">{item.title}</h3>
             <p className="text-sm text-foreground/40 font-medium leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </section>
    </div>
  );
};

export default Trading;
