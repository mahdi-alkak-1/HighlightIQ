import { clipDateRanges, clipGameFilters, clipStatusFilters } from "@/data/clipsLibraryData";
import { ClipLibraryDateRange, ClipLibraryStatusFilter } from "@/types/clipsLibrary";

interface ClipsLibraryFiltersProps {
  status: ClipLibraryStatusFilter;
  game: string;
  dateRange: ClipLibraryDateRange;
  onStatusChange: (value: ClipLibraryStatusFilter) => void;
  onGameChange: (value: string) => void;
  onDateRangeChange: (value: ClipLibraryDateRange) => void;
}

const selectStyles =
  "rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs font-medium text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]";

const optionStyles = "bg-[#1B202A] text-white";

const ClipsLibraryFilters = ({
  status,
  game,
  dateRange,
  onStatusChange,
  onGameChange,
  onDateRangeChange,
}: ClipsLibraryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <label className={selectStyles}>
        <select
          className="bg-transparent text-xs font-medium text-white outline-none"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ClipLibraryStatusFilter)}
        >
          {clipStatusFilters.map((item) => (
            <option key={item.id} value={item.id} className={optionStyles}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={selectStyles}>
        <select
          className="bg-transparent text-xs font-medium text-white outline-none"
          value={game}
          onChange={(event) => onGameChange(event.target.value)}
        >
          {clipGameFilters.map((item) => (
            <option key={item.id} value={item.id} className={optionStyles}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={selectStyles}>
        <select
          className="bg-transparent text-xs font-medium text-white outline-none"
          value={dateRange}
          onChange={(event) => onDateRangeChange(event.target.value as ClipLibraryDateRange)}
        >
          {clipDateRanges.map((item) => (
            <option key={item.id} value={item.id} className={optionStyles}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default ClipsLibraryFilters;
