import { ClipLibraryItem } from "@/types/clipsLibrary";
import { formatDuration, formatCount, formatDate } from "@/utils/formatters";

interface ClipsLibraryRowProps {
  item: ClipLibraryItem;
  thumbnail: string;
}

const statusStyles: Record<ClipLibraryItem["status"], string> = {
  Published: "bg-brand-ready/20 text-brand-ready",
  Ready: "bg-brand-processing/20 text-brand-processing",
  Failed: "bg-red-500/20 text-red-300",
  Draft: "bg-white/10 text-white/50",
};

const ClipsLibraryRow = ({ item, thumbnail }: ClipsLibraryRowProps) => {
  return (
    <div className="grid grid-cols-[1.6fr_0.5fr_0.6fr_0.5fr_0.6fr] items-center gap-4 border-t border-white/5 py-3 text-xs text-white/70">
      <div className="flex items-center gap-3">
        <img src={thumbnail} alt={item.title} className="h-9 w-16 rounded-md object-cover" />
        <div>
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="text-[11px] text-white/50">
            From: {item.recordingTitle}
          </p>
          <p className="text-[10px] text-white/40">{formatDate(item.createdAt)}</p>
        </div>
      </div>
      <p className="text-[11px] text-white/60">{formatDuration(item.durationSeconds)}</p>
      <span className={`w-fit rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[item.status]}`}>
        {item.status}
      </span>
      <div className="flex items-center gap-2 text-[11px] text-white/60">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-red-500">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
            <path d="M21.58 7.19a2.75 2.75 0 0 0-1.93-1.95C17.86 4.75 12 4.75 12 4.75s-5.86 0-7.65.49A2.75 2.75 0 0 0 2.42 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.93 1.95c1.79.49 7.65.49 7.65.49s5.86 0 7.65-.49a2.75 2.75 0 0 0 1.93-1.95A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.42-4.81Z" />
            <path fill="#0b1220" d="M10.2 15.2V8.8L15.7 12l-5.5 3.2Z" />
          </svg>
        </span>
        YouTube
      </div>
      <div className="space-y-1 text-[11px] text-white/60">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3">
            <path
              d="M15 8.5c0 1.5-1.6 2.7-3 2.7S9 10 9 8.5 10.6 6 12 6s3 1.2 3 2.5Z"
              strokeWidth="1.5"
            />
            <path d="M4 18c1.7-3.2 5-5 8-5s6.3 1.8 8 5" strokeWidth="1.5" />
          </svg>
          {formatCount(item.views)}
        </div>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3">
            <path
              d="M8 11v9m0-9H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2h2v9"
              strokeWidth="1.5"
            />
            <path d="M12 13h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6" strokeWidth="1.5" />
          </svg>
          {formatCount(item.likes)}
        </div>
      </div>
    </div>
  );
};

export default ClipsLibraryRow;
