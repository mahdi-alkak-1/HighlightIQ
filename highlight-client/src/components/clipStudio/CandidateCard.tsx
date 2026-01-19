interface CandidateCardProps {
  title: string;
  timeLabel: string;
  thumbnail: string;
  isActive: boolean;
  onSelect: () => void;
}

const CandidateCard = ({ title, timeLabel, thumbnail, isActive, onSelect }: CandidateCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
        isActive
          ? "border-brand-blue/60 bg-brand-blue/10"
          : "border-brand-border bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="h-12 w-16 overflow-hidden rounded-md bg-black/30">
        <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="text-[10px] text-white/50">{timeLabel}</p>
      </div>
    </button>
  );
};

export default CandidateCard;
