import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TopBar } from "../components/TopBar";
import { MetricCard } from "../components/MetricCard";
import { SelectedTopicCard } from "../components/SelectedTopicCard";
import { TopicCard } from "../components/TopicCard";
import { useAppStore } from "../store/AppStore";
import { formatCountdown } from "../utils/formatters";

export const HomePage = () => {
  const { topic, parseError, prefs, toggleSelectedTopic, schedulerSummary } = useAppStore();

  if (parseError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-red-600">
        <p className="text-lg font-semibold">Content parser error</p>
        <p className="mt-2 text-sm">{parseError}</p>
      </div>
    );
  }

  if (!topic || !schedulerSummary) {
    return <div className="min-h-screen bg-slate-50 p-8">Loading Pumpkin...</div>;
  }

  const selectedTopics = prefs.selectedTopics.includes(topic.id) ? [topic] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="At-risk queue"
            value={`${schedulerSummary.dueConceptIds.length} concepts`}
          />
          <MetricCard label="Streak" value={`${schedulerSummary.streakDays} days`} />
          <MetricCard label="Memory debt" value={`${schedulerSummary.memoryDebt} days`} />
          <MetricCard
            label="Boss battle"
            value={formatCountdown(schedulerSummary.nextBossBattleAt)}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal-900">My Selected</h2>
            <Link className="text-sm text-slate-500" to="/practice">
              Jump into practice →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {selectedTopics.length === 0 ? (
              <div className="card flex min-w-[240px] flex-col gap-2 p-4 text-sm text-slate-500">
                <p>No selected topics yet.</p>
                <p className="text-xs">Pick one below to build your daily queue.</p>
              </div>
            ) : (
              selectedTopics.map((selected) => (
                <motion.div key={selected.id} whileHover={{ scale: 1.02 }}>
                  <SelectedTopicCard
                    id={selected.id}
                    title={selected.name}
                    progress={`${schedulerSummary.dueConceptIds.length} reviews due today`}
                  />
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal-900">All Topics</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">Daily revision first</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TopicCard
              id={topic.id}
              title={topic.name}
              description={topic.description}
              difficulty="Intermediate"
              timeEstimate="15-20 min"
              selected={prefs.selectedTopics.includes(topic.id)}
              onToggle={() => toggleSelectedTopic(topic.id)}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
