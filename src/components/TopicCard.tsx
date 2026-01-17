import React from 'react';
import type { Topic } from '../models/content';

interface TopicCardProps {
  topic: Topic;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  variant?: 'compact' | 'full';
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  selected,
  onToggleSelect,
  onOpen,
  variant = 'full',
}) => {
  return (
    <div className="rounded-2xl border border-saffron-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slateInk-900">{topic.title}</h3>
          {variant === 'full' && (
            <p className="mt-1 text-sm text-slateInk-600">{topic.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleSelect}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            selected
              ? 'bg-saffron-200 text-slateInk-800'
              : 'border border-saffron-200 text-slateInk-600'
          }`}
        >
          {selected ? 'Pinned' : 'Add to My Selected'}
        </button>
      </div>
      {variant === 'full' ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slateInk-600">
          <span className="rounded-full bg-saffron-50 px-2 py-1">Intermediate</span>
          <span className="rounded-full bg-cool-50 px-2 py-1">35 mins / week</span>
          <button
            type="button"
            onClick={onOpen}
            className="ml-auto rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Open
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-slateInk-600">
            64% mature
          </span>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
