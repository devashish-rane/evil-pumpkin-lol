import React from 'react';
import clsx from 'clsx';
import type { Topic } from '../models/types';

interface TopicCardProps {
  topic: Topic;
  selected: boolean;
  onToggle: (topicId: string) => void;
  onOpen?: (topicId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, selected, onToggle, onOpen }) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
    <div>
      <h3 className="text-lg font-semibold text-ink">{topic.name}</h3>
      <p className="mt-1 text-sm text-ink/70">{topic.description}</p>
    </div>
    <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
      <span className="rounded-full bg-saffron-50 px-3 py-1">Difficulty: Medium</span>
      <span className="rounded-full bg-slateblue-500/10 px-3 py-1 text-slateblue-600">Est. 4-5 hrs</span>
    </div>
    <div className="mt-auto flex items-center justify-between">
      <button
        type="button"
        onClick={() => onOpen?.(topic.id)}
        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
      >
        Open Topic
      </button>
      <button
        type="button"
        onClick={() => onToggle(topic.id)}
        className={clsx(
          'rounded-full px-4 py-2 text-xs font-semibold transition',
          selected
            ? 'bg-saffron-200 text-saffron-900'
            : 'border border-ink/10 bg-white text-ink/70 hover:border-saffron-200'
        )}
      >
        {selected ? 'Selected' : 'Add to My Selected'}
      </button>
    </div>
  </div>
);
