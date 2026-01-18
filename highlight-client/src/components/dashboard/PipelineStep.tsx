import { PipelineStepData } from "@/types/dashboard";

interface PipelineStepProps {
  step: PipelineStepData;
}

const getStepIcon = (id: PipelineStepData["id"]) => {
  switch (id) {
    case "upload":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M12 16V8m0 0l-3 3m3-3l3 3M5 16v3h14v-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "detecting":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M5 12h14M12 5v14M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "review":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M4 6h10l6 6-6 6H4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "publish":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M12 3l8 8-8 8-8-8 8-8z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sync":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M20 12a8 8 0 00-14.5-4.5M4 4v4h4M4 12a8 8 0 0014.5 4.5M20 20v-4h-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return <span className="text-xs font-semibold">{id[0].toUpperCase()}</span>;
  }
};

const PipelineStep = ({ step }: PipelineStepProps) => {
  const stateStyles: Record<PipelineStepData["state"], string> = {
    active: "bg-brand-blue text-white shadow-[0_0_0_6px_rgba(59,130,246,0.12)]",
    complete: "bg-white/10 text-white",
    pending: "bg-white/5 text-white/70",
    disabled: "bg-white/5 text-white/30",
  };

  const isActive = step.state === "active";
  const isComplete = step.state === "complete";

  const labelTone =
    step.state === "disabled" ? "text-white/30" : step.state === "pending" ? "text-white/60" : "text-white";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {/* Circle */}
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          "border border-brand-border",
          "backdrop-blur-sm",
          "relative",
          stateStyles[step.state],
        ].join(" ")}
      >
        <span className="text-white/90">{getStepIcon(step.id)}</span>
        {isActive && (
          <span className="absolute h-12 w-12 animate-spin rounded-full border-2 border-white/30 border-t-white/70" />
        )}
        {isComplete && (
          <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-ready text-[10px] text-white">
            ✓
          </span>
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <p className={`text-xs font-semibold ${labelTone}`}>{step.label}</p>
        <p className="text-[10px] text-white/50">{step.status}</p>
      </div>
    </div>
  );
};

export default PipelineStep;
