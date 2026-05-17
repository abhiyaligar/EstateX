import React from 'react';
import { Landmark, Users, Building2, Briefcase } from 'lucide-react';

const WhoWeServe = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto blueprint-grid-dashed min-h-[60vh] flex flex-col justify-center">
        <div className="space-y-8">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-orange">Our Clients</p>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] uppercase max-w-4xl">
            Institutional <br /> Ecosystem.
          </h1>
          <p className="max-w-2xl text-lg text-foreground/50 font-medium leading-relaxed">
            We provide specialized entry points for every tier of the institutional real estate and financial markets.
          </p>
        </div>
      </section>

      <div className="flex flex-col border-t border-border pb-32">
         {[
           {
             id: 'family-offices', title: 'Family Offices', icon: Landmark,
             desc: 'Gain direct, secured exposure to prime global real estate assets. We offer customized portfolio tracking, bespoke reporting, and exclusive access to off-market tokenized deals for wealth preservation and generation.',
             features: ['Bespoke Deal Flow', 'Wealth Preservation Vaults', 'Custom Portfolio Analytics', 'White-Glove Support']
           },
           {
             id: 'asset-managers', title: 'Asset Managers', icon: Briefcase,
             desc: 'Optimize client portfolios with liquid, fractional real estate holdings. Our platform automates compliance, KYC/AML checks, and dividend distributions, allowing you to focus on strategy and asset allocation.',
             features: ['Fractional Allocation', 'Automated Compliance', 'Real-time Dividend Routing', 'API-Driven Reporting']
           },
           {
             id: 'builders', title: 'Developers & Builders', icon: Building2,
             desc: 'Access secondary market liquidity for ongoing developments and seamlessly tokenize new projects. Raise capital globally by offering fractional ownership to our vast network of institutional investors.',
             features: ['Capital Formation', 'Secondary Market Liquidity', 'Project Tokenization', 'Investor Management Portal']
           }
         ].map((item, i) => (
           <section key={i} id={item.id} className={`py-24 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 lg:gap-24 pt-32 -mt-20 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
             
             {/* Content Side */}
             <div className="flex-1 space-y-8">
               <div className="h-16 w-16 bg-accent-orange/5 border border-accent-orange/20 rounded-2xl flex items-center justify-center">
                 <item.icon size={32} className="text-accent-orange" />
               </div>
               <h3 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">{item.title}</h3>
               <p className="text-lg md:text-xl text-foreground/50 font-medium leading-relaxed">
                 {item.desc}
               </p>
               <ul className="space-y-4 pt-4">
                 {item.features.map((feature, idx) => (
                   <li key={idx} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/70">
                     <div className="h-1.5 w-1.5 rounded-full bg-accent-orange"></div>
                     {feature}
                   </li>
                 ))}
               </ul>
             </div>

             {/* Visual Side */}
             <div className="flex-1 w-full h-[400px] md:h-[500px] bg-foreground/[0.02] border border-border rounded-[2.5rem] relative overflow-hidden group shadow-xl">
                <div className="absolute inset-0 blueprint-grid-dashed opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-orange/10 rounded-full blur-[100px]"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="p-10 border border-border bg-background/50 backdrop-blur-2xl rounded-3xl shadow-2xl flex items-center justify-center gap-6 transform transition-transform duration-700 group-hover:scale-105 group-hover:border-accent-orange/30">
                      <item.icon size={56} className="text-accent-orange" />
                      <div className="space-y-3">
                        <div className="h-2 w-32 bg-foreground/10 rounded-full"></div>
                        <div className="h-2 w-20 bg-accent-orange/50 rounded-full"></div>
                        <div className="h-2 w-24 bg-foreground/10 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>

           </section>
         ))}
      </div>
    </div>
  );
};

export default WhoWeServe;
