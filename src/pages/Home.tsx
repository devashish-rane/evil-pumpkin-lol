import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectedTopicCard } from '../components/SelectedTopicCard';
import { StatPill } from '../components/StatPill';
import { TopicCard } from '../components/TopicCard';
import { useLearning } from '../store/LearningContext';
import { loadTopics } from '../utils/contentLoader';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { prefs, setPrefs } = useLearning();
  const { topics, errors } = loadTopics();

  const selectedTopics = topics.filter((topic) => prefs.selectedTopicIds.includes(topic.id));

  const toggleTopic = (topicId: string) => {
    const nextSelected = prefs.selectedTopicIds.includes(topicId)
      ? prefs.selectedTopicIds.filter((id) => id !== topicId)
      : [...prefs.selectedTopicIds, topicId];
    setPrefs({ ...prefs, selectedTopicIds: nextSelected });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Daily pulse</h2>
        <div className="flex flex-wrap gap-3">
          <StatPill label="At-risk" value="6 concepts" tone="warning" />
          <StatPill label="Streak" value="4 days" tone="success" />
          <StatPill label="Memory debt" value="12 mins" tone="info" />
          <StatPill label="Boss battle" value="3d 4h" tone="info" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
            onClick={() => topics[0] && navigate(`/practice/${topics[0].id}?mode=review`)}
            disabled={!topics[0]}
          >
            Start at-risk queue
          </button>
          <button
            type="button"
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink/70"
            onClick={() => topics[0] && navigate(`/practice/${topics[0].id}?mode=boss`)}
            disabled={!topics[0]}
          >
            Boss battle
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">My Selected</h2>
          <span className="text-xs text-ink/60">Swipe for more</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {selectedTopics.length > 0 ? (
            selectedTopics.map((topic) => (
              <SelectedTopicCard key={topic.id} topic={topic} onContinue={() => navigate(`/topic/${topic.id}`)} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/10 bg-white p-6 text-sm text-ink/60">
              Pin a topic below to build your daily recall queue.
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">All Topics</h2>
        {errors.length > 0 && (
          <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-saffron-900">
            <div className="font-semibold">Content parsing warnings</div>
            <ul className="mt-2 list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              selected={prefs.selectedTopicIds.includes(topic.id)}
              onToggle={toggleTopic}
              onOpen={(id) => navigate(`/topic/${id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
