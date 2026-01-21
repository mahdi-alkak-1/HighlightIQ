import { useNavigate } from "react-router-dom";

import { DashboardRange } from "@/types/dashboard";
import { useDashboardEffectsContext } from "@/components/effects/DashboardEffectsContext";

interface TopBarProps {
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}

const TopBar = ({ range, onRangeChange }: TopBarProps) => {
  const navigate = useNavigate();
  const { enabled, prefersReducedMotion, setEnabled } = useDashboardEffectsContext();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-xs text-white/50">
          Overview of your recent performance and processing queue.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
          <select
            className="bg-transparent text-xs font-medium text-white outline-none"
            value={range}
            onChange={(event) => onRangeChange(event.target.value as DashboardRange)}
          >
            <option className="bg-[#1B202A] text-white" value="last7">
              Last 7 Days
            </option>
            <option className="bg-[#1B202A] text-white" value="today">
              Today
            </option>
          </select>
        </label>
        <div className={`flex items-center gap-2 rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs ${prefersReducedMotion ? "text-white/40" : "text-white/70"}`}>
          <span>Snow effect</span>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            disabled={prefersReducedMotion}
            className={`relative h-5 w-9 rounded-full transition ${enabled && !prefersReducedMotion ? "bg-brand-blue" : "bg-white/20"} disabled:cursor-not-allowed`}
          >
            <span
              className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
                enabled && !prefersReducedMotion ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate("/recordings")}
          className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white"
        >
          + Upload
        </button>
      </div>
    </div>
  );
};

export default TopBar;
