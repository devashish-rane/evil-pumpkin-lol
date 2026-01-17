import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useLearning } from '../store/LearningContext';
import { loadTopics } from '../utils/contentLoader';

const masteryStyles: Record<string, string> = {
  Exposed: 'bg-saffron-100 text-saffron-800',
  Fragile: 'bg-saffron-200 text-saffron-900',
  Stable: 'bg-tealsoft-500/15 text-tealsoft-500',
  InterviewReady: 'bg-slateblue-500/15 text-slateblue-600',
};

export const Topic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conceptStates } = useLearning();
  const { topics } = loadTopics();
  const topic = topics.find((item) => item.id === id);
  const conceptNameById = Object.fromEntries(topic?.concepts.map((concept) => [concept.id, concept.name]) ?? []);

  if (!topic) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-xl font-semibold">Topic not found</h1>
        <button
          type="button"
          className="w-fit rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          onClick={() => navigate('/')}
        >
          Back home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">{topic.name}</h1>
        <p className="mt-2 text-sm text-ink/70">{topic.description}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/practice/${topic.id}?mode=learn`)}
            className="rounded-full bg-saffron-200 px-4 py-2 text-xs font-semibold text-saffron-900"
          >
            Learn
          </button>
          <button
            type="button"
            onClick={() => navigate(`/practice/${topic.id}?mode=review`)}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          >
            Review
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {topic.concepts.map((concept) => {
          const state = conceptStates.find((item) => item.conceptId === concept.id);
          const mastery = state?.mastery ?? 'Exposed';
          const locked = concept.prereqs.some(
            (prereq) => !conceptStates.some((item) => item.conceptId === prereq && item.mastery !== 'Exposed')
          );

          return (
            <div key={concept.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{concept.name}</h3>
                  {concept.summary && <p className="mt-1 text-sm text-ink/60">{concept.summary}</p>}
                </div>
                <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', masteryStyles[mastery])}>
                  {mastery}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
                {concept.prereqs.length > 0 ? (
                  concept.prereqs.map((prereq) => (
                    <span key={prereq} className="rounded-full bg-paper px-3 py-1">
                      Prereq: {conceptNameById[prereq] ?? prereq}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-paper px-3 py-1">No prerequisites</span>
                )}
                {locked && <span className="rounded-full bg-ink/5 px-3 py-1">Locked</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
