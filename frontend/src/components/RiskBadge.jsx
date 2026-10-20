import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskBadge({ category, probability }) {
  const isHigher = category?.includes('Higher');
  const isIntermediate = category?.includes('Intermediate');

  const config = isHigher
    ? {
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        dot: 'bg-rose-500',
        icon: AlertOctagon,
      }
    : isIntermediate
    ? {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
      }
    : {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-500',
        icon: ShieldCheck,
      };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.bg}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{category || 'Unknown'}</span>
      {probability !== undefined && (
        <span className="opacity-75 font-mono">({(probability * 100).toFixed(1)}%)</span>
      )}
    </div>
  );
}
