import { useMemo, useState } from "react";
import { FillQuestion, McqQuestion, OrderQuestion, Question } from "../models/types";

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, correct: boolean) => void;
  onGoodQuestion: () => void;
  dependencyHints?: string[];
}

export const QuestionCard = ({ question, onAnswer, onGoodQuestion, dependencyHints }: QuestionCardProps) => {
  const [selection, setSelection] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const correctAnswer = useMemo(() => question.answer.trim(), [question.answer]);
  const normalizedSelection = useMemo(() => {
    if (question.type === "FILL") {
      return selection.trim().toLowerCase();
    }
    if (question.type === "ORDER") {
      return selection.replace(/\s+/g, "");
    }
    return selection.trim();
  }, [question.type, selection]);

  const normalizedAnswer = useMemo(() => {
    if (question.type === "FILL") {
      return correctAnswer.toLowerCase();
    }
    if (question.type === "ORDER") {
      return correctAnswer.replace(/\s+/g, "");
    }
    return correctAnswer;
  }, [question.type, correctAnswer]);

  const isCorrect = Boolean(normalizedSelection) && normalizedSelection === normalizedAnswer;

  const handleSubmit = () => {
    if (!selection) return;
    setSubmitted(true);
    onAnswer(selection, normalizedSelection === normalizedAnswer);
  };

  const renderPrompt = () => {
    switch (question.type) {
      case "ORDER":
        return (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            {(question as OrderQuestion).items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        );
      case "FILL":
        return (
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Expected fill: {(question as FillQuestion).blanks.join(", ")}
          </div>
        );
      default:
        return null;
    }
  };

  const renderOptions = () => {
    if (question.type === "ORDER") {
      return (
        <input
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Enter order like 1,2,3,4"
          value={selection}
          onChange={(event) => setSelection(event.target.value.trim())}
        />
      );
    }

    if (question.type === "FILL") {
      return (
        <input
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Type the missing term"
          value={selection}
          onChange={(event) => setSelection(event.target.value.trim())}
        />
      );
    }

    const options = (question as McqQuestion).options;
    return (
      <div className="mt-4 space-y-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setSelection(option.label)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              selection === option.label
                ? "border-saffron-300 bg-saffron-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
              {option.label}
            </span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wide text-slate-400">{question.type}</div>
      <h2 className="mt-2 text-lg font-semibold text-charcoal-900">{question.prompt}</h2>
      {question.type === "TWO_STEP" && (
        <p className="mt-2 text-sm text-slate-500">
          Step 2 prompt: {(question as McqQuestion).reason}
        </p>
      )}
      {renderPrompt()}
      {renderOptions()}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          disabled={!selection}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onGoodQuestion}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
        >
          Good question / Useful
        </button>
        {submitted && (
          <span className={`pill ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      {submitted && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-charcoal-900">
            {isCorrect ? "Why this matters" : "Why you failed"}
          </p>
          <p className="mt-2">{question.explanation}</p>
          {question.misconceptions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Common misconceptions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {question.misconceptions.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          )}
          {dependencyHints && dependencyHints.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dependency hints</p>
              <p className="mt-2 text-sm text-slate-600">
                Revisit prerequisites: {dependencyHints.join(", ")}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
