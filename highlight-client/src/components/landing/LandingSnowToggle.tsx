interface LandingSnowToggleProps {
  enabled: boolean;
  prefersReducedMotion: boolean;
  onToggle: () => void;
}

const LandingSnowToggle = ({
  enabled,
  prefersReducedMotion,
  onToggle,
}: LandingSnowToggleProps) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">Snow effect</p>
        <p className="mt-1 text-xs text-white/50">Adds a subtle overlay to the dashboard.</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={prefersReducedMotion}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled && !prefersReducedMotion ? "bg-brand-blue" : "bg-white/20"
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled && !prefersReducedMotion ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

export default LandingSnowToggle;
