import { RecordingDateFilter, RecordingStatusFilter, dateFilters, statusFilters } from "@/data/recordingsOptions";

interface RecordingsToolbarProps {
  query: string;
  status: RecordingStatusFilter;
  dateRange: RecordingDateFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: RecordingStatusFilter) => void;
  onDateRangeChange: (value: RecordingDateFilter) => void;
}

const RecordingsToolbar = ({
  query,
  status,
  dateRange,
  onQueryChange,
  onStatusChange,
  onDateRangeChange,
}: RecordingsToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs text-white/70">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M11 19a8 8 0 100-16 8 8 0 000 16zm7-2l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          className="w-52 bg-transparent text-xs text-white/80 outline-none"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search recordings..."
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          className="rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs text-white/80 outline-none"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as RecordingStatusFilter)}
        >
          {statusFilters.map((filter) => (
            <option className="bg-[#1B202A]" key={filter} value={filter}>
              Status: {filter}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-xs text-white/80 outline-none"
          value={dateRange}
          onChange={(event) => onDateRangeChange(event.target.value as RecordingDateFilter)}
        >
          {dateFilters.map((filter) => (
            <option className="bg-[#1B202A]" key={filter} value={filter}>
              Date: {filter === "last30" ? "Last 30 Days" : filter === "last7" ? "Last 7 Days" : "Today"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RecordingsToolbar;
