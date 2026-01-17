import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Question } from '../models/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (payload: { correct: boolean; goodQuestion: boolean }) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<string>('');
  const [secondary, setSecondary] = useState<string>('');
  const [ordered, setOrdered] = useState<string[]>(question.items ?? []);
  const [fill, setFill] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [goodQuestion, setGoodQuestion] = useState(false);

  const answer = useMemo(() => {
    if (Array.isArray(question.answer)) {
      return question.answer.join(',');
    }
    return question.answer;
  }, [question.answer]);

  const isCorrect = useMemo(() => {
    if (question.type === 'ORDER') {
      const orderKeys = answer.split(',').map((item) => Number(item.trim()) - 1);
      const expected = orderKeys.map((index) => question.items?.[index]).filter(Boolean);
      return expected.join('|') === ordered.join('|');
    }
    if (question.type === 'FILL') {
      return fill.trim().toLowerCase() === answer.toString().toLowerCase();
    }
    if (question.type === 'TWO_STEP') {
      return selected === answer && secondary === question.reasonAnswer;
    }
    return selected === answer;
  }, [question, selected, secondary, ordered, answer, fill]);

  const handleSubmit = () => {
    if (submitted) return;
    const correct = isCorrect;
    setSubmitted(true);
    onAnswer({ correct, goodQuestion });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="text-sm font-semibold uppercase tracking-widest text-saffron-600">{question.type}</div>
      <h2 className="mt-3 text-lg font-semibold text-ink">{question.prompt}</h2>

      {question.type === 'ORDER' && question.items && (
        <div className="mt-4 space-y-2">
          {ordered.map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-xl border border-black/5 bg-saffron-50 px-4 py-2 text-sm">
              <span>
                {index + 1}. {item}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (index === 0) return;
                  const next = [...ordered];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  setOrdered(next);
                }}
                className="text-xs text-slateblue-600"
              >
                Move up
              </button>
            </div>
          ))}
        </div>
      )}

      {question.type === 'FILL' && (
        <div className="mt-4">
          <input
            value={fill}
            onChange={(event) => setFill(event.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-saffron-400 focus:outline-none"
            placeholder="Type your answer"
          />
        </div>
      )}

      {question.options && (
        <div className="mt-4 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelected(option.key)}
              className={clsx(
                'rounded-xl border px-4 py-3 text-left text-sm transition',
                selected === option.key
                  ? 'border-saffron-400 bg-saffron-50'
                  : 'border-black/10 bg-white hover:border-saffron-200'
              )}
            >
              <span className="font-semibold">{option.key}.</span> {option.text}
            </button>
          ))}
        </div>
      )}

      {question.type === 'TWO_STEP' && question.reasonOptions && (
        <div className="mt-4 grid gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">Reasoning</div>
          {question.reasonOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSecondary(option.key)}
              className={clsx(
                'rounded-xl border px-4 py-3 text-left text-sm transition',
                secondary === option.key
                  ? 'border-slateblue-500 bg-slateblue-500/10'
                  : 'border-black/10 bg-white hover:border-slateblue-300'
              )}
            >
              <span className="font-semibold">{option.key}.</span> {option.text}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setGoodQuestion((prev) => !prev)}
          className={clsx(
            'rounded-full px-4 py-2 text-xs font-semibold',
            goodQuestion ? 'bg-slateblue-500 text-white' : 'border border-slateblue-500/30 text-slateblue-600'
          )}
        >
          Good question / Useful
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white"
        >
          Check Answer
        </button>
      </div>

      {submitted && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-paper p-4">
          <div className={clsx('text-sm font-semibold', isCorrect ? 'text-tealsoft-500' : 'text-saffron-700')}>
            {isCorrect ? 'Correct' : 'Needs work'}
          </div>
          {!isCorrect && question.misconception && (
            <div className="mt-2 text-xs text-ink/60">Why you failed: {question.misconception}</div>
          )}
          <p className="mt-2 text-sm text-ink/70">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
