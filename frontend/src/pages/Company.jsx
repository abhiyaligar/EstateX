import React from 'react';
import { Mail, Info, FileText, MapPin } from 'lucide-react';

const Company = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto blueprint-grid-dashed min-h-[60vh] flex flex-col justify-center">
        <div className="space-y-8">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-orange">The Protocol</p>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] uppercase max-w-4xl">
            Modern <br /> Architecture.
          </h1>
          <p className="max-w-2xl text-lg text-foreground/50 font-medium leading-relaxed">
            EstateX is the foundational infrastructure for the digital real estate economy, built by a global team of developers and traders.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border">
         {[
           { title: 'About Us', icon: Info, desc: 'Our mission is to bring institutional liquidity to the global real estate market.' },
           { title: 'Documentation', icon: FileText, desc: 'Technical manifests and regulatory compliance papers.' },
           { title: 'Contact', icon: Mail, desc: 'Connect with our institutional desk for partnership inquiries.' }
         ].map((item, i) => (
           <div key={i} className="space-y-6 group">
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

export default Company;
