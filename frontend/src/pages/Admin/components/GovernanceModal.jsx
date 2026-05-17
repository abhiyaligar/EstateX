import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const GovernanceModal = ({ isOpen, onClose, projects, onSave }) => {
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    options: ['Yes', 'No'],
    end_date: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => setFormData({ ...formData, options: [...formData.options, ''] });
  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="max-w-xl w-full bg-background border-black/10 dark:border-white/10 shadow-2xl">
        <CardHeader className="border-b border-black/5 dark:border-white/5">
          <CardTitle className="text-xl font-bold uppercase tracking-tighter">Initialize Governance Proposal</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[8px] mt-1">On-chain consensus protocol generation</CardDescription>
        </CardHeader>
        <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Select Asset</label>
              <select 
                className="w-full bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-sm font-mono text-foreground outline-none focus:border-primary-500"
                value={formData.project_id}
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.location?.city})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Proposal Title</label>
              <Input 
                placeholder="e.g. Asset Liquidation Offer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Description & Rationale</label>
              <textarea 
                className="w-full bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 text-sm text-foreground focus:border-primary-500 outline-none min-h-[100px]"
                placeholder="Detailed explanation of the decision required..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Voting Options</label>
                <Button type="button" variant="ghost" size="sm" className="text-[8px]" onClick={addOption}>+ ADD OPTION</Button>
              </div>
              {formData.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    placeholder={`Option ${i+1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                  />
                  <Button type="button" variant="ghost" className="px-2" onClick={() => removeOption(i)}><Trash size={14}/></Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Voting Deadline</label>
              <Input 
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 uppercase tracking-widest text-[10px]">Publish Proposal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceModal;
