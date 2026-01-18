import PipelineStep from "@/components/dashboard/PipelineStep";
import { PipelineStepData } from "@/types/dashboard";

interface PipelineStatusProps {
  steps: PipelineStepData[];
}

const PipelineStatus = ({ steps }: PipelineStatusProps) => {
  return (
    <section className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <h3 className="text-sm font-semibold text-white">Current Pipeline Status</h3>
      <div className="mt-4 grid grid-cols-5 gap-4">
        {steps.map((step) => (
          <PipelineStep key={step.title} step={step} />
        ))}
      </div>
    </section>
  );
};

export default PipelineStatus;
