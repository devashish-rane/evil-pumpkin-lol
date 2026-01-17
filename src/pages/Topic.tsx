import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import type { Attempt, Question } from '../models/types';
import {
  getInitialConceptState,
  getInitialQuestionState,
  updateConceptState as updateConceptStateSchedule,
  updateQuestionState as updateQuestionStateSchedule
} from '../scheduler/scheduler';
import { useData } from '../store/DataContext';

type QuestionFilter = 'all' | 'failed' | 'passed' | 'untouched' | 'hardest';

export default function Topic() {
  const { topicId } = useParams();
  const {
    topics,
    conceptStates,
    questionStates,
    attempts,
    addAttempt,
    updateConceptState,
    updateQuestionState,
    markGoodQuestion
  } = useData();
  const topic = topics.find((item) => item.id === topicId);
  const [expandedConcepts, setExpandedConcepts] = useState<Record<string, boolean>>({});
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all');

  if (!topic) {
    return <div className="text-sm text-ink-600">Topic not found.</div>;
  }

  const topicStates = conceptStates.filter((state) =>
    topic.concepts.some((concept) => concept.id === state.conceptId)
  );
  const failedCount = topicStates.filter((state) => state.wrongStreak > 0).length;
  const topicQuestionIds = topic.concepts.flatMap((concept) =>
    concept.questions.map((question) => question.id)
  );
  const topicQuestionIdSet = new Set(topicQuestionIds);
  const lastAttemptByQuestion = new Map<string, Attempt>();
  attempts.forEach((attempt) => {
    if (!topicQuestionIdSet.has(attempt.questionId)) return;
    lastAttemptByQuestion.set(attempt.questionId, attempt);
  });
  const totalQuestions = topicQuestionIds.length;
  const attemptedCount = lastAttemptByQuestion.size;
  const passedCount = Array.from(lastAttemptByQuestion.values()).filter((attempt) => attempt.correct)
    .length;
  const failedQuestionCount = Array.from(lastAttemptByQuestion.values()).filter(
    (attempt) => !attempt.correct
  ).length;
  const untouchedCount = Math.max(totalQuestions - attemptedCount, 0);

  const conceptStats = topic.concepts.map((concept) => {
    const failed = concept.questions.filter((question) => {
      const lastAttempt = lastAttemptByQuestion.get(question.id);
      return lastAttempt ? !lastAttempt.correct : false;
    }).length;
    return {
      concept,
      failedCount: failed,
      failRate: concept.questions.length > 0 ? failed / concept.questions.length : 0
    };
  });
  const hardestConcepts = conceptStats
    .filter((stat) => stat.failedCount > 0)
    .sort((a, b) => b.failRate - a.failRate || b.failedCount - a.failedCount)
    .slice(0, 3)
    .map((stat) => stat.concept);
  const conceptsToShow = questionFilter === 'hardest' ? hardestConcepts : topic.concepts;
  const statusFilter = questionFilter === 'hardest' ? 'all' : questionFilter;

  const getQuestionStatus = (questionId: string) => {
    const lastAttempt = lastAttemptByQuestion.get(questionId);
    if (!lastAttempt) return 'untouched';
    return lastAttempt.correct ? 'passed' : 'failed';
  };

  const toggleConcept = (conceptId: string) => {
    setExpandedConcepts((prev) => ({
      ...prev,
      [conceptId]: !prev[conceptId]
    }));
  };

  const isAnswerCorrect = (
    question: Question,
    selected: string,
    reasonSelected?: string
  ) => {
    if (question.type === 'TWO_STEP') {
      return (
        question.answer.split(',').map((part) => part.trim()).join('|') ===
        `${selected}|${reasonSelected ?? ''}`
      );
    }
    return question.answer.trim().toLowerCase() === selected.trim().toLowerCase();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">{topic.title}</h1>
            <p className="mt-2 text-sm text-ink-600">
              Failed revisits: {failedCount} concept{failedCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/practice?topic=${topic.id}&mode=review`}
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Review
            </Link>
            <Link
              to={`/topic/${topic.id}/notes`}
              className="rounded-full bg-saffron-500 px-4 py-2 text-sm font-semibold text-ink-900"
            >
              Notes
            </Link>
            <Link
              to={`/topic/${topic.id}/anki`}
              className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Anki
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-ink-200 px-4 py-3 text-sm font-semibold text-ink-700">
            <div className="text-xs uppercase tracking-wide text-ink-500">Questions</div>
            <div className="text-base text-ink-900">{totalQuestions}</div>
          </div>
          <div className="rounded-2xl bg-ink-200 px-4 py-3 text-sm font-semibold text-ink-700">
            <div className="text-xs uppercase tracking-wide text-ink-500">Untouched</div>
            <div className="text-base text-ink-900">{untouchedCount}</div>
          </div>
          <div className="rounded-2xl bg-amber-200/80 px-4 py-3 text-sm font-semibold text-amber-800">
            <div className="text-xs uppercase tracking-wide text-amber-700/70">Failed</div>
            <div className="text-base text-amber-900">{failedQuestionCount}</div>
          </div>
          <div className="rounded-2xl bg-teal-500/25 px-4 py-3 text-sm font-semibold text-teal-700">
            <div className="text-xs uppercase tracking-wide text-teal-700/70">Passed</div>
            <div className="text-base text-teal-700">{passedCount}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: `All (${totalQuestions})` },
              { key: 'failed', label: `Failed (${failedQuestionCount})` },
              { key: 'passed', label: `Passed (${passedCount})` },
              { key: 'untouched', label: `Untouched (${untouchedCount})` },
              { key: 'hardest', label: `Hardest (${hardestConcepts.length})` }
            ] as Array<{ key: QuestionFilter; label: string }>
          ).map((filter) => {
            const isActive = questionFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setQuestionFilter(filter.key)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {questionFilter === 'hardest' && conceptsToShow.length === 0 && (
          <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 text-sm text-ink-600 shadow-soft">
            No hardest concepts yet. Answer a few questions to surface them.
          </div>
        )}
        {conceptsToShow.map((concept) => {
          const questionsToShow = concept.questions.filter((question) => {
            if (statusFilter === 'all') return true;
            const status = getQuestionStatus(question.id);
            return status === statusFilter;
          });
          if (statusFilter !== 'all' && questionsToShow.length === 0) {
            return null;
          }
          const state = conceptStates.find((item) => item.conceptId === concept.id);
          const tone = state?.wrongStreak
            ? 'border-rose-200 bg-rose-100/70'
            : state?.correctStreak
            ? 'border-emerald-200 bg-emerald-100/60'
            : 'border-ink-200 bg-white/90';
          const isExpanded = expandedConcepts[concept.id] ?? false;

          return (
            <div
              key={concept.id}
              className={`rounded-3xl border p-5 shadow-soft ${tone}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">{concept.title}</h3>
                  <p className="mt-2 text-sm text-ink-600">{concept.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleConcept(concept.id)}
                  className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                  aria-expanded={isExpanded}
                  aria-controls={`concept-${concept.id}`}
                >
                  {isExpanded ? 'Hide questions' : 'View questions'}
                </button>
              </div>
              <div className="mt-4 text-xs text-ink-500">
                Prerequisites: {concept.prereq.length > 0 ? concept.prereq.join(', ') : 'None'}
              </div>
              {isExpanded && (
                <div
                  id={`concept-${concept.id}`}
                  className="mt-4 space-y-3 border-t border-ink-200 pt-4"
                >
                  {questionsToShow.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-ink-500">
                        <span>Question {index + 1}</span>
                        <span className="rounded-full bg-ink-100 px-2 py-1">{question.type}</span>
                      </div>
                      <QuestionCard
                        question={question}
                        onAnswer={(selected, reasonSelected) => {
                          const correct = isAnswerCorrect(question, selected, reasonSelected);
                          const attempt: Attempt = {
                            id: crypto.randomUUID(),
                            questionId: question.id,
                            timestamp: Date.now(),
                            correct,
                            selected,
                            reasonSelected
                          };
                          addAttempt(attempt);
                          const state = conceptStates.find(
                            (item) => item.conceptId === question.conceptId
                          );
                          const updatedConcept = updateConceptStateSchedule(
                            state ?? getInitialConceptState(question.conceptId),
                            correct
                          );
                          updateConceptState(updatedConcept);
                          const questionState = questionStates.find(
                            (item) => item.questionId === question.id
                          );
                          const updatedQuestion = updateQuestionStateSchedule(
                            questionState ?? getInitialQuestionState(question.id),
                            correct
                          );
                          updateQuestionState(updatedQuestion);
                        }}
                        onGoodQuestion={() => markGoodQuestion(question.conceptId)}
                        dependencyHint={
                          concept.prereq.length > 0
                            ? `Review ${concept.prereq.join(', ')}`
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
