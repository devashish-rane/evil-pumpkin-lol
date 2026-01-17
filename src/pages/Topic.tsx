import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ProgressPill from '../components/ProgressPill';
import { useData } from '../store/DataContext';

const masteryTone: Record<string, string> = {
  Exposed: 'border-saffron-200 bg-saffron-50',
  Fragile: 'border-amber-200 bg-amber-50',
  Stable: 'border-emerald-200 bg-emerald-50',
  InterviewReady: 'border-sky-200 bg-sky-50'
};

export default function Topic() {
  const { topicId } = useParams();
  const { topics, conceptStates, atRiskCount } = useData();
  const topic = topics.find((item) => item.id === topicId);

  if (!topic) {
    return <div className="text-sm text-ink-600">Topic not found.</div>;
  }

  const hasDueReviews = atRiskCount > 0;

  const isPrereqCleared = (prereqTitle: string) => {
    const prereqConcept = topic.concepts.find((item) => item.title === prereqTitle);
    if (!prereqConcept) return false;
    const prereqState = conceptStates.find((state) => state.conceptId === prereqConcept.id);
    return prereqState ? ['Stable', 'InterviewReady'].includes(prereqState.mastery) : false;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">{topic.title}</h1>
            <p className="mt-2 text-sm text-ink-600">{topic.description}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/practice?topic=${topic.id}&mode=review`}
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Review
            </Link>
            <Link
              to={`/practice?topic=${topic.id}&mode=learn`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                hasDueReviews
                  ? 'pointer-events-none border border-ink-200 text-ink-400'
                  : 'bg-saffron-500 text-ink-900'
              }`}
            >
              Learn
            </Link>
          </div>
        </div>
        {hasDueReviews && (
          <p className="mt-4 text-sm text-rose-600">
            New learning is gated until due reviews are cleared. Focus on today’s at-risk queue.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {topic.concepts.map((concept) => {
          const state = conceptStates.find((item) => item.conceptId === concept.id);
          const isLocked =
            concept.prereq.length > 0 && !concept.prereq.every((prereq) => isPrereqCleared(prereq));

          return (
            <div
              key={concept.id}
              className={`rounded-3xl border p-5 shadow-soft ${
                masteryTone[state?.mastery ?? 'Exposed']
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">{concept.title}</h3>
                  <p className="mt-2 text-sm text-ink-600">{concept.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  {state && <ProgressPill level={state.mastery} />}
                  {isLocked && (
                    <span className="rounded-full bg-ink-200 px-3 py-1 text-xs font-semibold text-ink-600">
                      Locked
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 text-xs text-ink-500">
                Prerequisites: {concept.prereq.length > 0 ? concept.prereq.join(', ') : 'None'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
