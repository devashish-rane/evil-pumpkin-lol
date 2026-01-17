export type MasteryLevel = 'Exposed' | 'Fragile' | 'Stable' | 'InterviewReady';

export type QuestionType = 'MCQ' | 'TWO_STEP' | 'ORDER' | 'FILL';

export interface Topic {
  id: string;
  title: string;
  description: string;
  concepts: Concept[];
}

export interface Concept {
  id: string;
  title: string;
  summary: string;
  prereq: string[];
  questions: Question[];
}

export interface Question {
  id: string;
  conceptId: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  tags: string[];
  misconception?: string;
  difficulty: number;
  variantGroup?: string;
  items?: string[];
  blanks?: string[];
  reasonPrompt?: string;
  reasonOptions?: string[];
}

export interface Attempt {
  id: string;
  questionId: string;
  timestamp: number;
  correct: boolean;
  selected: string;
  reasonSelected?: string;
}

export interface ConceptState {
  conceptId: string;
  mastery: MasteryLevel;
  nextReviewAt: number;
  lastAttemptAt?: number;
  correctStreak: number;
  wrongStreak: number;
  goodQuestionSignal: number;
}

export interface UserPrefs {
  selectedTopicIds: string[];
  curiositySeen: string[];
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  token: string;
}
