import { useState } from "react";
import PipelineStatus from "@/components/dashboard/PipelineStatus";
import StatCard from "@/components/dashboard/StatCard";
import UploadTable from "@/components/dashboard/UploadTable";
import TopBar from "@/components/navigation/TopBar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePipeline } from "@/hooks/usePipeline";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardRange } from "@/types/dashboard";

const DashboardPage = () => {
  const [range, setRange] = useState<DashboardRange>("last7");
  const { stats, uploads, isLoading, errorMessage } = useDashboardData(range);
  const {
    stages: pipelineStages,
    isLoading: pipelineLoading,
    errorMessage: pipelineError,
  } = usePipeline();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TopBar range={range} onRangeChange={setRange} />

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}
        {pipelineError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {pipelineError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} data={stat} />
          ))}
        </section>

        <PipelineStatus steps={pipelineStages} isLoading={pipelineLoading} />
        <UploadTable uploads={uploads} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
