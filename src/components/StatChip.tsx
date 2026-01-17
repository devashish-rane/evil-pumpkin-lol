import React from 'react';

interface StatChipProps {
  label: string;
  value: string;
  tone?: 'warning' | 'neutral' | 'accent';
}

const toneClasses = {
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-ink-100 text-ink-700',
  accent: 'bg-teal-500/15 text-teal-600'
};

export default function StatChip({ label, value, tone = 'neutral' }: StatChipProps) {
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-base text-ink-900">{value}</div>
    </div>
  );
}
