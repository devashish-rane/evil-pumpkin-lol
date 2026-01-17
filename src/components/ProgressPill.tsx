import React from 'react';
import type { MasteryLevel } from '../models/types';

const colorMap: Record<MasteryLevel, string> = {
  Exposed: 'bg-saffron-100 text-saffron-700',
  Fragile: 'bg-amber-100 text-amber-700',
  Stable: 'bg-emerald-100 text-emerald-700',
  InterviewReady: 'bg-sky-100 text-sky-700'
};

export default function ProgressPill({ level }: { level: MasteryLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        colorMap[level]
      }`}
    >
      {level}
    </span>
  );
}
