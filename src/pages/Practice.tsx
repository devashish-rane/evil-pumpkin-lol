import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QuestionCard } from '../components/QuestionCard';
import type { Attempt, Question } from '../models/types';
import { atRiskScore, updateConceptState } from '../scheduler';
import { useLearning } from '../store/LearningContext';
import { curiosities } from '../utils/curiosities';
import { loadTopics } from '../utils/contentLoader';

const pickQuestions = (questions: Question[], count: number): Question[] => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const Practice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get('mode') ?? 'review';
  const { topics } = loadTopics();
  const topic = topics.find((item) => item.id === id);
  const { attempts, setAttempts, conceptStates, setConceptStates, prefs, setPrefs } = useLearning();
  const [index, setIndex] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showCuriosity, setShowCuriosity] = useState<string | null>(null);

  const queue = useMemo(() => {
    if (!topic) return [];
    const now = Date.now();
    const conceptScores = topic.concepts.map((concept) => {
      const state = conceptStates.find((item) => item.conceptId === concept.id);
      return {
        concept,
        score: state ? atRiskScore(state, now) : 1,
      };
    });

    if (mode === 'boss') {
      return pickQuestions(
        conceptScores.flatMap((entry) => entry.concept.questions),
        8
      );
    }

    if (mode === 'learn') {
      // Learning is gated to the lowest-risk concept so reviews stay ahead of new content.
      const next = conceptScores.sort((a, b) => a.score - b.score)[0];
      return pickQuestions(next.concept.questions, 5);
    }

    // Default daily queue: pick top-risk concepts, then sample questions for variety.
    const dueConcepts = conceptScores
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return pickQuestions(dueConcepts.flatMap((entry) => entry.concept.questions), 6);
  }, [topic, conceptStates, mode]);

  if (!topic) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-xl font-semibold">Practice not available</h1>
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

  const current = queue[index];

  const handleAnswer = ({ correct, goodQuestion }: { correct: boolean; goodQuestion: boolean }) => {
    if (!current) return;

    const attempt: Attempt = {
      questionId: current.id,
      // Question IDs include the concept slug; extracting it keeps storage simple and debuggable.
      conceptId: current.id.split('-').slice(2).join('-'),
      correct,
      timestamp: Date.now(),
      confidence: correct ? 'medium' : 'low',
      goodQuestion,
    };

    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);

    const state = conceptStates.find((item) => item.conceptId === attempt.conceptId);
    const nextState = updateConceptState(state, attempt);
    const nextStates = state
      ? conceptStates.map((item) => (item.conceptId === attempt.conceptId ? nextState : item))
      : [...conceptStates, nextState];
    setConceptStates(nextStates);

    const nextCorrectStreak = correct ? correctStreak + 1 : 0;
    setCorrectStreak(nextCorrectStreak);

    if (nextCorrectStreak > 0 && nextCorrectStreak % 5 === 0) {
      const candidate = curiosities.find((fact) => !prefs.curiosities.includes(fact));
      if (candidate) {
        setShowCuriosity(candidate);
        setPrefs({ ...prefs, curiosities: [...prefs.curiosities, candidate] });
      }
    }
  };

  const handleNext = () => {
    if (index + 1 >= queue.length) {
      navigate('/');
      return;
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-widest text-saffron-600">
          {mode === 'boss' ? 'Boss Battle' : mode === 'learn' ? 'Learn concept' : 'Daily at-risk'}
        </div>
        <h1 className="mt-3 text-xl font-semibold text-ink">{topic.name}</h1>
        <p className="mt-2 text-sm text-ink/60">
          Revision comes first. New learning unlocks after high-risk reviews are cleared.
        </p>
      </div>

      {current ? (
        <QuestionCard question={current} onAnswer={handleAnswer} />
      ) : (
        <div className="rounded-2xl border border-dashed border-ink/10 bg-white p-6 text-sm text-ink/60">
          No questions ready. Try another topic or return tomorrow.
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/60"
          onClick={() => navigate('/')}
        >
          Exit
        </button>
        <button
          type="button"
          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          onClick={handleNext}
        >
          Next
        </button>
      </div>

      {showCuriosity && (
        <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-saffron-900">
          <div className="font-semibold">Cool Stuff (earned)</div>
          <p className="mt-2">{showCuriosity}</p>
          <button
            type="button"
            className="mt-3 rounded-full border border-saffron-200 px-4 py-1 text-xs"
            onClick={() => setShowCuriosity(null)}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};
