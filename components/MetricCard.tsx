import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

export const MetricCard = ({ label, value, icon }: MetricCardProps) => (
  <div className="card card-hover flex flex-col gap-2 p-4">
    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-semibold text-charcoal-900">{value}</div>
  </div>
);
