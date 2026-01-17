import { Link } from "react-router-dom";

interface SelectedTopicCardProps {
  id: string;
  title: string;
  progress: string;
}

export const SelectedTopicCard = ({ id, title, progress }: SelectedTopicCardProps) => (
  <div className="card card-hover min-w-[240px] p-5">
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900">{title}</h3>
        <p className="text-sm text-slate-500">{progress}</p>
      </div>
      <Link
        to={`/practice?topic=${id}`}
        className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-saffron-200 px-4 py-2 text-xs font-semibold text-charcoal-900"
      >
        Continue
      </Link>
    </div>
  </div>
);
