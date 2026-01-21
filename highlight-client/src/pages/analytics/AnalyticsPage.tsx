import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";
import AnalyticsTopClips from "@/components/analytics/AnalyticsTopClips";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsRange } from "@/types/analytics";

const AnalyticsPage = () => {
  const [range, setRange] = useState<AnalyticsRange>("last30");
  const { stats, series, topClips, isLoading, errorMessage } = useAnalytics(range);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Analytics</h1>
            <p className="text-xs text-white/50">Track performance and learn what works</p>
          </div>
          <AnalyticsFilters range={range} onRangeChange={setRange} />
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <AnalyticsStatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <AnalyticsChart series={series} />
          <AnalyticsTopClips items={topClips} />
        </section>

        {isLoading && (
          <p className="text-xs text-white/40">Loading analytics…</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
