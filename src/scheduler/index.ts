import type { Attempt, ConceptState, MasteryLevel } from '../models/types';

const masteryOrder: MasteryLevel[] = ['Exposed', 'Fragile', 'Stable', 'InterviewReady'];

// Intervals are intentionally short to reinforce daily recall; this is a product choice, not a bug.
const masteryIntervals: Record<MasteryLevel, number> = {
  Exposed: 1,
  Fragile: 2,
  Stable: 5,
  InterviewReady: 12,
};

/**
 * Computes the next mastery level based on correctness and prior state.
 * This deliberately punishes incorrect answers to preserve the "cognitive honesty"
 * requirement and keep review pressure high.
 */
export const advanceMastery = (current: MasteryLevel, correct: boolean): MasteryLevel => {
  if (!correct) {
    return current === 'Exposed' ? 'Exposed' : masteryOrder[Math.max(0, masteryOrder.indexOf(current) - 1)];
  }
  return masteryOrder[Math.min(masteryOrder.length - 1, masteryOrder.indexOf(current) + 1)];
};

export const nextReviewTimestamp = (mastery: MasteryLevel, boost: number): number => {
  const days = masteryIntervals[mastery];
  // Good-question boosts nudge priority but won't fully override spaced repetition spacing.
  const adjustedDays = Math.max(0.5, days - boost * 0.2);
  return Date.now() + adjustedDays * 24 * 60 * 60 * 1000;
};

export const updateConceptState = (
  state: ConceptState | undefined,
  attempt: Attempt
): ConceptState => {
  const currentState: ConceptState =
    state ??
    ({
      conceptId: attempt.conceptId,
      mastery: 'Exposed',
      nextReviewAt: Date.now(),
      failStreak: 0,
      goodQuestionBoost: 0,
    } as ConceptState);

  const mastery = advanceMastery(currentState.mastery, attempt.correct);
  const failStreak = attempt.correct ? 0 : currentState.failStreak + 1;
  const goodQuestionBoost = attempt.goodQuestion
    ? Math.min(3, currentState.goodQuestionBoost + 1)
    : currentState.goodQuestionBoost;

  return {
    ...currentState,
    mastery,
    failStreak,
    goodQuestionBoost,
    nextReviewAt: nextReviewTimestamp(mastery, goodQuestionBoost),
    lastAttemptAt: attempt.timestamp,
  };
};

export const atRiskScore = (state: ConceptState, now: number): number => {
  const overdueDays = Math.max(0, now - state.nextReviewAt) / (24 * 60 * 60 * 1000);
  // Fail streaks and good-question signals make concepts bubble up without creating echo chambers.
  return overdueDays + state.failStreak * 0.5 + state.goodQuestionBoost * 0.2;
};
