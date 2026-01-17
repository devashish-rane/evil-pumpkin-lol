export type MasteryLevel = "Exposed" | "Fragile" | "Stable" | "InterviewReady";

export type QuestionType = "MCQ" | "TWO_STEP" | "ORDER" | "FILL";

export interface QuestionOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuestionBase {
  id: string;
  conceptId: string;
  prompt: string;
  type: QuestionType;
  answer: string;
  explanation: string;
  tags: string[];
  misconceptions: string[];
  difficulty: number;
  variantGroup?: string;
}

export interface McqQuestion extends QuestionBase {
  type: "MCQ" | "TWO_STEP";
  options: QuestionOption[];
  reason?: string;
}

export interface OrderQuestion extends QuestionBase {
  type: "ORDER";
  items: string[];
}

export interface FillQuestion extends QuestionBase {
  type: "FILL";
  blanks: string[];
}

export type Question = McqQuestion | OrderQuestion | FillQuestion;

export interface Concept {
  id: string;
  name: string;
  summary: string;
  prerequisites: string[];
  questions: Question[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  concepts: Concept[];
}

export interface ConceptState {
  conceptId: string;
  mastery: MasteryLevel;
  nextReviewAt: string;
  lastAttemptAt?: string;
  goodQuestionSignals: number;
  failures: number;
}

export interface Attempt {
  questionId: string;
  conceptId: string;
  correct: boolean;
  timestamp: string;
  selectedAnswer: string;
}

export interface UserPrefs {
  selectedTopics: string[];
  coolStuffSeen: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SchedulerResult {
  dueConceptIds: string[];
  highRiskConceptIds: string[];
  nextBossBattleAt: string;
  streakDays: number;
  memoryDebt: number;
}
