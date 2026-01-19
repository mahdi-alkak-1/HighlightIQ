import CandidateCard from "@/components/clipStudio/CandidateCard";

interface CandidateItem {
  id: number;
  title: string;
  timeLabel: string;
}

interface CandidateListProps {
  items: CandidateItem[];
  activeId: number | null;
  thumbnail: string;
  onSelect: (id: number) => void;
}

const CandidateList = ({ items, activeId, thumbnail, onSelect }: CandidateListProps) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel p-4">
      <h3 className="text-xs font-semibold text-white">Candidates</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-xs text-white/50">No candidates yet.</p>}
        {items.map((item) => (
          <CandidateCard
            key={item.id}
            title={item.title}
            timeLabel={item.timeLabel}
            thumbnail={thumbnail}
            isActive={activeId === item.id}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CandidateList;
