import { StatCardData } from "@/types/dashboard";

interface StatCardProps {
  data: StatCardData;
}

const StatCard = ({ data }: StatCardProps) => {
  const trendColor =
    data.trend === "up"
      ? "text-brand-ready"
      : data.trend === "down"
        ? "text-red-400"
        : "text-white/50";

  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 py-3">
      <p className="text-xs text-white/50">{data.label}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-semibold text-white">{data.value}</span>
        <span className={`text-xs ${trendColor}`}>{data.change}</span>
      </div>
      {data.footnote && (
        <p className="mt-1 text-[10px] text-white/40">{data.footnote}</p>
      )}
    </div>
  );
};

export default StatCard;
