import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  MessageSquare, 
  Clock, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  User, 
  Mail,
  ArrowRight
} from 'lucide-react';
import supportService from '../../../services/supportService';

const SupportTab = ({ addToast }) => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await supportService.getAllTickets(statusFilter);
      setTickets(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Support Node Sync Error:", error);
      if (addToast) addToast("Failed to synchronize support ledger", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId, newStatus) => {
    setUpdating(true);
    try {
      const updated = await supportService.updateTicket(ticketId, { 
        status: newStatus,
        admin_notes: adminNotes 
      });
      
      // Update local state instead of just closing
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updated } : t));
      setSelectedTicket({ ...selectedTicket, ...updated });
      
      if (addToast) addToast(`Ticket status updated to ${newStatus}`);
      
      // Optionally fetch to ensure everything is in sync
      // fetchTickets();
    } catch (error) {
      if (addToast) addToast("Status Sync Failure.", "error");
      else alert("Status Sync Failure.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Open Node</span>;
      case 'in_progress': return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Processing</span>;
      case 'resolved': return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Resolved</span>;
      default: return <span className="px-2 py-0.5 bg-zinc-500/10 text-zinc-500 text-[8px] font-black uppercase tracking-widest border border-zinc-500/20">Closed</span>;
    }
  };

  const safeSlice = (val, start, end) => {
    if (typeof val !== 'string') return String(val).slice(start, end);
    return val.slice(start, end);
  };

  return (
    <div className="space-y-8">
      {/* Header Audit Node */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-heading uppercase tracking-tight">Institutional Support <span className="italic opacity-30">Audit</span></h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Managing {total} Inquiry Nodes</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-[#0a0a0a] border border-white/5 p-1 shrink-0">
            {['', 'open', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status ? 'bg-[#C5A059] text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {status || 'All Nodes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Ticket Ledger */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 animate-pulse">Synchronizing Global Support Ledger...</div>
          ) : tickets.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/5 text-zinc-700 uppercase text-[10px] tracking-widest bg-white/[0.01]">Zero active anomalies detected</div>
          ) : (
            tickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                noPadding
                className={`cursor-pointer transition-all border-l-2 ${selectedTicket?.id === ticket.id ? 'border-l-[#C5A059] bg-[#121212]' : 'border-l-transparent hover:border-white/10'}`}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setAdminNotes(ticket.admin_notes || '');
                }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {getStatusBadge(ticket.status)}
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{ticket.category}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-800"></span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ID: {safeSlice(ticket.id, 0, 8)}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest">{ticket.subject}</h4>
                        <p className="text-[11px] text-zinc-500 mt-2 line-clamp-1 italic">{ticket.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest pt-2">
                         <div className="flex items-center gap-1.5">
                            <User size={10} className="text-[#C5A059]/50" />
                            <span>{ticket.user_name || 'Protocol User'}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Mail size={10} className="text-[#C5A059]/50" />
                            <span className="lowercase font-normal text-zinc-500">{ticket.user_email}</span>
                         </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1 hidden sm:block">
                      <p className="text-[10px] font-black text-zinc-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Node User: {safeSlice(ticket.user_id, 0, 8)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Resolution Terminal */}
        <div className="xl:col-span-1">
          <div className="sticky top-8 space-y-6">
            {selectedTicket ? (
              <Card noPadding className="border border-[#C5A059]/30 bg-[#0d0d0d] shadow-2xl">
                <CardHeader className="p-6 border-b border-white/5 space-y-0 flex-row justify-between items-center">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black text-[#C5A059]">Inquiry Analysis</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 px-3" onClick={() => setSelectedTicket(null)}>
                    <ArrowRight size={14} className="rotate-180" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold uppercase tracking-widest">{selectedTicket.subject}</h3>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <p className="text-[12px] text-zinc-400 leading-relaxed bg-white/[0.02] p-4 border-l border-[#C5A059]/30 italic">
                      "{selectedTicket.description}"
                    </p>
                    
                    <div className="pt-4 space-y-3">
                       <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                             <User size={14} className="text-primary-500" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase">{selectedTicket.user_name}</p>
                             <p className="text-[9px] text-zinc-600">{selectedTicket.user_email}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex justify-between">
                        <span>Administrative Response</span>
                        <span className="text-[#C5A059]/50 italic">Internal Notes & Client Feedback</span>
                      </label>
                      <textarea
                        rows={6}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 p-4 text-[11px] focus:border-[#C5A059] outline-none transition-colors resize-none placeholder:text-zinc-800"
                        placeholder="Detail the resolution protocol..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        fullWidth 
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'in_progress')}
                        disabled={updating || selectedTicket.status === 'in_progress'}
                        isLoading={updating && selectedTicket.status !== 'resolved'}
                      >
                        {selectedTicket.status === 'in_progress' ? 'Processing...' : 'Process Node'}
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        fullWidth 
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'resolved')}
                        disabled={updating || selectedTicket.status === 'resolved'}
                        isLoading={updating && selectedTicket.status === 'resolved'}
                      >
                        {selectedTicket.status === 'resolved' ? 'Resolved' : 'Resolve Inquiry'}
                      </Button>
                    </div>
                    
                    {selectedTicket.status === 'resolved' && (
                      <div className="flex items-center gap-2 justify-center text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-500/5 py-2 border border-emerald-500/10">
                        <CheckCircle size={12} />
                        Protocol Successfully Resolved
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/[0.01] p-12 text-center">
                <Search size={32} className="text-zinc-800 mb-4" strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Select an inquiry node from the ledger to initiate resolution</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTab;
