import React from 'react';
import { Link } from 'react-router-dom';
import type { MasteryLevel, Topic } from '../models/types';
import { useData } from '../store/DataContext';
import ProgressPill from './ProgressPill';

interface SelectedTopicCardProps {
  topic: Topic;
}

export default function SelectedTopicCard({ topic }: SelectedTopicCardProps) {
  const { conceptStates } = useData();
  const relevantStates = conceptStates.filter((state) =>
    topic.concepts.some((concept) => concept.id === state.conceptId)
  );
  const levelCounts = relevantStates.reduce(
    (acc, state) => {
      acc[state.mastery] = (acc[state.mastery] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const dominantLevel = (Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'Exposed') as MasteryLevel;

  return (
    <div className="min-w-[260px] rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-900">{topic.title}</h3>
        <ProgressPill level={dominantLevel} />
      </div>
      <p className="mt-2 text-sm text-ink-600">{topic.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-500">
          {relevantStates.length} concepts tracked
        </span>
        <Link
          to={`/topic/${topic.id}`}
          className="rounded-full bg-saffron-500 px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
