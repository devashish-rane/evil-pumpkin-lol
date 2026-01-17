import { ConceptState, SchedulerResult } from "../models/types";

const DAY = 1000 * 60 * 60 * 24;

/**
 * Compute review buckets and engagement metrics.
 *
 * Note: MVP implementation favors clarity and debuggability over cleverness. The
 * same function can be swapped for a more advanced algorithm later without
 * changing callers.
 */
export const computeSchedulerSummary = (states: ConceptState[]): SchedulerResult => {
  const now = Date.now();
  const dueConceptIds = states
    .filter((state) => new Date(state.nextReviewAt).getTime() <= now)
    .map((state) => state.conceptId);

  const highRiskConceptIds = states
    .filter((state) => {
      const due = new Date(state.nextReviewAt).getTime() <= now;
      return due && (state.failures > 0 || state.mastery === "Fragile");
    })
    .map((state) => state.conceptId);

  const memoryDebt = states.reduce((debt, state) => {
    const overdueDays = Math.max(0, Math.floor((now - new Date(state.nextReviewAt).getTime()) / DAY));
    return debt + overdueDays;
  }, 0);

  const streakDays = states.length === 0 ? 0 : Math.min(7, Math.floor(dueConceptIds.length / 3));

  const nextBossBattleAt = new Date(now + DAY * 7).toISOString();

  return {
    dueConceptIds,
    highRiskConceptIds,
    nextBossBattleAt,
    streakDays,
    memoryDebt
  };
};

export const computeNextReviewAt = (mastery: ConceptState["mastery"], correct: boolean) => {
  const now = Date.now();
  const multiplier = correct ? 1 : 0.4;

  const baseDays = {
    Exposed: 1,
    Fragile: 2,
    Stable: 5,
    InterviewReady: 12
  };

  return new Date(now + DAY * baseDays[mastery] * multiplier).toISOString();
};

export const promoteMastery = (mastery: ConceptState["mastery"], correct: boolean) => {
  if (!correct) {
    return mastery === "InterviewReady" ? "Stable" : mastery === "Stable" ? "Fragile" : "Exposed";
  }

  if (mastery === "Exposed") return "Fragile";
  if (mastery === "Fragile") return "Stable";
  if (mastery === "Stable") return "InterviewReady";
  return mastery;
};
