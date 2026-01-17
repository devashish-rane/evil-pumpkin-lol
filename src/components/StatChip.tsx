import React from 'react';

interface StatChipProps {
  label: string;
  value: string;
  tone?: 'warning' | 'neutral' | 'accent' | 'info';
}

const toneClasses = {
  warning: 'bg-amber-200/70 text-amber-800',
  neutral: 'bg-ink-200 text-ink-700',
  accent: 'bg-teal-500/25 text-teal-700',
  info: 'bg-saffron-100 text-saffron-700'
};

export default function StatChip({ label, value, tone = 'neutral' }: StatChipProps) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/70 px-4 py-3 text-sm font-semibold shadow-soft ${toneClasses[tone]}`}
    >
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-base text-ink-900">{value}</div>
    </div>
  );
}
