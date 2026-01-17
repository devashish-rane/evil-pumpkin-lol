import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SelectedTopicCard from '../components/SelectedTopicCard';
import StatChip from '../components/StatChip';
import TopicCard from '../components/TopicCard';
import type { Attempt } from '../models/types';
import { useData } from '../store/DataContext';

export default function Home() {
  const { topics, prefs, attempts, parseErrors, toggleSelectedTopic } = useData();
  const navigate = useNavigate();
  const selectedTopics = topics.filter((topic) =>
    prefs.selectedTopicIds.includes(topic.id)
  );
  const totalQuestions = selectedTopics.reduce(
    (sum, topic) =>
      sum + topic.concepts.reduce((conceptSum, concept) => conceptSum + concept.questions.length, 0),
    0
  );
  const selectedQuestionIds = selectedTopics.flatMap((topic) =>
    topic.concepts.flatMap((concept) => concept.questions.map((question) => question.id))
  );
  const selectedQuestionIdSet = new Set(selectedQuestionIds);
  const lastAttemptByQuestion = new Map<string, Attempt>();
  attempts.forEach((attempt) => {
    if (!selectedQuestionIdSet.has(attempt.questionId)) return;
    lastAttemptByQuestion.set(attempt.questionId, attempt);
  });
  const attemptedCount = lastAttemptByQuestion.size;
  const passedCount = Array.from(lastAttemptByQuestion.values()).filter((attempt) => attempt.correct)
    .length;
  const failedCount = Array.from(lastAttemptByQuestion.values()).filter((attempt) => !attempt.correct)
    .length;
  const untouchedCount = Math.max(totalQuestions - attemptedCount, 0);
  const passedPct = totalQuestions > 0 ? Math.round((passedCount / totalQuestions) * 100) : 0;
  const failedPct = totalQuestions > 0 ? Math.round((failedCount / totalQuestions) * 100) : 0;
  const untouchedPct = totalQuestions > 0 ? Math.round((untouchedCount / totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/practice?scope=selected&status=all"
          className="block transition hover:-translate-y-0.5"
        >
          <StatChip
            label="Total questions selected"
            value={`${totalQuestions}`}
            tone="info"
          />
        </Link>
        <Link
          to="/practice?scope=selected&status=untouched"
          className="block transition hover:-translate-y-0.5"
        >
          <StatChip
            label="Untouched"
            value={`${untouchedPct}% (${untouchedCount})`}
            tone="neutral"
          />
        </Link>
        <Link
          to="/practice?scope=selected&status=failed"
          className="block transition hover:-translate-y-0.5"
        >
          <StatChip
            label="Failed"
            value={`${failedPct}% (${failedCount})`}
            tone="warning"
          />
        </Link>
        <Link
          to="/practice?scope=selected&status=passed"
          className="block transition hover:-translate-y-0.5"
        >
          <StatChip
            label="Passed"
            value={`${passedPct}% (${passedCount})`}
            tone="accent"
          />
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">My Selected</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {selectedTopics.length === 0 && (
            <div className="flex w-full flex-col gap-4 rounded-3xl border border-dashed border-ink-200 bg-white/80 p-6 text-sm text-ink-600">
              <div className="text-base font-semibold text-ink-900">
                Start with a default topic
              </div>
              <p className="text-sm text-ink-600">
                Pick your first topic to unlock concepts and questions. We can drop you into
                Redis as a quick onboarding path.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const defaultTopic = topics.find((topic) => topic.id === 'redis') ?? topics[0];
                    if (!defaultTopic) return;
                    if (!prefs.selectedTopicIds.includes(defaultTopic.id)) {
                      toggleSelectedTopic(defaultTopic.id);
                    }
                    navigate(`/topic/${defaultTopic.id}`);
                  }}
                  className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  Start with Redis
                </button>
                <Link
                  to="#all-topics"
                  className="rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                >
                  Browse topics
                </Link>
              </div>
            </div>
          )}
          {selectedTopics.map((topic) => (
            <SelectedTopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 id="all-topics" className="text-lg font-semibold text-ink-900">
          All Topics
        </h2>
        {parseErrors.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            <div className="font-semibold">Content parsing issues</div>
            <ul className="mt-2 list-disc pl-5">
              {parseErrors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
