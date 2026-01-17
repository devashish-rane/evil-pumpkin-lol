import type { ConceptState } from '../models/user';
import type { Question } from '../models/content';

// Simple production-friendly scheduler for MVP.
// It keeps logic deterministic and debuggable, while reserving hooks for tuning later.

export const masteryOrder = ['Exposed', 'Fragile', 'Stable', 'InterviewReady'] as const;

const BASE_INTERVALS: Record<string, number> = {
  Exposed: 1000 * 60 * 60 * 6,
  Fragile: 1000 * 60 * 60 * 24,
  Stable: 1000 * 60 * 60 * 24 * 4,
  InterviewReady: 1000 * 60 * 60 * 24 * 12,
};

export const computeNextReviewAt = (
  state: ConceptState,
  now = Date.now(),
  wasCorrect = true
) => {
  const masteryIndex = masteryOrder.indexOf(state.mastery);
  const nextMastery = wasCorrect
    ? masteryOrder[Math.min(masteryIndex + 1, masteryOrder.length - 1)]
    : masteryOrder[Math.max(masteryIndex - 1, 0)];

  const interval = BASE_INTERVALS[nextMastery] ?? BASE_INTERVALS.Exposed;
  return {
    mastery: nextMastery,
    nextReviewAt: now + interval,
  };
};

export const getAtRiskQueue = (states: ConceptState[], now = Date.now()) => {
  return states
    .map((state) => {
      const overdueBy = Math.max(0, now - state.nextReviewAt);
      const failureWeight = state.failureCount * 0.6;
      const goodQuestionWeight = state.goodQuestionSignals * 0.2;
      return {
        state,
        score: overdueBy / (1000 * 60 * 60) + failureWeight + goodQuestionWeight,
      };
    })
    .filter(({ state }) => state.nextReviewAt <= now)
    .sort((a, b) => b.score - a.score)
    .map(({ state }) => state);
};

export const pickQuestionVariant = (questions: Question[], recentVariants: string[]) => {
  const variants = new Map<string, Question[]>();
  questions.forEach((question) => {
    const group = question.variant ?? question.id;
    const list = variants.get(group) ?? [];
    list.push(question);
    variants.set(group, list);
  });

  const orderedGroups = Array.from(variants.keys()).filter(
    (group) => !recentVariants.includes(group)
  );

  const fallbackGroup = orderedGroups[0] ?? Array.from(variants.keys())[0];
  const groupQuestions = variants.get(fallbackGroup) ?? questions;
  return { question: groupQuestions[0], group: fallbackGroup };
};
