import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import type { Attempt, Question } from '../models/types';
import { getInitialConceptState, pickQuestionVariant, updateConceptState as updateState } from '../scheduler/scheduler';
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
    attempts,
    addAttempt,
    updateConceptState,
    markGoodQuestion,
    addCuriosity
  } = useData();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') ?? 'daily';
  const topicId = searchParams.get('topic');
  const [index, setIndex] = useState(0);
  const [showCuriosity, setShowCuriosity] = useState(false);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const relevantTopics = useMemo(() => {
    if (topicId) {
      return topics.filter((topic) => topic.id === topicId);
    }
    return topics;
  }, [topicId, topics]);

  const questionQueue = useMemo(() => {
    const questions: Question[] = [];
    const history = attempts.map((attempt) => attempt.questionId);

    relevantTopics.forEach((topic) => {
      topic.concepts.forEach((concept) => {
        const state = conceptStates.find((item) => item.conceptId === concept.id);
        const due = state ? state.nextReviewAt <= Date.now() : true;
        // Boss battle and learn modes intentionally ignore due-ness to mix content.
        if (mode === 'boss' || mode === 'learn' || mode === 'review' || due) {
          const question = pickQuestionVariant(concept.questions, history);
          questions.push(question);
        }
      });
    });

    return questions;
  }, [attempts, conceptStates, mode, relevantTopics]);

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
        : currentQuestion.type === 'ORDER'
          ? currentQuestion.answer.split(',').map((part) => part.trim()).join(',') ===
            selected.replace(/\s+/g, '').replace(/;/g, ',')
          : currentQuestion.type === 'FILL'
            ? currentQuestion.answer.trim().toLowerCase() === selected.trim().toLowerCase()
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
    const state = conceptStates.find((item) => item.conceptId === currentQuestion.conceptId);
    const updated = updateState(state ?? getInitialConceptState(currentQuestion.conceptId), attempt.correct);
    updateConceptState(updated);

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
    setIndex((prev) => Math.min(prev + 1, questionQueue.length - 1));
  };

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-ink-100 bg-white p-6 text-center shadow-soft">
        <h1 className="text-lg font-semibold text-ink-900">No questions due.</h1>
        <p className="mt-2 text-sm text-ink-600">
          You cleared the queue. Come back later for your next review window.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
        <div className="text-xs uppercase tracking-wide text-ink-500">
          {mode === 'boss'
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
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
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
          Next
        </button>
      </div>

      {showCuriosity && (
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
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
