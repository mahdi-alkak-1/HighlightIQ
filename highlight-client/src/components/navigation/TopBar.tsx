import { DashboardRange } from "@/types/dashboard";

interface TopBarProps {
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}

const TopBar = ({ range, onRangeChange }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-xs text-white/50">
          Overview of your recent performance and processing queue.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">
          <select
            className="bg-transparent text-xs text-white/80 focus:outline-none"
            value={range}
            onChange={(event) => onRangeChange(event.target.value as DashboardRange)}
          >
            <option value="last7">Last 7 Days</option>
            <option value="today">Today</option>
          </select>
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </label>
        <button className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white">
          + Upload
        </button>
      </div>
    </div>
  );
};

export default TopBar;
