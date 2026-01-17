import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/DataContext';

type AnkiCard = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  conceptSummary?: string;
  answer?: string;
  reason?: string;
  explanation?: string;
  misconception?: string;
};

const CARD_COUNT = 200;
const ANIMATION_MS = 420;

export default function Anki() {
  const { topicId } = useParams();
  const { topics } = useData();
  const navigate = useNavigate();
  const topic = topics.find((item) => item.id === topicId);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const animationTimerRef = useRef<number | null>(null);

  const cards = useMemo<AnkiCard[]>(() => {
    if (!topic) return [];
    const resolveOption = (options: string[] | undefined, letter: string) => {
      const index = 'ABCD'.indexOf(letter);
      if (index >= 0 && options && options[index]) {
        return `${letter}) ${options[index]}`;
      }
      return letter;
    };
    const formatAnswer = (question: {
      type: string;
      answer: string;
      options?: string[];
      reasonOptions?: string[];
    }) => {
      const parts = question.answer.split(',').map((part) => part.trim());
      const primary = parts[0] ?? '';
      const reason = parts[1] ?? '';
      const answerText = resolveOption(question.options, primary);
      if (question.type === 'TWO_STEP') {
        const reasonText = resolveOption(question.reasonOptions, reason);
        return { answerText, reasonText };
      }
      return { answerText };
    };
    const conceptPromptTemplates = [
      (title: string) => ({
        subtitle: 'Explain',
        body: `Explain ${title} in 2-3 sentences.`
      }),
      (title: string) => ({
        subtitle: 'Use case',
        body: `Where does ${title} show up in real systems?`
      }),
      (title: string) => ({
        subtitle: 'Tradeoff',
        body: `What tradeoff comes with ${title}?`
      }),
      (title: string) => ({
        subtitle: 'Failure mode',
        body: `What breaks when ${title} is misused?`
      }),
      (title: string) => ({
        subtitle: 'Signal',
        body: `What would you monitor to validate ${title}?`
      })
    ];

    const conceptCards = topic.concepts.flatMap((concept, conceptIndex) => {
      const summary = concept.summary || `Clarify the core idea behind ${concept.title}.`;
      const baseCard: AnkiCard = {
        id: `concept-${conceptIndex}`,
        title: concept.title,
        subtitle: 'Concept',
        body: summary
      };
      const promptCards = conceptPromptTemplates.map((template, templateIndex) => {
        const prompt = template(concept.title);
        return {
          id: `concept-${conceptIndex}-prompt-${templateIndex}`,
          title: concept.title,
          subtitle: prompt.subtitle,
          body: prompt.body,
          conceptSummary: summary
        };
      });
      return [baseCard, ...promptCards];
    });

    const questionCards = topic.concepts.flatMap((concept, conceptIndex) =>
      concept.questions.flatMap((question, questionIndex) => {
        const formatted = formatAnswer(question);
        return {
          id: `question-${conceptIndex}-${questionIndex}`,
          title: concept.title,
          subtitle: 'Interview prompt',
          body: question.prompt,
          conceptSummary:
            concept.summary || `Clarify the core idea behind ${concept.title}.`,
          answer: formatted.answerText,
          reason: formatted.reasonText,
          explanation: question.explanation,
          misconception: question.misconception
        };
      })
    );

    const baseCards = [...conceptCards, ...questionCards];
    if (baseCards.length === 0) return [];
    return Array.from({ length: CARD_COUNT }, (_, cardIndex) => {
      const base = baseCards[cardIndex % baseCards.length];
      return {
        ...base,
        id: `${base.id}-${cardIndex}`
      };
    });
  }, [topic]);

  useEffect(() => {
    setIndex(0);
  }, [topicId]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || cards.length === 0) return;
    setIsAnimating(true);
    setSwipeDirection(direction);
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }
    animationTimerRef.current = window.setTimeout(() => {
      const deckLength = cards.length || CARD_COUNT;
      setIndex((prev) => {
        if (direction === 'left') {
          return (prev + 1) % deckLength;
        }
        return (prev - 1 + deckLength) % deckLength;
      });
      setSwipeDirection(null);
      setIsAnimating(false);
    }, ANIMATION_MS);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        triggerSwipe('right');
      }
      if (event.key === 'ArrowRight') {
        triggerSwipe('left');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cards.length, isAnimating]);

  const handlePrev = () => {
    triggerSwipe('right');
  };

  const handleNext = () => {
    triggerSwipe('left');
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 60) {
      if (delta > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartX.current = null;
  };

  if (!topic && topics.length === 0) {
    return <div className="text-sm text-ink-600">Loading Anki...</div>;
  }

  if (!topic) {
    return (
      <div className="text-sm text-ink-600">
        Topic not found.{' '}
        <button
          type="button"
          onClick={() => navigate('/topics')}
          className="font-semibold text-ink-900 underline underline-offset-2"
        >
          Back to topics
        </button>
      </div>
    );
  }

  const currentCard = cards[index];
  const deckLength = cards.length || CARD_COUNT;
  const previewIndex =
    swipeDirection === 'right'
      ? (index - 1 + deckLength) % deckLength
      : (index + 1) % deckLength;
  const previewCard = cards[previewIndex];
  const cardMotionClass = swipeDirection === 'left'
    ? 'anki-swipe-left'
    : swipeDirection === 'right'
    ? 'anki-swipe-right'
    : '';
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {topic.title} Anki
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">Interview Anki deck</h1>
            <p className="mt-2 text-sm text-ink-600">
              200 portrait cards that reinforce core concepts and interview expectations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span className="rounded-full border border-ink-200 bg-white px-3 py-1 font-semibold text-ink-700">
              Card {index + 1} / {CARD_COUNT}
            </span>
            <Link
              to={`/topic/${topic.id}`}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Back to topic
            </Link>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-md"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={isAnimating}
          className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink-200 bg-white/95 px-3 py-2 text-sm font-semibold text-ink-700 shadow-soft transition hover:-translate-y-[52%] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Previous card"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isAnimating}
          className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-full border border-ink-200 bg-white/95 px-3 py-2 text-sm font-semibold text-ink-700 shadow-soft transition hover:-translate-y-[52%] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Next card"
        >
          ▶
        </button>

        {previewCard && (
          <div
            className="anki-card anki-card-stack pointer-events-none absolute inset-0 z-0 rounded-[32px] border border-ink-200 bg-white/95 p-6 shadow-soft"
            aria-hidden="true"
          >
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {previewCard.subtitle}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-ink-800">
                  {previewCard.title}
                </h2>
                {previewCard.conceptSummary && (
                  <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-500">
                    <span className="font-semibold text-ink-600">Concept clarity: </span>
                    {previewCard.conceptSummary}
                  </div>
                )}
                <p className="mt-4 text-lg font-semibold leading-relaxed text-ink-800">
                  {previewCard.body}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          key={currentCard?.id ?? 'card'}
          className={`anki-card relative z-10 aspect-[3/4] w-full rounded-[32px] border border-ink-200 bg-white/95 p-6 shadow-soft ${cardMotionClass}`}
        >
          {currentCard ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {currentCard.subtitle}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-ink-900">
                  {currentCard.title}
                </h2>
                {currentCard.conceptSummary && (
                  <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-600">
                    <span className="font-semibold text-ink-700">Concept clarity: </span>
                    {currentCard.conceptSummary}
                  </div>
                )}
                <p className="mt-4 text-lg font-semibold leading-relaxed text-ink-900">
                  {currentCard.body}
                </p>
                {currentCard.answer && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Expected answer
                    </div>
                    <div className="mt-1 text-sm font-semibold text-ink-800">
                      {currentCard.answer}
                    </div>
                  </div>
                )}
                {currentCard.reason && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Reasoning choice
                    </div>
                    <div className="mt-1 text-sm font-semibold text-ink-800">
                      {currentCard.reason}
                    </div>
                  </div>
                )}
                {currentCard.explanation && (
                  <div className="mt-3 text-sm leading-relaxed text-ink-600">
                    {currentCard.explanation}
                  </div>
                )}
                {currentCard.misconception && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <span className="font-semibold">Common pitfall: </span>
                    {currentCard.misconception}
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Swipe or use arrows
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-600">
              Building your deck...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
