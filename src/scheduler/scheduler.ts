import type { ConceptState, MasteryLevel, Question, QuestionState } from '../models/types';

// Ordering is explicit so the algorithm never depends on enum string comparisons.
const masteryOrder: MasteryLevel[] = [
  'Exposed',
  'Fragile',
  'Stable',
  'InterviewReady'
];

// MVP intervals in milliseconds. These are intentionally conservative to
// surface forgetting risk quickly without pretending to be a full SM-2 clone.
const reviewIntervals: Record<MasteryLevel, number> = {
  Exposed: 1000 * 60 * 60 * 24 * 1,
  Fragile: 1000 * 60 * 60 * 24 * 2,
  Stable: 1000 * 60 * 60 * 24 * 5,
  InterviewReady: 1000 * 60 * 60 * 24 * 10
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function getInitialConceptState(conceptId: string): ConceptState {
  return {
    conceptId,
    mastery: 'Exposed',
    nextReviewAt: Date.now(),
    correctStreak: 0,
    wrongStreak: 0,
    goodQuestionSignal: 0
  };
}

export function getInitialQuestionState(questionId: string): QuestionState {
  return {
    questionId,
    nextReviewAt: Date.now(),
    intervalDays: 1,
    easeFactor: 2.3,
    correctStreak: 0,
    wrongStreak: 0
  };
}

export function updateConceptState(
  state: ConceptState,
  correct: boolean
): ConceptState {
  const newMasteryIndex = correct
    ? Math.min(masteryOrder.length - 1, masteryOrder.indexOf(state.mastery) + 1)
    : Math.max(0, masteryOrder.indexOf(state.mastery) - 1);
  const mastery = masteryOrder[newMasteryIndex];
  const now = Date.now();
  const wrongStreak = correct ? 0 : state.wrongStreak + 1;
  const correctStreak = correct ? state.correctStreak + 1 : 0;
  const penalty = wrongStreak > 0 ? wrongStreak * 0.2 : 0;
  const signalBoost = state.goodQuestionSignal * 0.05;
  // Guard against negative/too-small intervals if wrong streaks are high.
  const interval = reviewIntervals[mastery] * (1 - penalty + signalBoost);

  return {
    ...state,
    mastery,
    correctStreak,
    wrongStreak,
    lastAttemptAt: now,
    nextReviewAt: now + Math.max(interval, 1000 * 60 * 30)
  };
}

export function updateQuestionState(
  state: QuestionState,
  correct: boolean
): QuestionState {
  const now = Date.now();
  const wrongStreak = correct ? 0 : state.wrongStreak + 1;
  const correctStreak = correct ? state.correctStreak + 1 : 0;
  const easeFactor = correct
    ? Math.min(2.8, state.easeFactor + 0.1)
    : Math.max(1.3, state.easeFactor - 0.2);
  const intervalDays = correct
    ? Math.max(1, state.intervalDays * easeFactor)
    : Math.max(0.5, state.intervalDays * 0.5);

  return {
    ...state,
    easeFactor,
    intervalDays,
    correctStreak,
    wrongStreak,
    lastAttemptAt: now,
    nextReviewAt: now + intervalDays * DAY_MS
  };
}

export function computeAtRiskQueue<T extends { nextReviewAt: number }>(
  states: T[],
  now = Date.now()
): T[] {
  return states
    .filter((state) => state.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

export function pickQuestionVariant(
  questions: Question[],
  history: string[]
): Question {
  const sorted = [...questions].sort((a, b) => {
    const aSeen = history.includes(a.id) ? 1 : 0;
    const bSeen = history.includes(b.id) ? 1 : 0;
    return aSeen - bSeen;
  });
  const grouped = new Map<string, Question[]>();
  for (const question of sorted) {
    const key = question.variantGroup ?? question.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(question);
  }
  const groupEntries = Array.from(grouped.values());
  const pickGroup = groupEntries.find((group) =>
    group.some((q) => !history.includes(q.id))
  );
  const candidates = pickGroup ?? questions;
  const unseen = candidates.filter((q) => !history.includes(q.id));
  return unseen[Math.floor(Math.random() * unseen.length)] ?? candidates[0];
}
