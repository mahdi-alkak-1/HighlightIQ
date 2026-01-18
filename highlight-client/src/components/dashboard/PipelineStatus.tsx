import PipelineStep from "@/components/dashboard/PipelineStep";
import { PipelineStepData } from "@/types/dashboard";

interface PipelineStatusProps {
  steps: PipelineStepData[];
  isLoading?: boolean;
}

const getProgressPercent = (steps: PipelineStepData[]) => {
  const n = steps.length;
  if (n <= 1) return 0;

  const lastIndex = n - 1;

  const activeIndex = steps.findIndex((s) => s.state === "active");
  if (activeIndex >= 0) {
    // Stop at ACTIVE node center
    return (activeIndex / lastIndex) * 100;
  }

  const lastCompleteIndex = [...steps].map((s) => s.state).lastIndexOf("complete");
  if (lastCompleteIndex >= 0) {
    // Stop at last COMPLETE node center
    return (lastCompleteIndex / lastIndex) * 100;
  }

  return 0;
};

const PipelineStatus = ({ steps, isLoading }: PipelineStatusProps) => {
  const progressPercent = getProgressPercent(steps);

  // small +1px prevents anti-alias gap, but doesn't visibly overshoot
  const progressWidth = steps.length <= 1 ? "0%" : `calc(${progressPercent}% + 1px)`;

  return (
    <section className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <h3 className="text-sm font-semibold text-white">Current Pipeline Status</h3>

      {isLoading ? (
        <div className="mt-4 text-sm text-white/60">Loading pipeline...</div>
      ) : (
        <div className="relative mt-6">
          {/* Track (center-to-center) */}
          <div className="absolute left-5 right-5 top-5 h-px bg-white/10" />

          {/* Progress: reaches node center, not past it */}
          <div
            className="absolute left-5 top-5 h-px bg-brand-blue/80"
            style={{ width: progressWidth }}
          />

          {/* Steps */}
          <div className="relative z-10 flex items-start justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex-1">
                <PipelineStep step={step} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PipelineStatus;
