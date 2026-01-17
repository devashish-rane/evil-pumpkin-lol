import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, helper }) => (
  <div className="rounded-2xl border border-saffron-100 bg-white p-4 shadow-soft">
    <p className="text-xs uppercase tracking-wide text-slateInk-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slateInk-900">{value}</p>
    {helper && <p className="mt-1 text-xs text-slateInk-500">{helper}</p>}
  </div>
);
