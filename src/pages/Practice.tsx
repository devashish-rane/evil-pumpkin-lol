import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import type { Attempt, Question } from '../models/types';
import {
  getInitialConceptState,
  getInitialQuestionState,
  updateConceptState as updateConceptStateSchedule,
  updateQuestionState as updateQuestionStateSchedule
} from '../scheduler/scheduler';
import { useData } from '../store/DataContext';

const curiosityFacts = [
  'The spacing effect was documented in 1885—your brain has loved intervals for over a century.',
  'Recalling a memory reshapes it; every review is a tiny rewrite.',
  'Forgetting is a feature, not a bug—it highlights what needs deliberate effort.'
];

export default function Practice() {
  const {
    topics,
    conceptStates,
    questionStates,
    attempts,
    prefs,
    addAttempt,
    updateConceptState,
    updateQuestionState,
    markGoodQuestion,
    addCuriosity
  } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') ?? 'daily';
  const topicId = searchParams.get('topic');
  const conceptId = searchParams.get('concept');
  const scope = searchParams.get('scope') ?? 'all';
  const status = searchParams.get('status') ?? 'due';
  const [index, setIndex] = useState(0);
  const [showCuriosity, setShowCuriosity] = useState(false);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const relevantTopics = useMemo(() => {
    if (topicId) {
      return topics.filter((topic) => topic.id === topicId);
    }
    if (scope === 'selected') {
      return topics.filter((topic) => prefs.selectedTopicIds.includes(topic.id));
    }
    return topics;
  }, [prefs.selectedTopicIds, scope, topicId, topics]);

  const questionQueue = useMemo(() => {
    const questions: Question[] = [];
    const history = attempts.map((attempt) => attempt.questionId);
    const lastAttemptByQuestion = new Map<string, Attempt>();
    attempts.forEach((attempt) => {
      const existing = lastAttemptByQuestion.get(attempt.questionId);
      if (!existing || attempt.timestamp > existing.timestamp) {
        lastAttemptByQuestion.set(attempt.questionId, attempt);
      }
    });
    const questionStateById = new Map(
      questionStates.map((state) => [state.questionId, state])
    );

    relevantTopics.forEach((topic) => {
      topic.concepts.forEach((concept) => {
        if (conceptId && concept.id !== conceptId) {
          return;
        }
        const dueQuestions = concept.questions.filter((question) => {
          const state = questionStateById.get(question.id);
          return state ? state.nextReviewAt <= Date.now() : true;
        });
        if (status !== 'due') {
          const filtered = concept.questions.filter((question) => {
            const lastAttempt = lastAttemptByQuestion.get(question.id);
            if (status === 'failed') return lastAttempt ? !lastAttempt.correct : false;
            if (status === 'passed') return lastAttempt ? lastAttempt.correct : false;
            if (status === 'untouched') return !lastAttempt;
            return true;
          });
          const unseen = filtered.filter((question) => !history.includes(question.id));
          const seen = filtered.filter((question) => history.includes(question.id));
          questions.push(...unseen, ...seen);
          return;
        }
        if (mode === 'review') {
          const failedQuestions = concept.questions.filter((question) => {
            const lastAttempt = lastAttemptByQuestion.get(question.id);
            return lastAttempt ? !lastAttempt.correct : false;
          });
          questions.push(...failedQuestions);
          return;
        }
        if (mode === 'boss' || mode === 'learn') {
          const unseen = concept.questions.filter((question) => !history.includes(question.id));
          const seen = concept.questions.filter((question) => history.includes(question.id));
          questions.push(...unseen, ...seen);
          return;
        }
        const unseen = dueQuestions.filter((question) => !history.includes(question.id));
        const seen = dueQuestions.filter((question) => history.includes(question.id));
        questions.push(...unseen, ...seen);
      });
    });

    return questions;
  }, [attempts, conceptId, mode, questionStates, relevantTopics, status]);

  const currentQuestion = questionQueue[index];
  const currentConcept = useMemo(() => {
    if (!currentQuestion) return null;
    return relevantTopics
      .flatMap((topic) => topic.concepts)
      .find((concept) => concept.id === currentQuestion.conceptId);
  }, [currentQuestion, relevantTopics]);

  const handleAnswer = (selected: string, reasonSelected?: string) => {
    if (!currentQuestion) return;
    const isCorrect =
      currentQuestion.type === 'TWO_STEP'
        ? currentQuestion.answer.split(',').map((part) => part.trim()).join('|') ===
          `${selected}|${reasonSelected ?? ''}`
        : currentQuestion.answer.trim().toLowerCase() === selected.trim().toLowerCase();
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      questionId: currentQuestion.id,
      timestamp: Date.now(),
      correct: isCorrect,
      selected,
      reasonSelected
    };
    addAttempt(attempt);
    const conceptState = conceptStates.find(
      (item) => item.conceptId === currentQuestion.conceptId
    );
    const updatedConcept = updateConceptStateSchedule(
      conceptState ?? getInitialConceptState(currentQuestion.conceptId),
      attempt.correct
    );
    updateConceptState(updatedConcept);
    const questionState = questionStates.find(
      (item) => item.questionId === currentQuestion.id
    );
    const updatedQuestion = updateQuestionStateSchedule(
      questionState ?? getInitialQuestionState(currentQuestion.id),
      attempt.correct
    );
    updateQuestionState(updatedQuestion);

    if (isCorrect) {
      const nextSuccessCount = successCount + 1;
      setSuccessCount(nextSuccessCount);
      if (nextSuccessCount % 5 === 0) {
        const nextIndex = curiosityIndex % curiosityFacts.length;
        addCuriosity(curiosityFacts[nextIndex]);
        setCuriosityIndex((prev) => (prev + 1) % curiosityFacts.length);
        setShowCuriosity(true);
      }
    }

    if (index + 1 === questionQueue.length && !showCuriosity) {
      const nextIndex = curiosityIndex % curiosityFacts.length;
      addCuriosity(curiosityFacts[nextIndex]);
      setCuriosityIndex((prev) => (prev + 1) % curiosityFacts.length);
      setShowCuriosity(true);
    }
  };

  const handleNext = () => {
    setShowCuriosity(false);
    if (index + 1 >= questionQueue.length) {
      navigate(topicId ? `/topic/${topicId}` : '/topics');
      return;
    }
    setIndex((prev) => Math.min(prev + 1, questionQueue.length - 1));
  };

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-200 bg-white/90 p-6 text-center shadow-soft">
        <h1 className="text-lg font-semibold text-ink-900">No questions due.</h1>
        <p className="mt-2 text-sm text-ink-600">
          You cleared the queue. Come back later for your next review window.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-ink-200 bg-white/90 p-5 shadow-soft">
        <div className="text-xs uppercase tracking-wide text-ink-500">
          {status === 'failed'
            ? 'Failed questions'
            : status === 'passed'
              ? 'Passed questions'
              : status === 'untouched'
                ? 'Untouched questions'
                : status === 'all'
                  ? 'All selected questions'
                  : mode === 'boss'
                    ? 'Weekly Boss Battle'
                    : mode === 'learn'
                      ? 'Learn Concept'
                      : 'Daily At-risk Queue'}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-ink-600">
          <span>
            Question {index + 1} of {questionQueue.length}
          </span>
          <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
            5-7 min
          </span>
        </div>
      </div>

      {mode === 'learn' && currentConcept && (
        <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-soft">
          <div className="text-xs uppercase tracking-wide text-ink-500">Concept summary</div>
          <h2 className="mt-2 text-lg font-semibold text-ink-900">{currentConcept.title}</h2>
          <p className="mt-2 text-sm text-ink-700">{currentConcept.summary}</p>
          <div className="mt-4 text-xs text-ink-500">
            Prerequisites:{' '}
            {currentConcept.prereq.length > 0 ? currentConcept.prereq.join(', ') : 'None'}
          </div>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        onGoodQuestion={() => markGoodQuestion(currentQuestion.conceptId)}
        dependencyHint={
          currentConcept?.prereq.length
            ? `Review ${currentConcept.prereq.join(', ')}`
            : undefined
        }
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="rounded-full bg-saffron-500 px-5 py-2 text-sm font-semibold text-ink-900"
        >
          {index + 1 === questionQueue.length ? 'Finish' : 'Next'}
        </button>
      </div>

      {showCuriosity && (
        <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-soft">
          <div className="text-xs uppercase tracking-wide text-ink-500">Culture break</div>
          <p className="mt-2 text-sm text-ink-700">{curiosityFacts[curiosityIndex]}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCuriosity(false)}
              className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-600"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
