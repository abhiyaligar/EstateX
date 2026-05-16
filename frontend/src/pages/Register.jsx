import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, User, DraftingCompass, ArrowRight, Building2, X, ShieldCheck, Lock, Globe, Mail, Briefcase, TrendingUp, CreditCard, CheckCircle2, ChevronRight, FileText, KeyRound, Eye, EyeOff, Menu, ArrowLeft, Loader2, Smartphone, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DesignationCard = ({ id, icon: Icon, title, description, selected, onClick }) => (
  <motion.div
    onClick={() => onClick(id)}
    whileHover={{ y: -4 }}
    className={`group relative flex flex-col p-10 border border-border cursor-pointer transition-all duration-500 ${
      selected 
        ? 'bg-foreground/5 border-accent-orange/30' 
        : 'hover:bg-foreground/[0.02] hover:border-foreground/10'
    }`}
  >
    <div className={`mb-10 transition-colors duration-500 ${selected ? 'text-accent-orange' : 'text-foreground/20 group-hover:text-foreground/40'}`}>
      <Icon size={40} strokeWidth={1.5} />
    </div>
    <h3 className={`text-2xl font-heading font-black mb-4 tracking-tighter transition-colors duration-500 ${selected ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground'}`}>
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-foreground/50 font-medium">{description}</p>
    {selected && <motion.div layoutId="selected-indicator" className="absolute bottom-0 left-0 w-full h-1 bg-accent-orange shadow-[0_0_20px_rgba(255,95,5,0.4)]" />}
  </motion.div>
);

const FormInput = ({ label, placeholder, name, value, onChange, type = "text", icon: Icon, subtext, maxLength, showPasswordToggle, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-10">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">
        {label} {required && <span className="text-accent-orange ml-1">*</span>}
      </label>
      <div className="relative group/input">
        {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />}
        <input 
          name={name}
          value={value}
          onChange={onChange}
          type={inputType}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          autoComplete="off"
          className={`w-full bg-transparent border-b border-border py-4 text-base focus:outline-none focus:border-accent-orange transition-all placeholder:text-foreground/10 font-medium ${Icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-12' : ''}`}
        />
        {showPasswordToggle && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {subtext && <p className="mt-3 text-[10px] text-foreground/40 font-medium">{subtext}</p>}
    </div>
  );
};

const FormSelect = ({ label, name, value, onChange, options, icon: Icon, required = true }) => (
  <div className="mb-10">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">
      {label} {required && <span className="text-accent-orange ml-1">*</span>}
    </label>
    <div className="relative group/input">
      {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within/input:text-accent-orange transition-colors" size={16} />}
      <select 
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-transparent border-b border-border py-4 text-base focus:outline-none focus:border-accent-orange transition-all appearance-none cursor-pointer ${Icon ? 'pl-10' : ''}`}
      >
        <option value="" disabled className="bg-background">Select Option</option>
        {options.map(opt => <option key={opt} value={opt} className="bg-background">{opt}</option>)}
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><ArrowRight size={16} className="rotate-90" /></div>
    </div>
  </div>
);

const ProgressHeader = ({ current, total, title }) => (
  <div className="mb-20">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] mb-4">
      <span className="text-accent-orange">Audit Step {current} / {total}</span>
      <span className="text-foreground/30 hidden sm:inline">{title}</span>
    </div>
    <div className="h-1 w-full bg-foreground/5">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(current / total) * 100}%` }} className="h-full bg-accent-orange shadow-[0_0_10px_rgba(255,95,5,0.4)]" />
    </div>
  </div>
);

