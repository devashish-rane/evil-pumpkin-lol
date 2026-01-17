import { Link } from "react-router-dom";

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeEstimate: string;
  selected: boolean;
  onToggle: () => void;
}

export const TopicCard = ({
  id,
  title,
  description,
  difficulty,
  timeEstimate,
  selected,
  onToggle
}: TopicCardProps) => (
  <div className="card card-hover flex flex-col gap-4 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <span className="pill bg-slate-100 text-slate-600">{difficulty}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-slate-400">{timeEstimate}</span>
      <div className="flex items-center gap-2">
        <Link
          to={`/topic/${id}`}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          View
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            selected
              ? "bg-saffron-100 text-charcoal-900"
              : "border border-saffron-200 text-charcoal-700"
          }`}
        >
          {selected ? "Added" : "Add to My Selected"}
        </button>
      </div>
    </div>
  </div>
);
