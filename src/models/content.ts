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
  prerequisites: string[];
  summary: string;
  questions: Question[];
}

export interface QuestionBase {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
  answer: string;
  tags: string[];
  misconception?: string;
  difficulty?: number;
  variant?: string;
}

export interface McqQuestion extends QuestionBase {
  type: 'MCQ';
  options: string[];
}

export interface TwoStepQuestion extends QuestionBase {
  type: 'TWO_STEP';
  options: string[];
  reasonPrompt: string;
  reasonOptions: string[];
  reasonAnswer: string;
}

export interface OrderQuestion extends QuestionBase {
  type: 'ORDER';
  items: string[];
}

export interface FillQuestion extends QuestionBase {
  type: 'FILL';
  blankAnswers: string[];
}

export type Question = McqQuestion | TwoStepQuestion | OrderQuestion | FillQuestion;

export interface ParseError {
  message: string;
  line: number;
}