const Register = () => {
  const { register, login, verifyRegistrationOtp, resendOtp, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [subStep, setSubStep] = useState(1);
  const [designation, setDesignation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const designations = [
    { id: 'institutional', icon: Landmark, title: 'Institutional', description: 'For family offices, endowments, and registered funds.' },
    { id: 'investor', icon: User, title: 'Individual', description: 'For private investors seeking direct real estate access.' },
    { id: 'builder', icon: DraftingCompass, title: 'Property Builder', description: 'For developers seeking institutional capital tranches.' }
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
    if (subStep === 4) setResendTimer(60);
  }, [subStep]);
  
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

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
      if (result.success) setSubStep(4);
      else setError(formatErrorMessage(result.error));
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) return err.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
    return 'An unexpected error occurred.';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const verifyResult = await verifyRegistrationOtp(formData.email, formData.otp);
      if (verifyResult.success) {
        const loginResult = await login(formData.email, formData.password);
        if (loginResult.success) setSubStep(5);
        else setError(loginResult.error);
      } else setError(formatErrorMessage(verifyResult.error));
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    const isBuilder = designation === 'builder';
    const isInstitutional = designation === 'institutional';
    const isInvestor = designation === 'investor';

    if (subStep === 1) {
      return (
        <motion.div key="substep1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-5xl font-heading font-black tracking-tighter mb-4 uppercase">Credentials</h2>
          <p className="text-sm text-foreground/50 mb-12 font-medium">Set up your secure institutional access keys.</p>
          <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@company.com" icon={Mail} />
          <FormInput label="Create Access Key" name="password" value={formData.password} onChange={handleInputChange} placeholder="Min 8 characters" icon={KeyRound} showPasswordToggle />
          <FormInput label="Confirm Access Key" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat password" icon={KeyRound} showPasswordToggle />
          <div className="mt-12 pt-10 flex justify-between items-center border-t border-border">
             <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors flex items-center gap-3"><ArrowLeft size={16}/> Back</button>
             <button 
               onClick={() => setSubStep(2)} 
               disabled={!validateStep()} 
               className={`px-10 py-5 flex items-center gap-4 rounded-full transition-all group hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98] ${validateStep() ? 'bg-accent-orange text-white shadow-[0_15px_40px_-10px_rgba(255,95,5,0.4)]' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
             >
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Next Step</span>
                <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </div>
             </button>
          </div>
        </motion.div>
      );
    }

    if (subStep === 2) {
      return (
        <motion.div key="substep2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-5xl font-heading font-black tracking-tighter mb-4 uppercase">{designation} ENTRY</h2>
          <p className="text-sm text-foreground/50 mb-12 font-medium">Define your professional capacity on the protocol.</p>
          
          {isBuilder && (
            <>
              <FormInput label="Entity Name" name="entityName" value={formData.entityName} onChange={handleInputChange} placeholder="Registered Corporate Name" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                <FormSelect label="Type" name="registrationType" value={formData.registrationType} onChange={handleInputChange} options={['Private Limited', 'Public Limited', 'LLP']} />
                <FormInput label="RERA / License" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="Regulatory ID" />
              </div>
            </>
          )}

          {isInstitutional && (
            <>
              <FormInput label="Legal Entity Name" name="entityName" value={formData.entityName} onChange={handleInputChange} placeholder="e.g. Apex Holdings LLC" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                <FormSelect label="AUM Tier" name="aumTier" value={formData.aumTier} onChange={handleInputChange} options={['$50M+', '$100M+', '$500M+']} icon={Briefcase} />
                <FormSelect label="Jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} options={['USA', 'UK', 'Singapore', 'UAE']} icon={Globe} />
              </div>
            </>
          )}

          {isInvestor && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Legal First Name" />
                <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Legal Last Name" />
              </div>
              <FormInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
              <FormSelect label="Preference" name="investmentPreference" value={formData.investmentPreference} onChange={handleInputChange} options={['Residential', 'Commercial', 'Land']} />
            </>
          )}

          <div className="mt-12 pt-10 flex justify-between items-center border-t border-border">
             <button onClick={() => setSubStep(1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors flex items-center gap-3"><ArrowLeft size={16}/> Back</button>
             <button 
               onClick={() => setSubStep(3)} 
               disabled={!validateStep()} 
               className={`px-10 py-5 flex items-center gap-4 rounded-full transition-all group hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98] ${validateStep() ? 'bg-accent-orange text-white shadow-[0_15px_40px_-10px_rgba(255,95,5,0.4)]' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
             >
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Next: Identity</span>
                <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </div>
             </button>
          </div>
        </motion.div>
      );
    }

    if (subStep === 3) {
      return (
        <motion.div key="substep3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-5xl font-heading font-black tracking-tighter mb-4 uppercase">Identity Mapping</h2>
          <p className="text-sm text-foreground/50 mb-12 font-medium">Global compliance standards require verified identification.</p>
          <FormInput label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} placeholder="12-digit Unique ID" icon={CreditCard} maxLength={12} />
          <FormInput label="PAN Number" name="pan" value={formData.pan} onChange={handleInputChange} placeholder="10-character Tax ID" icon={FileText} maxLength={10} />
          
          {error && <p className="text-red-500 text-[11px] mt-6 font-bold uppercase tracking-widest text-center">{error}</p>}

          <div className="mt-12 pt-10 flex justify-between items-center border-t border-border">
             <button onClick={() => setSubStep(2)} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors flex items-center gap-3"><ArrowLeft size={16}/> Back</button>
             <button 
                onClick={handleRegisterUser} 
                disabled={loading || !validateStep()}
                className={`px-10 py-5 flex items-center gap-4 rounded-full transition-all group hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98] ${validateStep() ? 'bg-accent-orange text-white shadow-[0_15px_40px_-10px_rgba(255,95,5,0.4)]' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
             >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Initialize Entry</span>
                    <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                      <ArrowRight size={16} />
                    </div>
                  </>
                )}
             </button>
          </div>
        </motion.div>
      );
    }

    if (subStep === 4) {
      return (
        <motion.div key="substep4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="text-5xl font-heading font-black tracking-tighter mb-4 uppercase">Authorization</h2>
          <p className="text-sm text-foreground/50 mb-12 font-medium">Enter the 6-digit session code sent to your device.</p>
          <FormInput label="Enter Code" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="000000" icon={Smartphone} maxLength={6} subtext="Institutional Access Protocol Active." />
          
          {error && <p className="text-red-500 text-[11px] mb-8 font-bold uppercase tracking-widest text-center">{error}</p>}
          
          <div className="flex justify-center mb-12">
            <button
              type="button"
              onClick={() => resendOtp(formData.email)}
              disabled={resendTimer > 0}
              className={`text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-full transition-all duration-300 ${
                resendTimer > 0 
                ? 'text-foreground/20 bg-foreground/5 cursor-not-allowed' 
                : 'text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/5'
              }`}
            >
              {resendTimer > 0 ? `RESEND IN ${resendTimer}S` : 'RESEND AUTHORIZATION CODE'}
            </button>
          </div>
          
          <div className="mt-12 pt-10 flex items-center justify-between border-t border-border">
            <button onClick={() => setSubStep(3)} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors flex items-center gap-3"><ArrowLeft size={16}/> Back</button>
            <button 
              onClick={handleSubmit} 
              disabled={loading || !validateStep()} 
              className={`px-10 py-5 flex items-center justify-center gap-4 rounded-full transition-all group hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98] ${loading || !validateStep() ? 'bg-foreground/5 text-foreground/20 cursor-not-allowed' : 'bg-foreground text-background shadow-2xl shadow-foreground/20'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Finalize Entry</span>
                  <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </div>
                </>
              )}
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div key="substep5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
         <div className="w-28 h-28 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-accent-orange/20 shadow-[0_0_30px_rgba(255,95,5,0.2)]">
            <CheckCircle2 size={56} className="text-accent-orange" />
         </div>
         <h2 className="text-5xl font-heading font-black mb-6 tracking-tighter uppercase">Audit Synchronized.</h2>
         <p className="text-foreground/50 mb-12 max-w-sm mx-auto font-medium leading-relaxed">Verification process initialized. Our node will conclude identity mapping within 24 hours.</p>
         <Link to="/dashboard">
            <button className="bg-foreground text-background px-20 py-6 font-black uppercase tracking-[0.4em] text-[12px] rounded-full hover:bg-foreground/90 transition-all shadow-2xl shadow-foreground/10">Enter Terminal</button>
         </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 selection:text-accent-orange font-sans transition-colors duration-500">
      <nav className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-border bg-background sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group">
           <div className="w-10 h-10 bg-accent-orange flex items-center justify-center rounded-full transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,95,5,0.4)]">
             <Zap className="text-white fill-white" size={20} />
           </div>
           <span className="text-xl font-heading font-black tracking-tighter uppercase">EstateX</span>
        </Link>
        <div className="flex items-center gap-8">
           <button onClick={toggleTheme} className="p-3 text-zinc-400 hover:text-foreground transition-colors">
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <Link to="/login">
             <button className="text-[11px] uppercase tracking-[0.3em] font-black text-foreground border border-border px-8 py-3 rounded-full hover:bg-foreground/5 transition-all">Log In</button>
           </Link>
        </div>
      </nav>

      {step === 1 ? (
        <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-32 blueprint-grid">
          <div className="text-center mb-24 space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-8xl font-heading font-black tracking-tighter text-foreground uppercase">Select Designation</motion.h1>
            <p className="text-foreground/40 text-lg max-w-2xl mx-auto leading-relaxed font-medium">Define your professional capacity to configure the institutional protocol.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {designations.map((item) => (
              <DesignationCard key={item.id} {...item} selected={designation === item.id} onClick={setDesignation} />
            ))}
          </div>
          <div className="mt-20 flex justify-center md:justify-end">
            <button
              onClick={() => designation && setStep(2)}
              disabled={!designation}
              className={`group flex items-center justify-center gap-6 px-16 py-6 rounded-full transition-all duration-500 shadow-2xl hover:-rotate-1 hover:scale-[1.02] active:scale-[0.98] ${designation ? 'bg-foreground text-background shadow-foreground/20' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
            >
              <span className="text-[12px] font-black uppercase tracking-[0.4em]">Continue Entry</span>
              <div className="transition-transform group-hover:rotate-12 group-hover:translate-x-1">
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </main>
      ) : (
        <div className="flex min-h-[calc(100vh-5rem)]">
          <div className="hidden lg:flex w-1/2 bg-foreground/[0.02] flex-col p-24 justify-between relative overflow-hidden border-r border-border blueprint-grid">
            <div className="relative z-10 space-y-8">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-orange">Capacity: {designation?.toUpperCase()}</p>
              <h1 className="text-8xl font-heading font-black tracking-tighter leading-[0.85] text-foreground uppercase">Institutional<br />Protocol Entry.</h1>
              <p className="text-foreground/50 max-w-sm leading-relaxed font-medium text-lg">Your onboarding journey is secured via enterprise MPC and audited by global compliance nodes.</p>
            </div>
            <div className="relative z-10 flex gap-12">
               <div className="flex items-center gap-3 opacity-30 group hover:opacity-100 transition-opacity"><ShieldCheck size={20} className="text-accent-orange"/><span className="text-[11px] font-black uppercase tracking-[0.4em]">SOC 2 AUDITED</span></div>
               <div className="flex items-center gap-3 opacity-30 group hover:opacity-100 transition-opacity"><Lock size={20} className="text-accent-orange"/><span className="text-[11px] font-black uppercase tracking-[0.4em]">AES-256 SECURED</span></div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-12 lg:p-24 bg-background relative">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              <ProgressHeader current={subStep} total={5} title="Audit Sequence" />
              <AnimatePresence mode="wait">
                {renderFormContent()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      <footer className="px-12 py-12 flex items-center justify-between border-t border-border text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em]">
        <div className="hidden sm:block">© 2024 EstateX Protocol.</div>
        <div className="flex gap-12">
           {['Terms', 'Privacy', 'Legal', 'Contact'].map(link => <button key={link} className="hover:text-foreground transition-colors">{link}</button>)}
        </div>
      </footer>
    </div>
  );
};

export default Register;
