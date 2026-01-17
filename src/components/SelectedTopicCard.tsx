import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MasteryLevel, Topic } from '../models/types';
import { useData } from '../store/DataContext';
import ProgressPill from './ProgressPill';

interface SelectedTopicCardProps {
  topic: Topic;
}

export default function SelectedTopicCard({ topic }: SelectedTopicCardProps) {
  const { conceptStates, removeSelectedTopic } = useData();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const relevantStates = conceptStates.filter((state) =>
    topic.concepts.some((concept) => concept.id === state.conceptId)
  );
  const questionCount = topic.concepts.reduce(
    (sum, concept) => sum + concept.questions.length,
    0
  );
  const questionLabel = `${questionCount} question${questionCount === 1 ? '' : 's'}`;
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
    <>
      <div
        className="w-full cursor-pointer rounded-3xl border border-ink-200 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1 sm:w-[240px]"
        onClick={() => navigate(`/topic/${topic.id}`)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink-900">{topic.title}</h3>
          <ProgressPill level={dominantLevel} />
        </div>
        <p className="mt-2 text-sm text-ink-600">{topic.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-ink-500">
            {relevantStates.length} concepts tracked · {questionLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowConfirm(true);
              }}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Unselect
            </button>
            <Link
              to={`/topic/${topic.id}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-saffron-500 px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-soft">
            <h4 className="text-lg font-semibold text-ink-900">Unselect topic?</h4>
            <p className="mt-2 text-sm text-ink-600">
              This removes your attempts and resets this topic to untouched.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSelectedTopic(topic.id);
                  setShowConfirm(false);
                }}
                className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Yes, unselect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
