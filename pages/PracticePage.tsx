import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { QuestionCard } from "../components/QuestionCard";
import { useAppStore } from "../store/AppStore";
import { curiosityFacts } from "../utils/curiosities";
import { Attempt, Question } from "../models/types";

const useQuery = () => new URLSearchParams(useLocation().search);

const pickVariantQuestions = (questions: Question[], signalBoost: number) => {
  const grouped: Record<string, Question[]> = {};
  const standalone: Question[] = [];

  questions.forEach((question) => {
    if (question.variantGroup) {
      grouped[question.variantGroup] = grouped[question.variantGroup] || [];
      grouped[question.variantGroup].push(question);
    } else {
      standalone.push(question);
    }
  });

  const variantCount = Math.min(2, 1 + Math.floor(signalBoost / 2));
  const variants = Object.values(grouped).flatMap((group) => {
    const picks = [...group].sort(() => Math.random() - 0.5).slice(0, variantCount);
    return picks;
  });
  return [...standalone, ...variants];
};

export const PracticePage = () => {
  const query = useQuery();
  const mode = query.get("mode") ?? "daily";
  const conceptId = query.get("concept");
  const { topic, conceptStates, recordAttempt, schedulerSummary, signalGoodQuestion, prefs, markCoolStuffSeen } =
    useAppStore();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showCuriosity, setShowCuriosity] = useState(false);
  const [bossSecondsLeft, setBossSecondsLeft] = useState(600);

  const dueConceptIds = schedulerSummary?.dueConceptIds ?? [];
  const highRiskIds = schedulerSummary?.highRiskConceptIds ?? [];

  useEffect(() => {
    if (mode !== "boss") return;
    const timer = window.setInterval(() => {
      setBossSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode]);

  const bossMinutes = Math.floor(bossSecondsLeft / 60);
  const bossSeconds = String(bossSecondsLeft % 60).padStart(2, "0");

  const questionSet = useMemo(() => {
    if (!topic) return [] as Question[];

    if (conceptId) {
      const concept = topic.concepts.find((item) => item.id === conceptId);
      return concept
        ? pickVariantQuestions(concept.questions, conceptStates[concept.id]?.goodQuestionSignals ?? 0)
        : [];
    }

    const selectedTopic = prefs.selectedTopics.includes(topic.id);
    const conceptPool = selectedTopic ? topic.concepts : topic.concepts.slice(0, 4);
    const duePool = conceptPool.filter((concept) => dueConceptIds.includes(concept.id));
    const pickFrom = duePool.length > 0 ? duePool : conceptPool;
    const prioritized = [...pickFrom].sort((a, b) => {
      const aSignal = conceptStates[a.id]?.goodQuestionSignals ?? 0;
      const bSignal = conceptStates[b.id]?.goodQuestionSignals ?? 0;
      return bSignal - aSignal;
    });
    const defaultCount = mode === "boss" ? 10 : 12;
    return prioritized
      .flatMap((concept) =>
        pickVariantQuestions(concept.questions, conceptStates[concept.id]?.goodQuestionSignals ?? 0)
      )
      .slice(0, defaultCount);
  }, [topic, conceptId, dueConceptIds, prefs.selectedTopics, mode, conceptStates]);

  const question = questionSet[questionIndex];
  const dependencyHints = useMemo(() => {
    if (!question || !topic) return [];
    const concept = topic.concepts.find((item) => item.id === question.conceptId);
    return concept?.prerequisites ?? [];
  }, [question, topic]);
  const activeConcept = useMemo(() => {
    if (!question || !topic) return null;
    return topic.concepts.find((item) => item.id === question.conceptId) ?? null;
  }, [question, topic]);

  if (!topic || !schedulerSummary) {
    return <div className="min-h-screen bg-slate-50 p-8">Loading practice...</div>;
  }

  const shouldGateLearning = mode === "learn" && highRiskIds.length > 0;

  const handleAnswer = (answer: string, correct: boolean) => {
    if (!question) return;

    const attempt: Attempt = {
      questionId: question.id,
      conceptId: question.conceptId,
      correct,
      timestamp: new Date().toISOString(),
      selectedAnswer: answer
    };
    recordAttempt(attempt);

    if (correct) {
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      if (nextCorrect > 0 && nextCorrect % 5 === 0) {
        setShowCuriosity(true);
      }
    }
  };

  const handleNext = () => {
    setQuestionIndex((current) => Math.min(current + 1, questionSet.length - 1));
  };

  const curiosity = curiosityFacts.find((fact) => !prefs.coolStuffSeen.includes(fact.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-charcoal-900">Practice</h1>
          <p className="text-sm text-slate-500">
            {mode === "boss"
              ? "Boss battle: 10 mixed questions, timed focus."
              : mode === "learn"
                ? "Learn: short explanation then recall immediately."
                : "Daily at-risk queue: 5-7 minutes."}
          </p>
          {mode === "boss" && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {bossMinutes}:{bossSeconds} remaining
            </div>
          )}
        </header>

        {shouldGateLearning && (
          <div className="card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Due reviews are still waiting. Clear high-risk concepts before unlocking new learning.
          </div>
        )}

        {question ? (
          <>
            {mode === "learn" && activeConcept && (
              <div className="card border border-saffron-100 bg-saffron-50/50 p-4 text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concept brief</p>
                <p className="mt-2 text-charcoal-900">{activeConcept.summary}</p>
              </div>
            )}
            <QuestionCard
              question={question}
              onAnswer={handleAnswer}
              onGoodQuestion={() => signalGoodQuestion(question.conceptId)}
              dependencyHints={dependencyHints}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {questionIndex + 1} / {questionSet.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-saffron-100 px-4 py-2 text-xs font-semibold text-charcoal-900"
                disabled={questionIndex >= questionSet.length - 1}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="card p-6 text-sm text-slate-500">No questions found for this queue.</div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-charcoal-900">At-risk queue</h3>
            <p className="mt-2 text-sm text-slate-500">
              {dueConceptIds.length} concepts due · focus on clarity before speed.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-charcoal-900">Boss battle</h3>
            <p className="mt-2 text-sm text-slate-500">Scheduled weekly. Mixes stable and fragile topics.</p>
          </div>
        </section>
      </main>

      {showCuriosity && curiosity && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="card max-w-md p-6">
            <h3 className="text-lg font-semibold text-charcoal-900">Culture break</h3>
            <p className="mt-3 text-sm text-slate-600">{curiosity.text}</p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-saffron-100 px-4 py-2 text-xs font-semibold text-charcoal-900"
                onClick={() => {
                  markCoolStuffSeen(curiosity.id);
                  setShowCuriosity(false);
                }}
              >
                Save to Cool Stuff
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                onClick={() => setShowCuriosity(false)}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
