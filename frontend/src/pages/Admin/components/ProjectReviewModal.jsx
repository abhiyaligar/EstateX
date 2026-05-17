import React from 'react';
import { MapPin, ShieldCheck, AlertTriangle, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const ProjectReviewModal = ({ isOpen, onClose, project, onIPOAction, onHaltAction }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-5xl w-full bg-background border-border max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <CardHeader className="border-b border-border p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{project.title}</CardTitle>
            <div className="flex gap-4 mt-2">
                <span className="uppercase tracking-[0.2em] text-[10px] text-foreground/40">Project ID: {project.id}</span>
                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-none border ${
                    project.ipo_status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    project.ipo_status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    'bg-foreground/10 text-foreground/40 border-border'
                    }`}>
                    {project.ipo_status}
                </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             {project.ipo_status === 'upcoming' && (
               <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-foreground text-[10px] h-10 px-6 font-bold tracking-widest" onClick={() => onIPOAction(project.id, 'approve')}>APPROVE IPO</Button>
             )}
             {project.ipo_status === 'active' && (
               <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-foreground text-[10px] h-10 px-6 font-bold tracking-widest" onClick={() => onIPOAction(project.id, 'complete')}>COMPLETE IPO</Button>
             )}
             <Button 
                size="sm" 
                variant={project.status === 'halted' ? 'primary' : 'danger'} 
                className="text-[10px] h-10 px-6 font-bold tracking-widest" 
                onClick={() => onHaltAction(project.id, project.status)}
             >
                {project.status === 'halted' ? 'RESUME TRADING' : 'HALT PROJECT'}
             </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2 mb-4">Asset Identification</h4>
                <p className="text-sm text-foreground/70 leading-relaxed mb-6">{project.description}</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Category</span>
                        <span className="block text-foreground font-bold uppercase">{project.property_type || 'Apartment'}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Dimensions</span>
                        <span className="block text-foreground font-bold uppercase">
                            {project.location?.area_sqft || 'N/A'} SQ. FT.
                            {project.bedrooms && ` • ${project.bedrooms} BHK`}
                        </span>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2 mb-4">Geographical Node</h4>
                <div className="p-4 bg-foreground/[0.04] border border-border space-y-3">
                    <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-foreground/20" />
                        <span className="text-sm text-foreground/80">{project.location?.address}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[10px] uppercase tracking-widest pt-3 border-t border-border">
                        <div className="flex flex-col gap-1">
                            <span className="text-foreground/20">City</span>
                            <span className="text-foreground font-bold">{project.location?.city}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-foreground/20">State</span>
                            <span className="text-foreground font-bold">{project.location?.state}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-foreground/20">Pincode</span>
                            <span className="text-foreground font-bold font-mono">{project.location?.pincode}</span>
                        </div>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2 mb-4">Compliance Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'RERA APPROVAL', status: project.compliance?.rera_approved },
                        { label: 'ENV CLEARANCE', status: project.compliance?.environmental_clearance },
                        { label: 'ASSET INSURANCE', status: project.compliance?.insurance_coverage }
                    ].map(item => (
                        <div key={item.label} className={`p-4 border ${item.status ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-foreground/[0.04] border-border text-foreground/20'}`}>
                            <div className="flex items-center gap-3">
                                {item.status ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                                <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="p-6 bg-foreground/[0.05] border border-border space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2">Financial Node</h4>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Market Valuation</span>
                        <span className="text-2xl font-bold tracking-tighter text-foreground">₹{project.financial?.total_budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-foreground/5 overflow-hidden">
                        <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${(project.financial?.funding_raised / project.financial?.total_budget) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[9px] uppercase tracking-widest">
                        <span className="text-green-500 font-bold">RAISED: ₹{project.financial?.funding_raised?.toLocaleString() || 0}</span>
                        <span className="text-foreground/20">TARGET: 100%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Brick Supply</span>
                        <span className="block text-foreground font-bold font-mono">{project.financial?.total_bricks?.toLocaleString() || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Escrow Held</span>
                        <span className="block text-foreground font-bold font-mono text-amber-500">₹{project.financial?.total_escrow_held?.toLocaleString() || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">Face Value</span>
                        <span className="block text-foreground font-bold font-mono">₹{project.financial?.face_value || 0}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/20">IPO Price</span>
                        <span className="block text-foreground font-bold font-mono text-green-500">₹{project.financial?.ipo_price || 0}</span>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2 mb-4">Node Origin</h4>
                <div className="flex items-center gap-4 bg-foreground/[0.04] border border-border p-4 group cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <div className="w-10 h-10 bg-foreground/5 border border-border flex items-center justify-center text-foreground/40">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-foreground uppercase block">{project.builder?.company_name}</span>
                        <span className="text-[9px] uppercase tracking-widest text-foreground/20">Verified Builder Node</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold border-b border-border pb-2 mb-6">Asset Visual Board</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.images?.length > 0 ? (
                    project.images.map((img, idx) => (
                        <div key={idx} className="aspect-video bg-foreground/5 border border-border group overflow-hidden relative">
                             <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center text-[10px] uppercase tracking-widest text-foreground/20">IMAGE {idx + 1}</div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border">
                        <p className="text-[10px] uppercase tracking-widest text-foreground/20">No images provided for this asset</p>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReviewModal;
