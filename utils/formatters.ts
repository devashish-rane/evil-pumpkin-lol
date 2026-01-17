import { MasteryLevel } from "../models/types";

export const masteryColor = (mastery: MasteryLevel) => {
  switch (mastery) {
    case "Exposed":
      return "bg-amber-100 text-amber-700";
    case "Fragile":
      return "bg-yellow-100 text-yellow-700";
    case "Stable":
      return "bg-emerald-100 text-emerald-700";
    case "InterviewReady":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const formatCountdown = (isoDate: string) => {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return "Ready";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
};
