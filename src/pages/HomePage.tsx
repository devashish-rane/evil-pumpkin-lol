import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { StatCard } from '../components/StatCard';
import { TopicCard } from '../components/TopicCard';
import { useContent } from '../store/content';
import { useAppStore } from '../store/app';
import { getAtRiskQueue } from '../scheduler/scheduler';

const getNextBossBattleCountdown = () => {
  const now = new Date();
  const next = new Date();
  next.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  next.setHours(9, 0, 0, 0);
  const diffMs = next.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const hours = diffHours % 24;
  return `${diffDays}d ${hours}h`;
};

const HomePage: React.FC = () => {
  const { topics, errors, loading } = useContent();
  const { prefs, updatePrefs, conceptStates } = useAppStore();
  const navigate = useNavigate();

  const atRiskQueue = useMemo(() => getAtRiskQueue(conceptStates), [conceptStates]);

  const selectedTopics = topics.filter((topic) => prefs.selectedTopics.includes(topic.id));
  const allTopics = topics;

  const toggleSelected = (topicId: string) => {
    const selected = prefs.selectedTopics.includes(topicId);
    const next = selected
      ? prefs.selectedTopics.filter((id) => id !== topicId)
      : [...prefs.selectedTopics, topicId];
    updatePrefs({ selectedTopics: next });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="At-risk queue" value={`${atRiskQueue.length} concepts`} helper="Due today" />
          <StatCard label="Streak" value={`${prefs.streakCount} days`} helper="Consistency wins" />
          <StatCard label="Memory debt" value={`${prefs.memoryDebt} mins`} helper="Backlog to clear" />
          <StatCard label="Boss battle" value={getNextBossBattleCountdown()} helper="Next challenge" />
        </section>

        {loading && <p className="text-sm text-slateInk-600">Loading curriculum...</p>}

        {errors.length > 0 && (
          <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-slateInk-700">
            <p className="font-semibold">Content warnings</p>
            {errors.map((error) => (
              <div key={error.file} className="mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">
                  {error.file}
                </p>
                <ul className="mt-1 list-disc pl-4">
                  {error.errors.map((err) => (
                    <li key={`${error.file}-${err.line}`}>{`Line ${err.line}: ${err.message}`}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slateInk-900">My Selected</h2>
            <span className="rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-slateInk-700">
              {selectedTopics.length} pinned
            </span>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
            {selectedTopics.length === 0 && (
              <div className="rounded-2xl border border-dashed border-saffron-200 bg-saffron-50 px-6 py-8 text-sm text-slateInk-600">
                Pin a topic to keep it in your daily flow.
              </div>
            )}
            {selectedTopics.map((topic) => (
              <div key={topic.id} className="min-w-[260px]">
                <TopicCard
                  topic={topic}
                  selected
                  onToggleSelect={() => toggleSelected(topic.id)}
                  onOpen={() => navigate(`/topic/${topic.id}`)}
                  variant="compact"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slateInk-900">All Topics</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {allTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                selected={prefs.selectedTopics.includes(topic.id)}
                onToggleSelect={() => toggleSelected(topic.id)}
                onOpen={() => navigate(`/topic/${topic.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default HomePage;
