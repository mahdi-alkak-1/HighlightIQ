import { analyticsRanges } from "@/data/analyticsData";
import { AnalyticsRange } from "@/types/analytics";

interface AnalyticsFiltersProps {
  range: AnalyticsRange;
  onRangeChange: (value: AnalyticsRange) => void;
}

const AnalyticsFilters = ({ range, onRangeChange }: AnalyticsFiltersProps) => {
  return (
    <label className="flex items-center rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
      <select
        className="bg-transparent text-xs font-medium text-white outline-none"
        value={range}
        onChange={(event) => onRangeChange(event.target.value as AnalyticsRange)}
      >
        {analyticsRanges.map((item) => (
          <option key={item.id} value={item.id} className="bg-[#1B202A] text-white">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default AnalyticsFilters;
