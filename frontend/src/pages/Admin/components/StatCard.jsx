import React from 'react';
import { Card, CardDescription } from '../../../components/ui/Card';

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <CardDescription className="uppercase tracking-widest text-[10px] mb-1">{title}</CardDescription>
        <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
      </div>
    </Card>
  );
};

export default StatCard;
