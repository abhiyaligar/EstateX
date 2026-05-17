import React from 'react';

export const AdminTable = ({ children }) => (
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    <table className="w-full text-left border-collapse min-w-[800px]">
      {children}
    </table>
  </div>
);

export const AdminTableHeader = ({ columns }) => (
  <thead>
    <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.04] dark:bg-white/[0.02]">
      {columns.map((col, idx) => (
        <th 
          key={idx} 
          className={`px-4 py-6 md:px-6 md:py-8 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 dark:text-white/30 ${col.align === 'right' ? 'text-right' : ''}`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  </thead>
);

export const AdminTableRow = ({ children, onClick }) => (
  <tr 
    onClick={onClick}
    className={`border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:bg-white/[0.01] transition-colors ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </tr>
);

export const AdminTableCell = ({ children, align = 'left', className = '' }) => (
  <td className={`px-4 py-6 md:px-6 md:py-8 ${align === 'right' ? 'text-right' : ''} ${className}`}>
    {children}
  </td>
);

export const AdminStatusBadge = ({ children, type = 'default' }) => {
  const styles = {
    default: 'bg-black/5 dark:bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 border-black/10 dark:border-white/10',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    royal: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  return (
    <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest border ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
};
