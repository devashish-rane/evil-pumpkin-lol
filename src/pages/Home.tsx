import React from 'react';
import { Link } from 'react-router-dom';
import SelectedTopicCard from '../components/SelectedTopicCard';
import StatChip from '../components/StatChip';
import TopicCard from '../components/TopicCard';
import { useData } from '../store/DataContext';

export default function Home() {
  const { topics, prefs, atRiskCount, parseErrors } = useData();
  const selectedTopics = topics.filter((topic) =>
    prefs.selectedTopicIds.includes(topic.id)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip label="At-risk today" value={`${atRiskCount} concepts`} tone="warning" />
        <StatChip label="Streak" value="6 days" tone="accent" />
        <StatChip label="Memory debt" value="12 mins" />
        <StatChip label="Boss battle" value="In 2d 4h" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">My Selected</h2>
          <Link to="/practice" className="text-sm font-semibold text-saffron-600">
            Start daily queue
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {selectedTopics.length === 0 && (
            <div className="rounded-3xl border border-dashed border-ink-200 bg-white/70 p-6 text-sm text-ink-500">
              Pin a topic below to build your daily recall queue.
            </div>
          )}
          {selectedTopics.map((topic) => (
            <SelectedTopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink-900">All Topics</h2>
        {parseErrors.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            <div className="font-semibold">Content parsing issues</div>
            <ul className="mt-2 list-disc pl-5">
              {parseErrors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
