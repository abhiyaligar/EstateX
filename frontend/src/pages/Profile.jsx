import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Clock, MapPin, Briefcase, Building2, CreditCard, FileText, Smartphone, Globe, Landmark, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { userService } from '../services/userService';
import { Loader } from '../components/ui/Loader';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile node", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
     return (
       <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader size={48} text="Synchronizing Identity Node..." />
       </div>
     );
  }

  const profileItems = [
    { label: 'Sovereign Email', value: profileData?.email || authUser?.email, icon: Mail },
    { label: 'Role Designation', value: profileData?.role?.toUpperCase() || 'INVESTOR', icon: Briefcase },
    { label: 'Account Type', value: (profileData?.user_metadata?.account_type || 'Individual')?.toUpperCase(), icon: Landmark },
    { label: 'Sovereign Node ID', value: profileData?.id?.substring(0, 12).toUpperCase(), icon: Globe },
  ];

  const verificationStatus = [
    { label: 'Identity Verification', status: profileData?.kyc_status?.toUpperCase().replace('_', ' ') || 'PENDING', icon: ShieldCheck, color: profileData?.kyc_status === 'approved' ? 'text-green-500' : 'text-[#D4AF37]' },
    { label: 'Tax Residency (PAN)', status: profileData?.user_metadata?.pan ? 'AUDITED' : 'PENDING', icon: FileText, color: profileData?.user_metadata?.pan ? 'text-zinc-500' : 'text-[#D4AF37]' },
    { label: 'Device Authorization', status: 'SECURED', icon: Smartphone, color: 'text-zinc-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D4AF37]/30 pb-20 pt-10 md:pt-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 md:mb-24">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Identity Terminal</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none">
              Sovereign <span className="text-white/20">Profile</span>
            </h1>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/[0.02] border border-white/5 p-6 md:px-10 flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Audit Status</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${profileData?.kyc_status === 'approved' ? 'bg-green-500' : 'bg-[#D4AF37]'}`} />
                   <span className="text-xs font-bold uppercase tracking-widest">{profileData?.kyc_status?.toUpperCase().replace('_', ' ') || 'PENDING'}</span>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 border-t border-white/5 pt-12">
          {/* Left Column: Personal Data */}
          <div className="lg:col-span-2 space-y-16">
             <section className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Core Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                   {profileItems.map((item, i) => (
                     <div key={i} className="group border-b border-white/5 pb-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-3 flex items-center gap-2">
                           <item.icon size={12} className="text-[#D4AF37]/50" /> {item.label}
                        </p>
                        <p className="text-lg font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">{item.value}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Investment Parameters</h3>
                <div className="bg-white/[0.01] border border-white/5 p-8 md:p-12 space-y-8">
                   <div className="flex justify-between items-center border-b border-white/5 pb-8">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Portfolio Strategy</p>
                         <p className="text-xl font-bold tracking-tight">Institutional Growth</p>
                      </div>
                      <TrendingUp size={24} className="text-[#D4AF37]" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Risk Profile</p>
                         <p className="text-sm font-bold text-white uppercase">{profileData?.investment_preference || 'CONSERVATIVE'}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Jurisdiction</p>
                         <p className="text-sm font-bold text-white uppercase">GLOBAL (MULTI-NODE)</p>
                      </div>
                   </div>
                </div>
             </section>
          </div>

          {/* Right Column: Verification Audit */}
          <div className="space-y-16">
             <section className="space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Compliance Audit</h3>
                <div className="space-y-8">
                   {verificationStatus.map((item, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white/[0.03] border border-white/10 text-zinc-600 group-hover:text-white transition-colors">
                              <item.icon size={16} />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-black tracking-[0.2em] ${item.color}`}>{item.status}</span>
                     </div>
                   ))}
                </div>
             </section>

             <section className="space-y-8 pt-8 border-t border-white/5">
                <div className="p-8 bg-[#D4AF37]/5 border border-[#D4AF37]/10 space-y-4">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={14} className="text-[#D4AF37]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Encryption Protocol</p>
                   </div>
                   <p className="text-[11px] text-zinc-500 leading-relaxed">Identity data is secured with AES-256 bank-grade encryption and stored on a private compliance node.</p>
                </div>
                <Button variant="outline" className="w-full border-white/5 hover:bg-white/5 py-6 text-[10px] font-black uppercase tracking-[0.3em]">
                   Download Audit Certificate
                </Button>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
