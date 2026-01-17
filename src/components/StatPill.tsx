import React from 'react';
import clsx from 'clsx';

interface StatPillProps {
  label: string;
  value: string;
  tone?: 'warning' | 'info' | 'success';
}

const toneStyles = {
  warning: 'bg-saffron-100 text-saffron-700',
  info: 'bg-slateblue-500/10 text-slateblue-600',
  success: 'bg-tealsoft-500/10 text-tealsoft-500',
};

export const StatPill: React.FC<StatPillProps> = ({ label, value, tone = 'info' }) => (
  <div className={clsx('flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', toneStyles[tone])}>
    <span>{label}</span>
    <span className="text-ink/70">{value}</span>
  </div>
);
