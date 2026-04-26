import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const BuilderReviewModal = ({ isOpen, onClose, builder, onVerify, rejectionReason, setRejectionReason }) => {
  if (!isOpen || !builder) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-[110]">
        <Button variant="outline" size="sm" onClick={onClose}>CLOSE ESC</Button>
      </div>
      <Card className="max-w-4xl w-full bg-[#0a0a0a] border-white/10 max-h-[90vh] overflow-hidden flex flex-col p-0">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-3xl font-bold uppercase tracking-tighter">{builder.company_name}</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] mt-2">Accreditation Node Review: {builder.id}</CardDescription>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Business Identity</h4>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: builder.business_type },
                  { label: 'CIN', value: builder.company_registration_number },
                  { label: 'PAN', value: builder.pan_number },
                  { label: 'GST', value: builder.gst_number },
                  { label: 'Established', value: builder.year_established },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/20 uppercase">{item.label}</span>
                    <span className="font-mono text-white/80">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Compliance Matrix</h4>
              <div className="space-y-3">
                {[
                  { label: 'RERA ID', value: builder.rera_registration_number },
                  { label: 'City', value: builder.headquarters_city },
                  { label: 'State', value: builder.headquarters_state },
                  { label: 'Pincode', value: builder.headquarters_pincode },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/20 uppercase">{item.label}</span>
                    <span className="font-mono text-white/80">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 pb-2">Digital Asset Board</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Reg Certificate', url: builder.reg_cert_url },
                { label: 'RERA Cert', url: builder.rera_cert_url },
                { label: 'Balance Sheet', url: builder.balance_sheet_url },
                { label: 'IT Returns', url: builder.it_returns_url },
                { label: 'Bank Stmts', url: builder.bank_statements_url },
              ].map(doc => (
                <div key={doc.label} className="p-4 bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 mb-3">{doc.label}</span>
                  {doc.url ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[9px] h-8 border border-white/10"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      VIEW RAW ASSET
                    </Button>
                  ) : (
                    <span className="text-[9px] text-white/10 uppercase italic">Not Provided</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/10">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Financial Settlement Node</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase tracking-widest">
              <div>
                <span className="block text-white/20 mb-1">Bank</span>
                <span className="text-white font-bold">{builder.bank_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">Account</span>
                <span className="text-white font-bold font-mono">{builder.bank_account_number || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">Beneficiary</span>
                <span className="text-white font-bold">{builder.bank_account_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-white/20 mb-1">IFSC</span>
                <span className="text-white font-bold font-mono">{builder.bank_ifsc_code || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Audit Comments / Rejection Reasoning</label>
              <textarea 
                className="w-full bg-[#050505] border border-white/10 p-4 text-xs font-mono text-white focus:border-primary-500 outline-none min-h-[100px]"
                placeholder="Required for 'Rejection' or 'Revision Request'..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="danger" 
                className="h-14 text-[10px] tracking-widest"
                onClick={() => onVerify(builder.id, 'rejected')}
                disabled={!rejectionReason}
              >
                SUSPEND (REJECT)
              </Button>
              <Button 
                variant="outline" 
                className="h-14 text-[10px] tracking-widest border-blue-500/50 text-blue-400"
                onClick={() => onVerify(builder.id, 'revision_required')}
                disabled={!rejectionReason}
              >
                REQUEST REVISION
              </Button>
              <Button 
                variant="primary" 
                className="h-14 text-[10px] tracking-widest"
                onClick={() => onVerify(builder.id, 'approved')}
              >
                ACCREDIT NODE (APPROVE)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuilderReviewModal;
