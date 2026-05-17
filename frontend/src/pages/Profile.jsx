import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, ShieldCheck, Clock, MapPin, Briefcase, Building2, 
  CreditCard, FileText, Smartphone, Globe, Landmark, TrendingUp,
  Zap, ArrowRight, Shield, Lock, Download, Activity, Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import userService from '../services/userService';
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
       <div className="h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 bg-accent-orange/10 rounded-full flex items-center justify-center animate-pulse border border-accent-orange/20">
              <Shield size={32} className="text-accent-orange" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 animate-pulse">Authenticating Identity Node...</p>
          </div>
       </div>
     );
  }

  const profileItems = [
    { label: 'Authenticated Email', value: profileData?.email || authUser?.email, icon: Mail },
    { label: 'Role Designation', value: profileData?.role?.toUpperCase() || 'INVESTOR', icon: Briefcase },
    { label: 'Protocol Capacity', value: (profileData?.user_metadata?.account_type || 'Individual')?.toUpperCase(), icon: Landmark },
    { label: 'Sovereign Node ID', value: profileData?.id?.substring(0, 16).toUpperCase(), icon: Key },
  ];

  const verificationStatus = [
    { label: 'KYC Verification', status: (profileData?.kyc_status || 'PENDING').toUpperCase().replace('_', ' '), icon: ShieldCheck, color: profileData?.kyc_status === 'approved' ? 'text-emerald-500' : 'text-accent-orange' },
    { label: 'AML Compliance', status: profileData?.user_metadata?.pan ? 'AUDITED' : 'PENDING', icon: FileText, color: profileData?.user_metadata?.pan ? 'text-foreground/40' : 'text-accent-orange' },
    { label: 'MPC Security', status: 'ACTIVE', icon: Lock, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 pb-32 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12 md:pt-20">
        
        {/* Profile Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 md:mb-28">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-accent-orange rounded-3xl flex items-center justify-center text-foreground text-5xl md:text-6xl font-heading font-black shadow-[0_20px_60px_-10px_rgba(176, 38, 255,0.4)] group-hover:scale-105 transition-transform duration-500">
                {authUser?.first_name?.[0] || authUser?.email?.[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-background border border-border rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                <ShieldCheck size={24} className="text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Activity size={14} className="text-accent-orange animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30">Protocol Identity Secured</p>
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-black tracking-[-0.05em] uppercase leading-none text-foreground">
                Sovereign <br /> <span className="text-accent-orange">Profile</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="bg-foreground/[0.02] border border-border p-8 md:px-12 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-accent-orange/20 transition-colors">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20 mb-3">Audit Certificate</p>
                <div className="flex items-center gap-3">
                   <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${profileData?.kyc_status === 'approved' ? 'bg-emerald-500' : 'bg-accent-orange'}`} />
                   <span className="text-sm font-heading font-black uppercase tracking-widest">{(profileData?.kyc_status || 'PENDING').toUpperCase().replace('_', ' ')}</span>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 border-t border-border pt-16 md:pt-20">
          {/* Left Column: Personal Data */}
          <div className="lg:col-span-2 space-y-20 md:space-y-28">
             <section className="space-y-12">
                <div className="flex items-center gap-3">
                   <User size={14} className="text-accent-orange" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">Institutional Credentials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                   {profileItems.map((item, i) => (
                     <div key={i} className="group border-b border-border pb-8 hover:border-accent-orange/30 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-4 flex items-center gap-3">
                           <item.icon size={14} className="text-accent-orange/40" /> {item.label}
                        </p>
                        <p className="text-xl font-heading font-black tracking-tight text-foreground group-hover:text-accent-orange transition-colors truncate uppercase">{item.value}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="space-y-12">
                <div className="flex items-center gap-3">
                   <TrendingUp size={14} className="text-accent-orange" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">Allocation Parameters</h3>
                </div>
                <div className="bg-foreground/[0.03] border border-border p-10 md:p-16 rounded-[40px] space-y-12 blueprint-grid-dashed-small relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                     <TrendingUp size={160} className="text-accent-orange" />
                   </div>
                   <div className="flex justify-between items-center border-b border-border pb-10 relative z-10">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Primary Mandate</p>
                         <p className="text-3xl font-heading font-black tracking-tighter uppercase">Institutional Growth</p>
                      </div>
                      <div className="h-16 w-16 bg-accent-orange/10 rounded-2xl flex items-center justify-center text-accent-orange">
                        <Zap size={32} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-12 relative z-10">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Risk profile</p>
                         <p className="text-lg font-heading font-black text-foreground uppercase tracking-tight">{profileData?.investment_preference || 'CONSERVATIVE'}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Global Jurisdiction</p>
                         <p className="text-lg font-heading font-black text-foreground uppercase tracking-tight">MULTI-NODE AUTH</p>
                      </div>
                   </div>
                </div>
             </section>
          </div>

          {/* Right Column: Verification Audit */}
          <div className="space-y-20 lg:border-l lg:border-border lg:pl-16 xl:pl-24">
             <section className="space-y-12">
                <div className="flex items-center gap-3">
                   <ShieldCheck size={14} className="text-accent-orange" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">Compliance Protocol</h3>
                </div>
                <div className="space-y-6">
                   {verificationStatus.map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-6 bg-foreground/[0.03] border border-border rounded-2xl group hover:border-accent-orange/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-background border border-border rounded-xl flex items-center justify-center text-foreground/20 group-hover:text-accent-orange transition-colors">
                              <item.icon size={18} />
                           </div>
                           <span className="text-[11px] font-black uppercase tracking-widest text-foreground/40">{item.label}</span>
                        </div>
                        <span className={`text-[11px] font-black tracking-[0.2em] uppercase ${item.color}`}>{item.status}</span>
                     </div>
                   ))}
                </div>
             </section>

             <section className="space-y-8">
                <div className="p-10 bg-accent-orange/[0.03] border border-accent-orange/10 rounded-3xl space-y-6 relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                     <Lock size={120} />
                   </div>
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="h-8 w-8 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                        <Lock size={16} className="text-accent-orange" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-accent-orange">Security Manifest</p>
                   </div>
                   <p className="text-[13px] text-foreground/40 leading-relaxed font-medium relative z-10">Your sovereign identity node is secured via enterprise-grade MPC and audited daily by global compliance nodes.</p>
                </div>
                
                <button className="w-full bg-foreground text-background py-6 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:bg-accent-orange hover:text-foreground hover:-rotate-1 hover:scale-105 active:scale-[0.98] group flex items-center justify-center gap-4">
                   Export Identity Audit
                   <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                     <Download size={18} />
                   </div>
                </button>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
