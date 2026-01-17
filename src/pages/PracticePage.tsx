import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { QuestionCard } from '../components/QuestionCard';
import { useContent } from '../store/content';
import { useAppStore } from '../store/app';
import { computeNextReviewAt, getAtRiskQueue, pickQuestionVariant } from '../scheduler/scheduler';
import type { Concept, Question } from '../models/content';
import { curiosities } from '../data/curiosities';

const PracticePage: React.FC = () => {
  const { topicId } = useParams();
  const { topics } = useContent();
  const { conceptStates, updateConceptState, addAttempt, prefs, updatePrefs } = useAppStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const mode = params.get('mode') ?? 'at-risk';
  const conceptParam = params.get('concept');

  const topic = topics.find((item) => item.id === topicId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswer, setLastAnswer] = useState('');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [recentVariants, setRecentVariants] = useState<string[]>([]);
  const [curiosityId, setCuriosityId] = useState<string | null>(null);

  const atRiskQueue = useMemo(() => getAtRiskQueue(conceptStates), [conceptStates]);

  const conceptList = useMemo(() => {
    if (!topic) return [] as Concept[];
    if (mode === 'learn' || mode === 'review') {
      return topic.concepts.filter((concept) => concept.id === conceptParam);
    }
    if (mode === 'boss') {
      return topic.concepts.slice(0, 6);
    }
    if (mode === 'at-risk') {
      return topic.concepts.filter((concept) =>
        atRiskQueue.some((state) => state.conceptId === concept.id)
      );
    }
    return topic.concepts;
  }, [topic, mode, conceptParam, atRiskQueue]);

  const queue = useMemo(() => {
    const questions = conceptList.flatMap((concept) => concept.questions.map((question) => ({ concept, question })));
    return questions.slice(0, mode === 'boss' ? 12 : 6);
  }, [conceptList, mode]);

  const activeConcept = currentQuestion
    ? queue.find((item) => item.question.id === currentQuestion.id)?.concept
    : undefined;

  const learnConcept = mode === 'learn' ? conceptList[0] : undefined;

  React.useEffect(() => {
    if (queue.length > 0 && !currentQuestion) {
      const { question, group } = pickQuestionVariant(
        queue.map((item) => item.question),
        recentVariants
      );
      setCurrentQuestion(question);
      setRecentVariants((prev) => [...prev, group].slice(-4));
    }
  }, [queue, currentQuestion, recentVariants]);

  if (!topic) {
    return (
      <AppShell>
        <p className="text-sm text-slateInk-600">Topic not found.</p>
      </AppShell>
    );
  }

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    const correct =
      currentQuestion.type === 'TWO_STEP'
        ? answer === currentQuestion.answer || answer === currentQuestion.reasonAnswer
        : answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();

    setLastAnswer(answer);
    setShowExplanation(true);
    setLastCorrect(correct);

    const conceptId = queue.find((item) => item.question.id === currentQuestion.id)?.concept.id;
    if (!conceptId) return;
    const existingState = conceptStates.find((state) => state.conceptId === conceptId);
    const now = Date.now();
    const computed = computeNextReviewAt(
      existingState ?? {
        conceptId,
        mastery: 'Exposed',
        nextReviewAt: now,
        failureCount: 0,
        successCount: 0,
        goodQuestionSignals: 0,
      },
      now,
      correct
    );

    updateConceptState({
      conceptId,
      mastery: computed.mastery,
      nextReviewAt: computed.nextReviewAt,
      failureCount: (existingState?.failureCount ?? 0) + (correct ? 0 : 1),
      successCount: (existingState?.successCount ?? 0) + (correct ? 1 : 0),
      goodQuestionSignals: existingState?.goodQuestionSignals ?? 0,
      lastReviewedAt: now,
    });

    addAttempt({
      id: crypto.randomUUID(),
      questionId: currentQuestion.id,
      conceptId,
      correct,
      timestamp: now,
      response: answer,
    });

    if (correct) {
      const nextCount = correctCount + 1;
      setCorrectCount(nextCount);
      if (nextCount % 5 === 0) {
        const nextCuriosity = curiosities.find(
          (item) => !prefs.curiositiesViewed.includes(item.id)
        );
        if (nextCuriosity) {
          setCuriosityId(nextCuriosity.id);
        }
      }
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    setLastAnswer('');
    setLastCorrect(null);
    const remaining = queue.filter((item) => item.question.id !== currentQuestion?.id);
    if (remaining.length === 0) {
      setCurrentQuestion(null);
      return;
    }
    const { question, group } = pickQuestionVariant(
      remaining.map((item) => item.question),
      recentVariants
    );
    setCurrentQuestion(question);
    setRecentVariants((prev) => [...prev, group].slice(-4));
  };

  const handleGoodQuestion = () => {
    if (!currentQuestion) return;
    const conceptId = queue.find((item) => item.question.id === currentQuestion.id)?.concept.id ?? '';
    const existing = conceptStates.find((state) => state.conceptId === conceptId);
    if (existing) {
      updateConceptState({ ...existing, goodQuestionSignals: existing.goodQuestionSignals + 1 });
    } else {
      updateConceptState({
        conceptId,
        mastery: 'Exposed',
        nextReviewAt: Date.now(),
        failureCount: 0,
        successCount: 0,
        goodQuestionSignals: 1,
      });
    }
  };

  const closeCuriosity = () => {
    if (!curiosityId) return;
    updatePrefs({ curiositiesViewed: [...prefs.curiositiesViewed, curiosityId] });
    setCuriosityId(null);
  };

  const activeCuriosity = curiosities.find((item) => item.id === curiosityId);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-saffron-100 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slateInk-500">Practice</p>
              <h1 className="mt-1 text-2xl font-semibold text-slateInk-900">{topic.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(`/practice/${topic.id}?mode=at-risk`)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  mode === 'at-risk' ? 'bg-saffron-200 text-slateInk-800' : 'border border-saffron-200 text-slateInk-700'
                }`}
              >
                At-risk queue
              </button>
              <button
                type="button"
                onClick={() => navigate(`/practice/${topic.id}?mode=boss`)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  mode === 'boss' ? 'bg-cool-50 text-slateInk-800' : 'border border-saffron-200 text-slateInk-700'
                }`}
              >
                Boss battle
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slateInk-600">
            {mode === 'boss'
              ? 'Timed mixed recall with fresh variants.'
              : 'Daily queue based on forgetting risk.'}
          </p>
        </div>

        {learnConcept && (
          <div className="rounded-2xl border border-saffron-100 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">Learn concept</p>
            <h2 className="mt-2 text-lg font-semibold text-slateInk-900">{learnConcept.title}</h2>
            <p className="mt-2 text-sm text-slateInk-600">{learnConcept.summary}</p>
          </div>
        )}

        {currentQuestion ? (
          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              onGoodQuestion={handleGoodQuestion}
              showExplanation={showExplanation}
              lastAnswer={lastAnswer}
            />
            {showExplanation && lastCorrect === false && (
              <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-slateInk-700">
                <p className="font-semibold text-slateInk-800">Why you failed</p>
                <p className="mt-2">
                  {currentQuestion.misconception ??
                    'This concept is fragile because the intuition usually conflicts with the correct model.'}
                </p>
                {activeConcept?.prerequisites.length ? (
                  <p className="mt-2 text-xs text-slateInk-500">
                    Dependency hint: revisit {activeConcept.prerequisites.join(', ')} to tighten the chain.
                  </p>
                ) : null}
              </div>
            )}
            {showExplanation && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Next question
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/topic/${topic.id}`)}
                  className="rounded-full border border-saffron-200 px-4 py-2 text-xs font-semibold text-slateInk-700"
                >
                  Back to topic
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-saffron-100 bg-white p-6 text-sm text-slateInk-600 shadow-soft">
            No questions are due. Take a break or explore another topic.
          </div>
        )}

        {activeCuriosity && (
          <div className="rounded-2xl border border-cool-200 bg-cool-50 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">Culture break</p>
            <p className="mt-2 text-sm text-slateInk-800">{activeCuriosity.text}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={closeCuriosity}
                className="rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Save to Cool Stuff
              </button>
              <button
                type="button"
                onClick={() => setCuriosityId(null)}
                className="rounded-full border border-cool-200 px-4 py-2 text-xs font-semibold text-slateInk-700"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default PracticePage;
