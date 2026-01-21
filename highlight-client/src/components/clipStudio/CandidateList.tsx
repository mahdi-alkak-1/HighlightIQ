import CandidateCard from "@/components/clipStudio/CandidateCard";
import Pagination from "@/components/clipStudio/Pagination";

interface CandidateItem {
  id: number;
  title: string;
  timeLabel: string;
  thumbnail: string;
}

interface CandidateListProps {
  items: CandidateItem[];
  activeId: number | null;
  onSelect: (id: number) => void;
  page: number;
  pageCount: number;
  rangeLabel: string;
  onPageChange: (page: number) => void;
}

const CandidateList = ({
  items,
  activeId,
  onSelect,
  page,
  pageCount,
  rangeLabel,
  onPageChange,
}: CandidateListProps) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white">Candidates</h3>
        <span className="text-[11px] text-white/40">{rangeLabel}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-xs text-white/50">No candidates yet.</p>}
        {items.map((item) => (
          <CandidateCard
            key={item.id}
            title={item.title}
            timeLabel={item.timeLabel}
            thumbnail={item.thumbnail}
            isActive={activeId === item.id}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
    </div>
  );
};

export default CandidateList;
