import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Fingerprint, User, X, Shield, Lock } from 'lucide-react';
import { userService } from '../../services/userService';

const AddBankAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    is_primary: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.addBankAccount(formData);
      onSuccess();
      onClose();
      setFormData({
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        is_primary: false
      });
    } catch (error) {
      console.error("Failed to add bank account", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-[520px] bg-[#080808] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)] p-8 md:p-12 overflow-y-auto max-h-[90vh] scrollbar-hide rounded-none"
          >
            {/* Header Node */}
            <div className="flex justify-between items-start mb-14">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Security Protocol Active</p>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-white leading-none">
                    Link Bank <span className="text-white/10">Account</span>
                  </h2>
               </div>
               <button 
                 onClick={onClose}
                 className="w-10 h-10 flex items-center justify-center rounded-full border border-white/5 text-zinc-600 hover:text-white transition-all hover:bg-white/5"
               >
                 <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
               {/* Account Holder Name */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Account Holder Name</label>
                  <div className="relative group">
                     <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" />
                     <input 
                       name="account_holder_name"
                       placeholder="As per bank records"
                       value={formData.account_holder_name}
                       onChange={handleChange}
                       className="w-full bg-white/[0.01] border border-white/10 p-6 pl-16 text-[14px] font-medium text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800"
                       required
                     />
                  </div>
               </div>

               {/* Account Number */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Account Number</label>
                  <div className="relative group">
                     <Fingerprint size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" />
                     <input 
                       name="account_number"
                       placeholder="Enter 12-16 digit number"
                       value={formData.account_number}
                       onChange={handleChange}
                       className="w-full bg-white/[0.01] border border-white/10 p-6 pl-16 text-[14px] font-medium text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800"
                       required
                     />
                  </div>
               </div>

               {/* IFSC Code */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">IFSC Code</label>
                  <div className="relative group">
                     <Landmark size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" />
                     <input 
                       name="ifsc_code"
                       placeholder="e.g. HDFC0001234"
                       value={formData.ifsc_code}
                       onChange={handleChange}
                       className="w-full bg-white/[0.01] border border-white/10 p-6 pl-16 text-[14px] font-medium text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800"
                       required
                     />
                  </div>
               </div>

               {/* Primary Checkbox */}
               <div className="flex items-center gap-4">
                  <input 
                    type="checkbox"
                    id="is_primary"
                    name="is_primary"
                    checked={formData.is_primary}
                    onChange={handleChange}
                    className="w-5 h-5 bg-transparent border border-white/10 rounded-none checked:bg-[#00e676] appearance-none cursor-pointer relative checked:before:content-['✓'] checked:before:absolute checked:before:text-[12px] checked:before:text-black checked:before:font-black checked:before:left-1 checked:before:top-0"
                  />
                  <label htmlFor="is_primary" className="text-xs font-bold text-zinc-500 cursor-pointer uppercase tracking-widest">
                    Set as primary bank account
                  </label>
               </div>

               {/* Submit Node */}
               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-[#00e676] text-black py-6 text-[12px] font-black uppercase tracking-[0.5em] hover:bg-[#00ff84] transition-all disabled:opacity-50 shadow-[0_15px_40px_rgba(0,230,118,0.2)]"
               >
                 {loading ? 'SYNCHRONIZING...' : 'ADD BANK ACCOUNT'}
               </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddBankAccountModal;
