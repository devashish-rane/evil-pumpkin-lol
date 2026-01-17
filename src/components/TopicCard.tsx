import React from 'react';
import type { Topic } from '../models/types';
import { useData } from '../store/DataContext';

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const { prefs, toggleSelectedTopic } = useData();
  const isSelected = prefs.selectedTopicIds.includes(topic.id);
  const questionCount = topic.concepts.reduce(
    (sum, concept) => sum + concept.questions.length,
    0
  );
  const questionLabel = `${questionCount} question${questionCount === 1 ? '' : 's'}`;

  return (
    <div className="rounded-3xl border border-ink-200 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink-900">{topic.title}</h3>
        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
          ~{topic.concepts.length * 6} min
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-600">{topic.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-500">
          Difficulty: Intermediate · {questionLabel}
        </span>
        <button
          type="button"
          onClick={() => {
            if (!isSelected) {
              toggleSelectedTopic(topic.id);
            }
          }}
          disabled={isSelected}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            isSelected
              ? 'cursor-not-allowed bg-ink-200 text-ink-500'
              : 'border border-ink-200 text-ink-700 hover:bg-ink-50'
          }`}
        >
          {isSelected ? 'Added' : 'Add to My Selected'}
        </button>
      </div>
    </div>
  );
}
