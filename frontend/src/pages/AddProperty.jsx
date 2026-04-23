import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  UploadCloud, 
  Banknote, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import propertyService from '../services/propertyService';

const AddProperty = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Identity
    title: '',
    description: '',
    type: 'Apartment',
    beds: '',
    baths: '',
    area: '',
    
    // Step 2: Location
    location_address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Step 3: Financials
    total_budget: '',
    face_value: '',
    ipo_price: '',
    
    // Step 4: Compliance
    rera_id: '',
    rera_approved: true,
    environmental_clearance: true,
    insurance_coverage: true,
    rera_approval_url: '',
    brochure_url: '',

    // Step 5: Timeline
    expected_completion_date: '',
    status: 'Upcoming'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Auto calculate bricks correctly
  const totalBricks = formData.total_budget && formData.face_value 
      ? Math.floor(parseFloat(formData.total_budget) / parseFloat(formData.face_value)) 
      : 0;

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, 6));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError("Please upload at least one project image to continue.");
      setActiveStep(6);
      return;
    }

    if (totalBricks <= 0) {
      setError("Invalid financial configuration. Total Bricks must be greater than zero.");
      setActiveStep(3);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        location_address: formData.location_address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        total_budget: parseFloat(formData.total_budget),
        total_bricks: totalBricks,
        face_value: parseFloat(formData.face_value),
        ipo_price: parseFloat(formData.ipo_price),
        property_type: formData.type,
        bedroom_count: parseInt(formData.beds) || 0,
        bathroom_count: parseFloat(formData.baths) || 0,
        area_sqft: parseFloat(formData.area) || 0,
        rera_id: formData.rera_id,
        rera_approved: formData.rera_approved,
        environmental_clearance: formData.environmental_clearance,
        insurance_coverage: formData.insurance_coverage,
        rera_approval_url: formData.rera_approval_url,
        brochure_url: formData.brochure_url,
        expected_completion_date: formData.expected_completion_date ? new Date(formData.expected_completion_date).toISOString() : null,
        milestones: [
          {
            milestone_number: 1,
            description: "Phase 1: Project Initiation & Land Verification",
            release_percentage: 20.0
          },
          {
            milestone_number: 2,
            description: "Phase 2: Foundation & Framing",
            release_percentage: 40.0
          },
          {
            milestone_number: 3,
            description: "Phase 3: Final Completion & Handover",
            release_percentage: 40.0
          }
        ]
      };
      
      await propertyService.createProject(projectData, selectedFiles);
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to list property:", err);
      setError(err.response?.data?.detail || "Failed to create property. Please verify your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Project Identity', icon: Building },
    { id: 2, title: 'Location Matrix', icon: MapPin },
    { id: 3, title: 'Financial Node', icon: Banknote },
    { id: 4, title: 'Compliance Hub', icon: ShieldCheck },
    { id: 5, title: 'Build Timeline', icon: Calendar },
    { id: 6, title: 'Media & Launch', icon: UploadCloud }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Initialize Project Node</h1>
            <p className="text-white/40 uppercase tracking-[0.2em] text-[10px]">Deploy a new fractionalized property asset to the EstateX exchange</p>
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
                            <Info className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Essential Identity</h2>
                        </div>
                        <div className="space-y-6">
                            <Input 
                                label="Project Public Title" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. The Sapphire Penthouses"
                                required 
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">Technical Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-none border border-white/5 bg-[#111] px-4 py-3 text-sm text-white transition-all placeholder:text-white/20 focus-visible:outline-none focus-visible:border-white/20"
                                    placeholder="Detail the architectural uniqueness and investment value..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">Asset Class</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full h-12 rounded-none border border-white/5 bg-[#111] px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                                    >
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>
                                <Input label="Area (Sq. Ft.)" name="area" type="number" value={formData.area} onChange={handleChange} />
                            </div>
                        </div>
                    </Card>
                )}

                {activeStep === 2 && (
                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Geographical Placement</h2>
                        </div>
                        <div className="space-y-6">
                            <Input 
                                label="Node Street Address / Locality" 
                                name="location_address" 
                                value={formData.location_address} 
                                onChange={handleChange} 
                                icon={MapPin}
                                placeholder="123 Alpha Industrial Hub"
                                required 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
                                <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
                                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                            </div>
                        </div>
                    </Card>
                )}

                {activeStep === 3 && (
                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Financial Tokenomics</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input 
                                label="Total Funding Target (₹)" 
                                name="total_budget" 
                                type="number"
                                value={formData.total_budget} 
                                onChange={handleChange} 
                                icon={DollarSign}
                                required 
                            />
                            <Input 
                                label="Brick Face Value (₹)" 
                                name="face_value" 
                                type="number"
                                value={formData.face_value} 
                                onChange={handleChange}
                                icon={Banknote} 
                                required 
                            />
                            <Input 
                                label="IPO Listing Price (₹)" 
                                name="ipo_price" 
                                type="number"
                                value={formData.ipo_price} 
                                onChange={handleChange}
                                icon={TrendingUp} 
                                required 
                            />
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/5 flex items-center gap-6 mt-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <Layers size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-1">Calculated Supply</p>
                                <p className="text-3xl font-bold tracking-tighter">
                                    {totalBricks.toLocaleString()} <span className="text-xs uppercase text-white/40 tracking-widest font-medium ml-2">Total Bricks</span>
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-white/20 italic">Note: Brick supply is automatically derived from Target Budget / Face Value.</p>
                    </Card>
                )}

                {activeStep === 4 && (
                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Compliance & Accreditation</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[
                                { name: 'rera_approved', label: 'RERA Approved', icon: ShieldCheck },
                                { name: 'environmental_clearance', label: 'Env Clearance', icon: CheckCircle2 },
                                { name: 'insurance_coverage', label: 'Insured Asset', icon: ShieldCheck }
                            ].map(flag => (
                                <div key={flag.name} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] transition-all hover:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <flag.icon className={formData[flag.name] ? 'text-green-500' : 'text-white/20'} size={18} />
                                        <span className="text-[10px] uppercase tracking-widest font-bold">{flag.label}</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        name={flag.name}
                                        checked={formData[flag.name]}
                                        onChange={handleChange}
                                        className="w-5 h-5 accent-white rounded-none border-white/5"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Input label="RERA Registration ID" name="rera_id" value={formData.rera_id} onChange={handleChange} placeholder="e.g. PR/MH/100..." required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Brochure Source (URL)" name="brochure_url" value={formData.brochure_url} onChange={handleChange} placeholder="Link to PDF" />
                                <Input label="RERA Approval Doc (URL)" name="rera_approval_url" value={formData.rera_approval_url} onChange={handleChange} placeholder="Link to Certificate" />
                            </div>
                        </div>
                    </Card>
                )}

                {activeStep === 5 && (
                    <Card className="p-8 space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Timeline & Release Phases</h2>
                        </div>

                        <div className="max-w-md">
                            <Input label="Project Completion Date" name="expected_completion_date" type="date" value={formData.expected_completion_date} onChange={handleChange} required />
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">Automatic Escalation Phases</h4>
                            {[
                                { step: 1, label: 'Phase 1: Initialization', percent: 20 },
                                { step: 2, label: 'Phase 2: Core Structure', percent: 40 },
                                { step: 3, label: 'Phase 3: Final Accreditation', percent: 40 }
                            ].map(m => (
                                <div key={m.step} className="flex items-center gap-6 p-4 border border-white/5 bg-white/[0.01]">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                                        0{m.step}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold uppercase tracking-widest">{m.label}</p>
                                        <div className="h-[2px] w-full bg-white/5 mt-2 overflow-hidden">
                                            <div className="h-full bg-white/40" style={{ width: `${m.percent}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold tracking-tighter">{m.percent}%</p>
                                        <p className="text-[9px] uppercase tracking-widest text-white/20">Release</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeStep === 6 && (
                    <Card className="p-8 space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <UploadCloud className="text-white/20" size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Node Assets & Affirmation</h2>
                        </div>

                        {/* Media Upload */}
                        <div className="border-2 border-dashed border-white/5 bg-white/[0.01] p-12 text-center relative group hover:border-white/10 transition-all">
                            <input 
                                type="file" 
                                multiple 
                                onChange={handleFileChange} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                            />
                            <div className="flex flex-col items-center">
                                <UploadCloud size={48} className="text-white/20 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-bold uppercase tracking-widest mb-1">Upload Project Visuals</p>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Select 1-10 high resolution renders</p>
                            </div>
                        </div>

                        {/* Selected Files Gallery */}
                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative aspect-square border border-white/10 group overflow-hidden">
                                        <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-[10px] font-mono break-all p-2 text-center">
                                            {file.name}
                                        </div>
                                        <button 
                                            onClick={() => removeFile(i)}
                                            className="absolute top-2 right-2 p-1.5 bg-black text-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest flex items-center gap-3">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                                I hereby affirm that the asset identified as <span className="text-white font-bold">{formData.title || "[TITLE]"}</span> meets all regional RERA requirements and the financial data provided is accurate. Tokenization will proceed upon admin validation.
                            </p>
                        </div>
                    </Card>
                )}
            </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between">
            <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={activeStep === 1 || isSubmitting}
                className={activeStep === 1 ? 'opacity-0 pointer-events-none' : ''}
            >
                <ArrowLeft size={16} className="mr-2" /> Back Phase
            </Button>

            {activeStep === 6 ? (
                <Button 
                    variant="primary" 
                    onClick={handleSubmit} 
                    isLoading={isSubmitting}
                    className="px-12 h-14 text-sm tracking-[0.3em] bg-white text-black hover:bg-white/90"
                >
                    LAUNCH PROJECT NODE
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

export default AddProperty;
