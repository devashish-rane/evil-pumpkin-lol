import type { MasteryLevel } from './content';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Attempt {
  id: string;
  questionId: string;
  conceptId: string;
  correct: boolean;
  timestamp: number;
  response: string;
}

export interface ConceptState {
  conceptId: string;
  mastery: MasteryLevel;
  nextReviewAt: number;
  failureCount: number;
  successCount: number;
  lastReviewedAt?: number;
  goodQuestionSignals: number;
}

export interface UserPrefs {
  selectedTopics: string[];
  streakCount: number;
  lastStudyDate?: string;
  memoryDebt: number;
  curiositiesViewed: string[];
}
