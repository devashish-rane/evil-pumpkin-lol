import React, { useMemo, useState } from 'react';
import type { Question } from '../models/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selected: string, reasonSelected?: string) => void;
  onGoodQuestion: () => void;
  dependencyHint?: string;
}

export default function QuestionCard({
  question,
  onAnswer,
  onGoodQuestion,
  dependencyHint
}: QuestionCardProps) {
  const [selected, setSelected] = useState('');
  const [reasonSelected, setReasonSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = useMemo(() => {
    if (!submitted) return false;
    if (question.type === 'TWO_STEP') {
      const expected = question.answer.split(',').map((part) => part.trim());
      return expected[0] === selected && expected[1] === reasonSelected;
    }
    return question.answer.trim().toLowerCase() === selected.trim().toLowerCase();
  }, [question, reasonSelected, selected, submitted]);

  const handleSubmit = () => {
    setSubmitted(true);
    onAnswer(selected, reasonSelected);
  };

  return (
    <div className="rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-ink-900">{question.prompt}</h3>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
            Score {question.difficulty}
          </span>
          <button
            type="button"
            onClick={onGoodQuestion}
            className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-600"
          >
            Good question
          </button>
        </div>
      </div>

      {(question.type === 'MCQ' || question.type === 'TWO_STEP') && question.options && (
        <div className="mt-4 grid gap-2">
          {question.options.map((option, index) => {
            const label = String.fromCharCode(65 + index);
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(label)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selected === label
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 bg-ink-100 text-ink-700 hover:bg-ink-200/70'
                }`}
              >
                <span className="font-semibold">{label}.</span> {option}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'TWO_STEP' && question.reasonOptions && (
        <div className="mt-6">
          <div className="text-sm font-semibold text-ink-700">{question.reasonPrompt}</div>
          <div className="mt-3 grid gap-2">
            {question.reasonOptions.map((option, index) => {
              const label = String.fromCharCode(65 + index);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReasonSelected(label)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    reasonSelected === label
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-ink-200 bg-ink-100 text-ink-700 hover:bg-ink-200/70'
                  }`}
                >
                  <span className="font-semibold">{label}.</span> {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Submit
        </button>
        {submitted && (
          <div
            className={`rounded-full px-3 py-2 text-xs font-semibold ${
              isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isCorrect ? 'Correct' : 'Not quite'}
          </div>
        )}
      </div>

      {submitted && (
        <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-100 p-4 text-sm text-ink-700">
          <div className="font-semibold text-ink-900">
            {isCorrect ? 'Why this is correct' : 'Why you failed'}
          </div>
          <p className="mt-2">{question.explanation}</p>
          {question.misconception && (
            <p className="mt-2 text-xs uppercase tracking-wide text-rose-500">
              Misconception: {question.misconception}
            </p>
          )}
          {dependencyHint && (
            <p className="mt-2 text-xs uppercase tracking-wide text-indigo-500">
              Dependency hint: {dependencyHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
