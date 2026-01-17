import { Link } from "react-router-dom";
import { ConceptState } from "../models/types";
import { masteryColor } from "../utils/formatters";

interface ConceptRowProps {
  conceptId: string;
  name: string;
  summary: string;
  prerequisites: string[];
  state: ConceptState;
  locked: boolean;
}

export const ConceptRow = ({ conceptId, name, summary, prerequisites, state, locked }: ConceptRowProps) => (
  <div className="card card-hover flex flex-col gap-3 p-4">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-charcoal-900">{name}</h3>
      <span className={`pill ${masteryColor(state.mastery)}`}>{state.mastery}</span>
    </div>
    <p className="text-sm text-slate-500">{summary}</p>
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      {prerequisites.length > 0 ? (
        <span>Prereqs: {prerequisites.join(", ")}</span>
      ) : (
        <span>No prerequisites</span>
      )}
      {locked && <span className="rounded-full bg-slate-100 px-2 py-1">Locked</span>}
    </div>
    <div className="flex items-center gap-2">
      <Link
        to={`/practice?concept=${conceptId}`}
        className="rounded-full bg-saffron-100 px-3 py-2 text-xs font-semibold text-charcoal-900"
      >
        Learn
      </Link>
      <Link
        to={`/practice?concept=${conceptId}&mode=review`}
        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
      >
        Review
      </Link>
    </div>
  </div>
);
