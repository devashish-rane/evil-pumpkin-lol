import React, { useMemo } from 'react';
import type { Question } from '../models/content';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onGoodQuestion: () => void;
  showExplanation?: boolean;
  lastAnswer?: string;
}

const ChoiceButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-xl border border-saffron-100 bg-white px-4 py-3 text-left text-sm font-medium text-slateInk-800 shadow-soft transition hover:-translate-y-0.5"
  >
    {label}
  </button>
);

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onGoodQuestion,
  showExplanation,
  lastAnswer,
}) => {
  const options = useMemo(() => {
    if (question.type === 'MCQ' || question.type === 'TWO_STEP') {
      return question.options;
    }
    return [];
  }, [question]);

  return (
    <div className="rounded-2xl border border-saffron-100 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">
          {question.type} • Difficulty {question.difficulty ?? 2}
        </p>
        <button
          type="button"
          onClick={onGoodQuestion}
          className="rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-slateInk-700"
        >
          Good question
        </button>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slateInk-900">{question.prompt}</h2>

      {question.type === 'MCQ' && (
        <div className="mt-4 grid gap-3">
          {options.map((option, index) => (
            <ChoiceButton key={option} label={`${String.fromCharCode(65 + index)}) ${option}`} onClick={() => onAnswer(String.fromCharCode(65 + index))} />
          ))}
        </div>
      )}

      {question.type === 'TWO_STEP' && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3">
            {options.map((option, index) => (
              <ChoiceButton key={option} label={`${String.fromCharCode(65 + index)}) ${option}`} onClick={() => onAnswer(String.fromCharCode(65 + index))} />
            ))}
          </div>
          <div className="rounded-xl border border-saffron-100 bg-saffron-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">Reasoning step</p>
            <p className="mt-2 text-sm font-medium text-slateInk-800">{question.reasonPrompt}</p>
            <div className="mt-3 grid gap-2">
              {question.reasonOptions.map((option, index) => (
                <ChoiceButton
                  key={option}
                  label={`R${String.fromCharCode(65 + index)}) ${option}`}
                  onClick={() => onAnswer(`R${String.fromCharCode(65 + index)}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {question.type === 'ORDER' && (
        <div className="mt-4 space-y-2 text-sm text-slateInk-700">
          {question.items.map((item, index) => (
            <p key={item} className="rounded-lg border border-saffron-100 bg-saffron-50 px-3 py-2">
              {index + 1}. {item}
            </p>
          ))}
          <button
            type="button"
            onClick={() => onAnswer(question.answer)}
            className="mt-3 rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
          >
            I can order these
          </button>
        </div>
      )}

      {question.type === 'FILL' && (
        <div className="mt-4">
          <p className="text-sm text-slateInk-600">
            Fill the blank aloud, then reveal the answer.
          </p>
          <button
            type="button"
            onClick={() => onAnswer(question.answer)}
            className="mt-3 rounded-full bg-slateInk-900 px-4 py-2 text-xs font-semibold text-white"
          >
            I have an answer
          </button>
        </div>
      )}

      {showExplanation && (
        <div className="mt-5 rounded-xl border border-saffron-100 bg-saffron-50 p-4 text-sm text-slateInk-700">
          <p className="font-semibold">Answer: {question.answer}</p>
          <p className="mt-2">{question.explanation}</p>
          {question.misconception && (
            <p className="mt-2 text-xs text-slateInk-600">Misconception: {question.misconception}</p>
          )}
          {lastAnswer && (
            <p className="mt-2 text-xs text-slateInk-500">Your response: {lastAnswer}</p>
          )}
        </div>
      )}
    </div>
  );
};
