import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useContent } from '../store/content';
import { useAppStore } from '../store/app';
import type { MasteryLevel } from '../models/content';
import { getAtRiskQueue, masteryOrder } from '../scheduler/scheduler';

const masteryColor = (mastery: MasteryLevel) => {
  switch (mastery) {
    case 'Exposed':
      return 'bg-saffron-200 text-slateInk-800';
    case 'Fragile':
      return 'bg-saffron-100 text-slateInk-700';
    case 'Stable':
      return 'bg-mint-100 text-slateInk-700';
    case 'InterviewReady':
      return 'bg-cool-50 text-slateInk-700';
    default:
      return 'bg-saffron-50 text-slateInk-700';
  }
};

const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const { topics } = useContent();
  const { conceptStates } = useAppStore();
  const navigate = useNavigate();

  const topic = topics.find((item) => item.id === topicId);

  const atRiskQueue = useMemo(() => getAtRiskQueue(conceptStates), [conceptStates]);
  const dueReviewBlock = atRiskQueue.length > 0;

  if (!topic) {
    return (
      <AppShell>
        <p className="text-sm text-slateInk-600">Topic not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-saffron-100 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold text-slateInk-900">{topic.title}</h1>
          <p className="mt-2 text-sm text-slateInk-600">{topic.description}</p>
          {dueReviewBlock && (
            <div className="mt-4 rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-slateInk-700">
              Revision-first: clear your at-risk queue before unlocking new learning.
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {topic.concepts.map((concept) => {
            const state = conceptStates.find((item) => item.conceptId === concept.id);
            const mastery = state?.mastery ?? 'Exposed';
            const unlocked =
              concept.prerequisites.length === 0 ||
              concept.prerequisites.every((prereq) => {
                const prereqConcept = topic.concepts.find((item) => item.title === prereq);
                const prereqState = conceptStates.find((item) => item.conceptId === prereqConcept?.id);
                const prereqMastery = prereqState?.mastery ?? 'Exposed';
                return masteryOrder.indexOf(prereqMastery) >= masteryOrder.indexOf('Fragile');
              });
            const hasPrereqs = concept.prerequisites.length > 0;

            return (
              <div
                key={concept.id}
                className="rounded-2xl border border-saffron-100 bg-white p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slateInk-900">{concept.title}</h2>
                    <p className="mt-2 text-sm text-slateInk-600">{concept.summary}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${masteryColor(mastery)}`}>
                    {mastery}
                  </span>
                </div>
                {hasPrereqs && (
                  <p className="mt-3 text-xs text-slateInk-500">
                    Prerequisites: {concept.prerequisites.join(', ')}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={dueReviewBlock || !unlocked}
                    onClick={() => navigate(`/practice/${topic.id}?mode=learn&concept=${concept.id}`)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      dueReviewBlock || !unlocked
                        ? 'cursor-not-allowed bg-saffron-100 text-slateInk-400'
                        : 'bg-slateInk-900 text-white'
                    }`}
                  >
                    Learn
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/practice/${topic.id}?mode=review&concept=${concept.id}`)}
                    className="rounded-full border border-saffron-200 px-4 py-2 text-xs font-semibold text-slateInk-700"
                  >
                    Review
                  </button>
                  {!unlocked && (
                    <span className="rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-slateInk-500">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default TopicPage;
