import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, User, DraftingCompass, ArrowRight, Building2, X, ShieldCheck, Lock, Globe, Mail, Briefcase, TrendingUp, CreditCard, CheckCircle2, ChevronRight, FileText, KeyRound, Eye, EyeOff, Menu, ArrowLeft, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DesignationCard = ({ id, icon: Icon, title, description, selected, onClick }) => (
  <motion.div
    onClick={() => onClick(id)}
    whileHover={{ y: -4 }}
    className={`group relative flex flex-col p-6 md:p-8 rounded-none border-t border-white/5 cursor-pointer transition-all duration-500 ${
      selected 
        ? 'bg-white/[0.03] border-white/20' 
        : 'hover:bg-white/[0.01] hover:border-white/10'
    }`}
  >
    <div className={`mb-6 md:mb-8 transition-colors duration-500 ${selected ? 'text-[#D4AF37]' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
      <Icon size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
    </div>
    <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-tight transition-colors duration-500 ${selected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
      {title}
    </h3>
    <p className="text-xs md:text-sm leading-relaxed text-zinc-500 font-medium">{description}</p>
    {selected && <motion.div layoutId="selected-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
  </motion.div>
);

const FormInput = ({ label, placeholder, name, value, onChange, type = "text", icon: Icon, subtext, maxLength, showPasswordToggle, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-6 md:mb-8">
      <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-3">
        {label} {required && <span className="text-[#D4AF37] ml-1">*</span>}
      </label>
      <div className="relative group">
        {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" size={14} />}
        <input 
          name={name}
          value={value}
          onChange={onChange}
          type={inputType}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          autoComplete="off"
          className={`w-full bg-transparent border-b border-white/10 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-800 font-medium ${Icon ? 'pl-7 md:pl-8' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
        />
        {showPasswordToggle && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {subtext && <p className="mt-2 text-[9px] text-zinc-600 italic">{subtext}</p>}
    </div>
  );
};

const FormSelect = ({ label, name, value, onChange, options, icon: Icon, required = true }) => (
  <div className="mb-6 md:mb-8">
    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-3">
      {label} {required && <span className="text-[#D4AF37] ml-1">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" size={14} />}
      <select 
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-[#0a0a0a] border-b border-white/10 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-[#D4AF37] transition-all appearance-none cursor-pointer ${Icon ? 'pl-7 md:pl-8' : ''}`}
      >
        <option value="" disabled>Select Option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><ArrowRight size={14} className="rotate-90" /></div>
    </div>
  </div>
);

const ProgressHeader = ({ current, total, title }) => (
  <div className="mb-12 md:mb-20">
    <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-3 md:mb-4">
      <span className="text-[#D4AF37]">Step {current} of {total}</span>
      <span className="text-zinc-700 hidden sm:inline">{title}</span>
    </div>
    <div className="h-0.5 w-full bg-white/5">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(current / total) * 100}%` }} className="h-full bg-[#D4AF37]" />
    </div>
  </div>
);

const Register = () => {
  const { register, login, verifyRegistrationOtp, resendOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [subStep, setSubStep] = useState(1);
  const [designation, setDesignation] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const designations = [
    { id: 'institutional', icon: Landmark, title: 'Institutional Investor', description: 'For family offices, endowments, and registered funds.' },
    { id: 'investor', icon: User, title: 'Individual Investor', description: 'For individuals seeking direct access to institutional real estate.' },
    { id: 'builder', icon: DraftingCompass, title: 'Property Builder', description: 'For developers seeking institutional capital for projects.' }
  ];
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    entityName: '',
    registrationType: '',
    licenseNumber: '',
    aadhaar: '',
    pan: '',
    aumTier: '',
    jurisdiction: '',
    investmentPreference: '',
    contactNumber: '',
    otp: ''
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  useEffect(() => {
    let interval;
    if (subStep === 4 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [subStep, resendTimer]);

  useEffect(() => {
    if (subStep === 4) {
      setResendTimer(60);
    }
  }, [subStep]);
  
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      const result = await resendOtp(formData.email, 'signup');
      if (result.success) {
        setResendTimer(60);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const validateStep = () => {
    if (subStep === 1) {
      return formData.email && formData.password && formData.password.length >= 8 && formData.password === formData.confirmPassword;
    }
    if (subStep === 2) {
      if (designation === 'builder') return formData.entityName && formData.registrationType && formData.licenseNumber;
      if (designation === 'institutional') return formData.entityName && formData.aumTier && formData.jurisdiction;
      if (designation === 'investor') return formData.firstName && formData.lastName && formData.contactNumber && formData.investmentPreference;
    }
    if (subStep === 3) return formData.aadhaar.length === 12 && formData.pan.length === 10;
    if (subStep === 4) return formData.otp.length === 6;
    return true;
  };

  const handleRegisterUser = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: designation === 'builder' ? 'builder' : 'investor',
        user_metadata: {
          first_name: formData.firstName || formData.entityName,
          last_name: formData.lastName || '',
          phone: formData.contactNumber,
          account_type: designation,
          entity_name: formData.entityName,
          registration_type: formData.registrationType,
          license_number: formData.licenseNumber,
          aum_tier: formData.aumTier,
          jurisdiction: formData.jurisdiction,
          investment_preference: formData.investmentPreference,
          aadhaar: formData.aadhaar,
          pan: formData.pan,
          kyc_status: 'pending_verification'
        }
      };
      
      const result = await register(payload);
      if (result.success) {
        setSubStep(4); 
      } else {
        setError(formatErrorMessage(result.error));
      }
    } catch (err) {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) {
      return err.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
    }
    return 'An unexpected error occurred.';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    setLoading(true);
    try {
      // 1. Verify Local Signup OTP
      const verifyResult = await verifyRegistrationOtp(formData.email, formData.otp);
      if (verifyResult.success) {
        // 2. Auto-login since Supabase account is already created (and confirmed via our local flow)
        const loginResult = await login(formData.email, formData.password);
        if (loginResult.success) {
          setSubStep(5);
        } else {
          setError(loginResult.error);
        }
      } else {
        setError(formatErrorMessage(verifyResult.error));
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    const isBuilder = designation === 'builder';
    const isInstitutional = designation === 'institutional';
    const isInvestor = designation === 'investor';

    // Step 1: Account Info
    if (subStep === 1) {
      return (
        <motion.div key="substep1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Account Creation</h2>
          <p className="text-xs md:text-sm text-zinc-600 mb-10 md:mb-12 font-medium">Set up your secure institutional credentials.</p>
          <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@company.com" icon={Mail} />
          <FormInput label="Create Password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Min 8 characters" icon={KeyRound} showPasswordToggle />
          <FormInput label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat password" icon={KeyRound} showPasswordToggle />
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 flex justify-between items-center">
             <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
             <button onClick={() => setSubStep(2)} disabled={!validateStep()} className={`px-8 md:px-10 py-4 md:py-5 flex items-center gap-4 group transition-all ${validateStep() ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'}`}>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">Next Step</span>
                <ArrowRight size={14} />
             </button>
          </div>
        </motion.div>
      );
    }

    // Step 2: Profile Details
    if (subStep === 2) {
      return (
        <motion.div key="substep2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{designation.charAt(0).toUpperCase() + designation.slice(1)} Details</h2>
          <p className="text-xs md:text-sm text-zinc-600 mb-10 md:mb-12 font-medium">Define your professional capacity on the ledger.</p>
          
          {isBuilder && (
            <>
              <FormInput label="Entity Name" name="entityName" value={formData.entityName} onChange={handleInputChange} placeholder="Registered Corporate Name" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FormSelect label="Type" name="registrationType" value={formData.registrationType} onChange={handleInputChange} options={['Private Limited', 'Public Limited', 'LLP']} />
                <FormInput label="RERA / License" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="Regulatory ID" />
              </div>
            </>
          )}

          {isInstitutional && (
            <>
              <FormInput label="Legal Entity Name" name="entityName" value={formData.entityName} onChange={handleInputChange} placeholder="e.g. Apex Holdings LLC" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FormSelect label="AUM Tier" name="aumTier" value={formData.aumTier} onChange={handleInputChange} options={['$50M+', '$100M+', '$500M+']} icon={Briefcase} />
                <FormSelect label="Jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} options={['USA', 'UK', 'Singapore', 'UAE']} icon={Globe} />
              </div>
            </>
          )}

          {isInvestor && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Legal First Name" />
                <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Legal Last Name" />
              </div>
              <FormInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
              <FormSelect label="Preference" name="investmentPreference" value={formData.investmentPreference} onChange={handleInputChange} options={['Residential', 'Commercial', 'Land']} />
            </>
          )}

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 flex justify-between items-center">
             <button onClick={() => setSubStep(1)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
             <button onClick={() => setSubStep(3)} disabled={!validateStep()} className={`px-8 md:px-10 py-4 md:py-5 flex items-center gap-4 group transition-all ${validateStep() ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'}`}>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">Next: Identity</span>
                <ArrowRight size={14} />
             </button>
          </div>
        </motion.div>
      );
    }

    // Step 3: Identity Verification (Aadhaar & PAN)
    if (subStep === 3) {
      return (
        <motion.div key="substep3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Identity Details</h2>
          <p className="text-xs md:text-sm text-zinc-600 mb-10 md:mb-12 font-medium">Global compliance standards require verified identity documents.</p>
          <FormInput label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} placeholder="12-digit Unique ID" icon={CreditCard} maxLength={12} />
          <FormInput label="PAN Number" name="pan" value={formData.pan} onChange={handleInputChange} placeholder="10-character Tax ID" icon={FileText} maxLength={10} />
          
          {error && <p className="text-red-500 text-[10px] mt-6 font-bold uppercase tracking-widest text-center animate-pulse">{error}</p>}

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 flex justify-between items-center">
             <button onClick={() => setSubStep(2)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
             <button 
                onClick={handleRegisterUser} 
                disabled={loading || !validateStep()}
                className={`px-8 md:px-10 py-4 md:py-5 flex items-center gap-4 group transition-all ${validateStep() ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'}`}
             >
                {loading ? <Loader2 className="animate-spin" size={14} /> : (
                  <>
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">Next: Auth</span>
                    <ArrowRight size={14} />
                  </>
                )}
             </button>
          </div>
        </motion.div>
      );
    }

    // Step 4: Device Verification (OTP)
    if (subStep === 4) {
      return (
        <motion.div key="substep4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Mobile Authorization</h2>
          <p className="text-xs md:text-sm text-zinc-600 mb-10 md:mb-12 font-medium">Final security checkpoint. Enter the 6-digit code sent to your device.</p>
          <FormInput label="Enter OTP" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="000000" icon={Smartphone} maxLength={6} subtext="Enter '123456' to bypass for testing." />
          
          {error && <p className="text-red-500 text-[10px] mb-6 font-bold uppercase tracking-widest leading-relaxed">{error}</p>}
          
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
              className={`text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2 transition-all duration-300 ${
                resendTimer > 0 
                ? 'text-zinc-700 bg-white/5 cursor-not-allowed' 
                : 'text-[#D4AF37] hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
              }`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Verification Code'}
            </button>
          </div>
          
          <div className="mt-12 md:mt-20 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
            <button onClick={() => setSubStep(3)} className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
            <button 
              onClick={handleSubmit} 
              disabled={loading || !validateStep()} 
              className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 flex items-center justify-center gap-4 group transition-all ${loading || !validateStep() ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50' : 'bg-[#D4AF37] text-black'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">Complete Audit</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      );
    }

    // Step 5: Success
    return (
      <motion.div key="substep5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 md:py-20">
         <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#D4AF37]/20">
            <CheckCircle2 size={40} className="text-[#D4AF37]" />
         </div>
         <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter leading-none">Verification Submitted.</h2>
         <p className="text-zinc-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed">Our compliance officers are reviewing your submission on the private ledger. Manual verification typically concludes within 24 hours.</p>
         <Link to="/dashboard">
            <button className="bg-white text-black px-12 py-6 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-zinc-200 transition-colors shadow-2xl shadow-white/10">Enter Terminal</button>
         </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D4AF37]/30 font-sans">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[60] bg-black p-8 flex flex-col items-center justify-center gap-8 md:hidden">
             <button onClick={() => setIsMenuOpen(false)} className="absolute right-8 top-8 text-zinc-500"><X size={32} /></button>
             {['Properties', 'Investors', 'About'].map(link => (
               <button key={link} className="text-2xl font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">{link}</button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="h-16 md:h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 group">
           <div className="w-7 h-7 md:w-8 md:h-8 bg-white flex items-center justify-center transition-transform group-hover:scale-110">
             <Building2 className="text-black" size={16} />
           </div>
           <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase">EstateX</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
           {['Properties', 'Investors', 'About'].map(link => (
             <button key={link} className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">{link}</button>
           ))}
           <button className="text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">Get Started</button>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2"><Menu size={24} className="text-zinc-500" /></button>
      </nav>

      {step === 1 ? (
        <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-32 pb-16 md:pb-20">
          <div className="text-center mb-16 md:mb-24">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold tracking-tight mb-6 md:mb-8">Select Designation</motion.h1>
            <p className="text-zinc-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">To configure your institutional ledger and ensure regulatory compliance, please define your capacity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-white/5">
            {designations.map((item) => (
              <DesignationCard key={item.id} {...item} selected={designation === item.id} onClick={setDesignation} />
            ))}
          </div>
          <div className="mt-12 md:mt-20 flex justify-center md:justify-end">
            <button
              onClick={() => designation && setStep(2)}
              disabled={!designation}
              className={`w-full md:w-auto group flex items-center justify-center gap-4 px-10 py-5 transition-all duration-500 ${designation ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'}`}
            >
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Continue</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </main>
      ) : (
        <div className="flex min-h-[calc(100vh-5rem)]">
          <div className="hidden lg:flex w-1/2 bg-[#0c0c0c] flex-col p-20 justify-between relative overflow-hidden border-r border-white/5">
            <div className="absolute inset-0 opacity-10 grayscale">
               <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" alt="Architecture" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-8">Capacity: {designation?.toUpperCase()}</p>
              <h1 className="text-6xl font-bold tracking-tighter leading-tight mb-8">Institutional<br />Grade Entry.</h1>
              <p className="text-zinc-500 max-w-sm leading-relaxed font-medium">Your onboarding journey is secured with enterprise-grade encryption and audited by top-tier compliance partners.</p>
            </div>
            <div className="relative z-10 flex gap-8">
               <div className="flex items-center gap-3 opacity-30 group hover:opacity-100 transition-opacity"><ShieldCheck size={18}/><span className="text-[9px] font-bold uppercase tracking-widest">SOC 2 AUDITED</span></div>
               <div className="flex items-center gap-3 opacity-30 group hover:opacity-100 transition-opacity"><Lock size={18}/><span className="text-[9px] font-bold uppercase tracking-widest">AES-256 SECURED</span></div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-20 bg-[#0a0a0a]">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              <ProgressHeader current={subStep} total={5} title="Audit Progression" />
              <AnimatePresence mode="wait">
                {renderFormContent()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      <footer className="px-6 md:px-12 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between border-t border-white/5 opacity-40 gap-6 md:gap-0 text-center md:text-left">
        <div className="text-[10px] font-black tracking-[0.3em] uppercase">EstateX</div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
           {['Terms', 'Privacy', 'Legal', 'Contact'].map(link => <button key={link} className="text-[9px] uppercase tracking-widest font-bold hover:text-white transition-colors">{link}</button>)}
        </div>
        <div className="text-[9px] uppercase tracking-widest font-bold">© 2024 EstateX. Institutional Stability.</div>
      </footer>
    </div>
  );
};

export default Register;
