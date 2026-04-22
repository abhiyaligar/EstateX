import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import builderService from '../services/builderService';
import { useAuth } from '../context/AuthContext';

const BuilderVerification = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Company Profile
        company_name: '',
        business_type: '',
        company_registration_number: '',
        pan_number: '',
        gst_number: '',
        year_established: '',
        
        // Step 2: Compliance
        rera_registration_number: '',
        headquarters_address: '',
        headquarters_city: '',
        headquarters_state: '',
        headquarters_pincode: '',
        
        // Step 3: Documents
        reg_cert_url: '',
        balance_sheet_url: '',
        it_returns_url: '',
        bank_statements_url: '',
        rera_cert_url: '',

        // Step 4: Bank Details
        bank_account_name: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc_code: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await builderService.getProfile();
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        ...profile,
                        year_established: profile.year_established || ''
                    }));
                }
            } catch (err) {
                console.error("No profile found yet");
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        setActiveStep(prev => Math.min(prev + 1, 5));
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setActiveStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Update the profile with all details
            await builderService.updateProfile(formData);
            // 2. Submit for official review
            await builderService.submitForReview();
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to submit verification request. Please check all fields.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Company Identity', icon: Building2 },
        { id: 2, title: 'Compliance & RERA', icon: ShieldCheck },
        { id: 3, title: 'Document Evidence', icon: FileText },
        { id: 4, title: 'Financial Node', icon: CreditCard },
        { id: 5, title: 'Final Review', icon: FileCheck }
    ];

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter mb-4">Builder Node Accreditation</h1>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Verify your identity to begin property tokenization</p>
                </div>

                {/* Progress Stepper */}
                <div className="mb-12 flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10"></div>
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = activeStep === step.id;
                        const isCompleted = activeStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border ${
                                    isActive ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 
                                    isCompleted ? 'bg-green-500 text-white border-green-500' : 
                                    'bg-[#111] text-white/20 border-white/5'
                                }`}>
                                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                                </div>
                                <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold hidden sm:block ${isActive ? 'text-white' : 'text-white/20'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeStep === 1 && (
                            <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Briefcase className="text-white/20" size={24} />
                                    <h2 className="text-xl font-bold uppercase tracking-tight">Organization Profile</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Official Company Name" 
                                        name="company_name" 
                                        value={formData.company_name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Business Type (e.g. Pvt Ltd)" 
                                        name="business_type" 
                                        value={formData.business_type} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Corporate Identity Number (CIN)" 
                                        name="company_registration_number" 
                                        value={formData.company_registration_number} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Year Established" 
                                        name="year_established" 
                                        type="number"
                                        value={formData.year_established} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Company PAN" 
                                        name="pan_number" 
                                        value={formData.pan_number} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="GSTIN Number" 
                                        name="gst_number" 
                                        value={formData.gst_number} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </Card>
                        )}

                        {activeStep === 2 && (
                            <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <MapPin className="text-white/20" size={24} />
                                    <h2 className="text-xl font-bold uppercase tracking-tight">Regulatory Compliance</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <Input 
                                        label="Master RERA Registration Number" 
                                        name="rera_registration_number" 
                                        value={formData.rera_registration_number} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Headquarters Full Address" 
                                        name="headquarters_address" 
                                        value={formData.headquarters_address} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Input 
                                            label="City" 
                                            name="headquarters_city" 
                                            value={formData.headquarters_city} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <Input 
                                            label="State" 
                                            name="headquarters_state" 
                                            value={formData.headquarters_state} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <Input 
                                            label="Pincode" 
                                            name="headquarters_pincode" 
                                            value={formData.headquarters_pincode} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeStep === 3 && (
                            <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="text-white/20" size={24} />
                                    <h2 className="text-xl font-bold uppercase tracking-tight">Document References</h2>
                                </div>
                                <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed mb-6">Provide the hosted links or reference numbers for your verification documents. These will be audited by the EstateX team.</p>
                                <div className="space-y-6">
                                    <Input 
                                        label="Registration Certificate URL/Reference" 
                                        name="reg_cert_url" 
                                        value={formData.reg_cert_url} 
                                        onChange={handleChange} 
                                        placeholder="Link to file or reference code"
                                    />
                                    <Input 
                                        label="RERA Certificate URL/Reference" 
                                        name="rera_cert_url" 
                                        value={formData.rera_cert_url} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Latest Audited Balance Sheet (Link)" 
                                        name="balance_sheet_url" 
                                        value={formData.balance_sheet_url} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Latest IT Returns (Link)" 
                                        name="it_returns_url" 
                                        value={formData.it_returns_url} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </Card>
                        )}

                        {activeStep === 4 && (
                            <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CreditCard className="text-white/20" size={24} />
                                    <h2 className="text-xl font-bold uppercase tracking-tight">Node Financial Nexus</h2>
                                </div>
                                <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed mb-6">This bank account will be used as the primary settlement node for all construction fund releases.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Official Beneficiary Name" 
                                        name="bank_account_name" 
                                        value={formData.bank_account_name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Full Institution Name" 
                                        name="bank_name" 
                                        value={formData.bank_name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Corporate Account Number" 
                                        name="bank_account_number" 
                                        value={formData.bank_account_number} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="IFSC / SWIFT Code" 
                                        name="bank_ifsc_code" 
                                        value={formData.bank_ifsc_code} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </Card>
                        )}

                        {activeStep === 5 && (
                            <Card className="p-8 space-y-8">
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20">
                                        <ShieldCheck size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Final Affirmation</h2>
                                    <p className="text-sm text-white/40 max-w-md mx-auto">Please confirm that all provided data is accurate to within 100% precision. Misrepresentation will result in immediate node suspension.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 text-xs border-t border-b border-white/5 py-8 uppercase tracking-widest">
                                    <span className="text-white/20">Entity</span>
                                    <span className="text-right font-bold">{formData.company_name}</span>
                                    <span className="text-white/20">RERA ID</span>
                                    <span className="text-right font-bold font-mono">{formData.rera_registration_number}</span>
                                    <span className="text-white/20">Tax Node</span>
                                    <span className="text-right font-bold font-mono">{formData.pan_number}</span>
                                    <span className="text-white/20">Settlement</span>
                                    <span className="text-right font-bold font-mono">{formData.bank_account_number.substring(0,4)}...</span>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs uppercase tracking-widest flex items-center gap-3">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="mt-8 flex justify-between">
                    <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        disabled={activeStep === 1 || loading}
                        className={activeStep === 1 ? 'opacity-0' : ''}
                    >
                        <ArrowLeft size={16} className="mr-2" /> Previous
                    </Button>

                    {activeStep === 5 ? (
                        <Button 
                            variant="primary" 
                            onClick={handleSubmit} 
                            loading={loading}
                            className="px-12 h-14 text-sm tracking-[0.3em]"
                        >
                            SUBMIT TO AUDIT BOARD
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={handleNext}
                            className="px-12 h-14 text-sm tracking-[0.3em]"
                        >
                            Next Phase <ArrowRight size={16} className="ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuilderVerification;
