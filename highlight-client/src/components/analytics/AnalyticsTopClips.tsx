import { AnalyticsTopClip } from "@/types/analytics";
import { formatCount } from "@/utils/formatters";

interface AnalyticsTopClipsProps {
  items: AnalyticsTopClip[];
}

const AnalyticsTopClips = ({ items }: AnalyticsTopClipsProps) => {
  const maxViews = Math.max(...items.map((item) => item.views), 1);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Top clips by views</p>
        <span className="text-[10px] text-white/40">Last 30 days</span>
      </div>

      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <p className="text-xs text-white/50">No published clips yet.</p>
        )}
        {items.map((clip) => (
          <div key={clip.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{clip.title}</span>
              <span>{formatCount(clip.views)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-2 rounded-full bg-brand-blue"
                style={{ width: `${Math.max(8, (clip.views / maxViews) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40">From: {clip.recordingTitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsTopClips;
