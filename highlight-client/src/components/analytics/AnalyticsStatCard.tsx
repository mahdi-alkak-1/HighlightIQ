import { AnalyticsStat } from "@/types/analytics";

interface AnalyticsStatCardProps {
  stat: AnalyticsStat;
}

const AnalyticsStatCard = ({ stat }: AnalyticsStatCardProps) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {stat.label}
        </p>
        <span className="text-[10px] text-brand-ready">{stat.trend ?? "Live"}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
    </div>
  );
};

export default AnalyticsStatCard;
