import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronDown, ChevronUp, MessageCircle, Clock, ShieldCheck, AlertCircle, Send, Plus } from 'lucide-react';
import supportService from '../services/supportService';
import { motion, AnimatePresence } from 'framer-motion';

const Help = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'technical', description: '' });

  const faqs = [
    {
      question: "How is my institutional capital secured?",
      answer: "EstateX utilizes multi-signature escrow protocols and blockchain-immutable ledgers for all property tranches. Your positions are audited in real-time against physical asset valuations."
    },
    {
      question: "What is the secondary market liquidity protocol?",
      answer: "The Sovereign Exchange allows for peer-to-peer trading of asset bricks. Liquidity is maintained through a high-performance matching engine and automated market makers for select tranches."
    },
    {
      question: "How do I initiate a rental revenue withdrawal?",
      answer: "Revenue is distributed automatically to your secure wallet node. You can synchronize these funds with your linked bank account via the Wallet terminal using the 'Withdraw' audit sequence."
    },
    {
      question: "What does 'Sovereign Node' status imply?",
      answer: "A Sovereign Node is a fully verified institutional account that has passed all multi-point KYC/AML audits, granting full access to primary market IPOs and high-limit secondary trading."
    }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error("Support Node Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      await supportService.createTicket(newTicket);
      setNewTicket({ subject: '', category: 'technical', description: '' });
      setShowTicketForm(false);
      fetchTickets();
    } catch (error) {
      alert("Inquiry Submission Failure. Please verify your node status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-amber-500';
      case 'in_progress': return 'text-blue-500';
      case 'resolved': return 'text-emerald-500';
      default: return 'text-zinc-600 dark:text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-16 max-w-7xl mx-auto">
      {/* Header Node */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">
          <span className="h-px w-10 bg-surface/30"></span>
          Institutional Support // Node 04
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-light tracking-tighter uppercase">
          Sovereign <span className="italic opacity-30">Sanctuary.</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm md:text-base leading-relaxed">
          Access our high-fidelity knowledge nodes or raise an institutional inquiry directly with our global support architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* FAQ Section */}
        <div className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Knowledge Nodes</h2>
            <h3 className="text-2xl font-heading uppercase">Protocol FAQ</h3>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-t border-black/5 dark:border-white/5 py-6">
                <button 
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left group"
                >
                  <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#C5A059] transition-colors">
                    {faq.question}
                  </span>
                  {expandedFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Support Node</h2>
              <h3 className="text-2xl font-heading uppercase">Inquiry Ledger</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTicketForm(!showTicketForm)}
              leftIcon={<Plus size={14} />}
            >
              Raise Inquiry
            </Button>
          </div>

          <AnimatePresence>
            {showTicketForm && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 border border-[#C5A059]/20 bg-surface space-y-8"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Subject</label>
                      <input 
                        type="text" 
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        className="w-full bg-transparent border-b border-black/10 dark:border-white/10 p-2 text-sm focus:border-[#C5A059] outline-none transition-colors"
                        placeholder="Security Audit"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Category</label>
                      <select 
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                        className="w-full bg-transparent border-b border-black/10 dark:border-white/10 p-2 text-sm focus:border-[#C5A059] outline-none transition-colors appearance-none"
                      >
                        <option value="technical" className="bg-surface">Technical Node</option>
                        <option value="financial" className="bg-surface">Financial Settlement</option>
                        <option value="account" className="bg-surface">Identity/Auth</option>
                        <option value="property" className="bg-surface">Asset Tranche</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Detailed Description</label>
                    <textarea 
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      className="w-full bg-transparent border-b border-black/10 dark:border-white/10 p-2 text-sm focus:border-[#C5A059] outline-none transition-colors resize-none"
                      placeholder="Describe the institutional anomaly..."
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setShowTicketForm(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSubmitTicket} leftIcon={<Send size={14} />}>Submit Node</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Ledger...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                <ShieldCheck size={32} className="mx-auto text-zinc-800 dark:text-zinc-200 mb-4" strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No active inquiries found</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="p-6 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01] hover:bg-black/[0.04] dark:bg-white/[0.02] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">|</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
                          {ticket.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-widest group-hover:text-foreground transition-colors">{ticket.subject}</h4>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">{ticket.description}</p>
                  {ticket.admin_notes && (
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex gap-3 items-start">
                      <MessageCircle size={14} className="text-[#C5A059] mt-0.5" />
                      <p className="text-[11px] italic text-[#C5A059]/80">{ticket.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
