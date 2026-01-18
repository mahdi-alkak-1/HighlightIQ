import { PipelineStepData } from "@/types/dashboard";

interface PipelineStepProps {
  step: PipelineStepData;
}

const PipelineStep = ({ step }: PipelineStepProps) => {
  const stateStyles: Record<PipelineStepData["state"], string> = {
    active: "bg-brand-blue text-white",
    complete: "bg-white/10 text-white",
    pending: "bg-white/5 text-white/70",
    disabled: "bg-white/5 text-white/30",
  };

  const showSpinner = step.state === "active";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-brand-border ${
          stateStyles[step.state]
        }`}
      >
        {showSpinner ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />
        ) : (
          <span className="text-xs font-semibold">{step.label[0]}</span>
        )}
      </div>
      <p className="text-xs font-semibold text-white/80">{step.label}</p>
      <p className="text-[10px] text-white/50">{step.status}</p>
    </div>
  );
};

export default PipelineStep;
