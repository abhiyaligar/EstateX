import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, User, DraftingCompass, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

const DesignationCard = ({ id, icon: Icon, title, description, selected, onClick }) => (
  <motion.div
    onClick={() => onClick(id)}
    whileHover={{ y: -4 }}
    className={`group relative flex flex-col p-8 rounded-none border-t border-white/5 cursor-pointer transition-all duration-500 ${
      selected 
        ? 'bg-white/[0.03] border-white/20' 
        : 'hover:bg-white/[0.01] hover:border-white/10'
    }`}
  >
    <div className={`mb-8 transition-colors duration-500 ${selected ? 'text-[#D4AF37]' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    
    <h3 className={`text-xl font-bold mb-4 tracking-tight transition-colors duration-500 ${selected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
      {title}
    </h3>
    
    <p className="text-sm leading-relaxed text-zinc-500 font-medium">
      {description}
    </p>

    {selected && (
      <motion.div 
        layoutId="selected-indicator"
        className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]"
      />
    )}
  </motion.div>
);

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [designation, setDesignation] = useState(null);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const designations = [
    {
      id: 'institutional',
      icon: Landmark,
      title: 'Institutional Investor',
      description: 'For family offices, endowments, and registered funds managing capital allocations at scale.'
    },
    {
      id: 'accredited',
      icon: User,
      title: 'Accredited Individual',
      description: 'For high-net-worth individuals meeting regulatory thresholds for private market offerings.'
    },
    {
      id: 'builder',
      icon: DraftingCompass,
      title: 'Property Builder',
      description: 'For developers and sponsors seeking institutional capital for qualified real estate projects.'
    }
  ];

  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20 px-4 bg-[#0a0a0a]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button 
            onClick={() => setStep(1)}
            className="mb-8 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to designation
          </button>
          <RegisterForm designation={designation} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D4AF37]/30">
      {/* Custom Navbar for Auth Flow */}
      <nav className="h-20 px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-white flex items-center justify-center">
             <Building2 className="text-black" size={18} />
           </div>
           <span className="text-sm font-black tracking-[0.3em] uppercase">EstateX</span>
        </div>
        <div className="flex items-center gap-8">
           {['Properties', 'Investors', 'About'].map(link => (
             <button key={link} className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">
               {link}
             </button>
           ))}
           <button className="text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">
             Get Started
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-32 pb-20">
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-8"
          >
            Select Designation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium"
          >
            To configure your institutional ledger and ensure regulatory compliance, 
            please define your capacity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-white/5">
          {designations.map((item, index) => (
            <DesignationCard
              key={item.id}
              {...item}
              selected={designation === item.id}
              onClick={setDesignation}
            />
          ))}
        </div>

        <div className="mt-20 flex justify-end">
          <button
            onClick={() => designation && setStep(2)}
            disabled={!designation}
            className={`group flex items-center gap-4 px-10 py-5 transition-all duration-500 ${
              designation 
                ? 'bg-[#D4AF37] text-black' 
                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Continue</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-12 py-10 flex items-center justify-between border-t border-white/5 opacity-40">
        <div className="text-[10px] font-black tracking-[0.3em] uppercase">EstateX</div>
        <div className="flex gap-8">
           {['Terms of Service', 'Privacy Policy', 'Regulatory Disclosures', 'Contact'].map(link => (
             <button key={link} className="text-[9px] uppercase tracking-widest font-bold hover:text-white transition-colors">
               {link}
             </button>
           ))}
        </div>
        <div className="text-[9px] uppercase tracking-widest font-bold">
          © 2024 EstateX. Institutional Stability.
        </div>
      </footer>
    </div>
  );
};

export default Register;
