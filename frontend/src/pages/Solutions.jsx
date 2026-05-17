import React from 'react';
import { LayoutGrid, Cpu, Smartphone, ShieldCheck } from 'lucide-react';

const Solutions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto blueprint-grid-dashed min-h-[60vh] flex flex-col justify-center">
        <div className="space-y-8">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-orange">Enterprise Solutions</p>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] uppercase max-w-4xl">
            Asset <br /> Tokenization.
          </h1>
          <p className="max-w-2xl text-lg text-foreground/50 font-medium leading-relaxed">
            Scalable infrastructure for real estate developers, asset managers, and financial institutions to digitize global property portfolios.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border">
         {[
           { id: 'api', title: 'API Integration', icon: Cpu, desc: 'Connect your existing platforms directly to our liquidity nodes for programmatic trading and asset management.' },
           { id: 'yield', title: 'Yield Generation', icon: LayoutGrid, desc: 'Automated staking and yield farming protocols on fractional real estate assets to maximize returns.' },
           { id: 'custody', title: 'Secured Custody', icon: ShieldCheck, desc: 'Enterprise-grade multi-party computation (MPC) wallets with built-in KYC/AML protocols tailored for global jurisdictions.' }
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

export default Solutions;
