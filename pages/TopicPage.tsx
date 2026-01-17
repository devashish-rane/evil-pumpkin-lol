import { useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { ConceptRow } from "../components/ConceptRow";
import { useAppStore } from "../store/AppStore";

export const TopicPage = () => {
  const { topicId } = useParams();
  const { topic, conceptStates } = useAppStore();

  if (!topic || topic.id !== topicId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar />
        <div className="mx-auto max-w-5xl px-5 py-10">Topic not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="mx-auto max-w-5xl px-5 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-charcoal-900">{topic.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{topic.description}</p>
        </div>
        <div className="space-y-4">
          {topic.concepts.map((concept) => {
            const state = conceptStates[concept.id];
            const locked = concept.prerequisites.some((prereq) => {
              const prereqId = prereq
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
              const prereqState = conceptStates[prereqId];
              return !prereqState || prereqState.mastery === "Exposed";
            });
            return (
              <ConceptRow
                key={concept.id}
                conceptId={concept.id}
                name={concept.name}
                summary={concept.summary}
                prerequisites={concept.prerequisites}
                state={state}
                locked={locked}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};
