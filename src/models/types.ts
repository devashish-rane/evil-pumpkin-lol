export type MasteryLevel = 'Exposed' | 'Fragile' | 'Stable' | 'InterviewReady';

export interface Topic {
  id: string;
  name: string;
  description: string;
  concepts: Concept[];
}

export interface Concept {
  id: string;
  name: string;
  summary?: string;
  prereqs: string[];
  questions: Question[];
}

export type QuestionType = 'MCQ' | 'TWO_STEP' | 'ORDER' | 'FILL';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  answer: string | string[];
  explanation: string;
  tags: string[];
  misconception?: string;
  difficulty?: number;
  variant?: string;
  items?: string[];
  blanks?: string[];
  reasonOptions?: QuestionOption[];
  reasonAnswer?: string;
}

export interface Attempt {
  questionId: string;
  conceptId: string;
  correct: boolean;
  timestamp: number;
  confidence: 'low' | 'medium' | 'high';
  goodQuestion: boolean;
}

export interface ConceptState {
  conceptId: string;
  mastery: MasteryLevel;
  nextReviewAt: number;
  failStreak: number;
  goodQuestionBoost: number;
  lastAttemptAt?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserPrefs {
  selectedTopicIds: string[];
  curiosities: string[];
}
