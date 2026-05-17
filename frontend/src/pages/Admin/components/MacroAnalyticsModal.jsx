import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const MacroAnalyticsModal = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState({
    pincode: '',
    yoy_growth_percentage: '',
    avg_rental_yield: '',
    demand_score: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        pincode: data.pincode,
        yoy_growth_percentage: data.yoy_growth_percentage,
        avg_rental_yield: data.avg_rental_yield,
        demand_score: data.demand_score
      });
    } else {
      setFormData({
        pincode: '',
        yoy_growth_percentage: '',
        avg_rental_yield: '',
        demand_score: ''
      });
    }
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="max-w-md w-full bg-background border-border shadow-2xl">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-bold uppercase tracking-tighter">
            {data ? 'Update Analytics Node' : 'Initialize Analytics Node'}
          </CardTitle>
          <CardDescription className="uppercase tracking-widest text-[8px] mt-1">Geographical Market Data Configuration</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-foreground/40">Pincode</label>
              <Input 
                disabled={!!data}
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                required
                className="bg-foreground/5 border-border font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-foreground/40">YoY Growth (%)</label>
                <Input 
                  type="number" step="0.01"
                  placeholder="12.5"
                  value={formData.yoy_growth_percentage}
                  onChange={(e) => setFormData({...formData, yoy_growth_percentage: e.target.value})}
                  required
                  className="bg-foreground/5 border-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-foreground/40">Rental Yield (%)</label>
                <Input 
                  type="number" step="0.1"
                  placeholder="6.5"
                  value={formData.avg_rental_yield}
                  onChange={(e) => setFormData({...formData, avg_rental_yield: e.target.value})}
                  required
                  className="bg-foreground/5 border-border font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-foreground/40">Demand Score (0-100)</label>
              <Input 
                type="number"
                placeholder="85"
                value={formData.demand_score}
                onChange={(e) => setFormData({...formData, demand_score: e.target.value})}
                required
                className="bg-foreground/5 border-border font-mono"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 uppercase tracking-widest text-[10px]">
                {data ? 'Commit Update' : 'Publish Node'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MacroAnalyticsModal;
