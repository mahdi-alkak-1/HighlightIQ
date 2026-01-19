import { timelinePoints } from "@/data/clipStudioData";
import { formatSeconds } from "@/utils/time";

interface TimelineEditorProps {
  start: number;
  end: number;
  duration: number;
  maxDuration: number;
  totalDuration: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

const TimelineEditor = ({
  start,
  end,
  duration,
  maxDuration,
  totalDuration,
  onStartChange,
  onEndChange,
}: TimelineEditorProps) => {
  const points = timelinePoints
    .map((value, index) => `${(index / (timelinePoints.length - 1)) * 100},${40 - value}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 py-4">
      <div className="flex items-center justify-between text-[10px] text-white/60">
        <span>Timeline</span>
        <span>
          Duration: {duration}s / {maxDuration}s
        </span>
      </div>
      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-brand-border bg-[#10141C] px-3 py-2">
          <svg viewBox="0 0 100 40" className="h-14 w-full">
            <polyline
              fill="none"
              stroke="rgba(28,47,255,0.6)"
              strokeWidth="1.6"
              points={points}
            />
            <polyline
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              points="0,32 100,32"
            />
          </svg>
        </div>

        <div className="relative h-7">
          <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-blue to-brand-link"
            style={{
              left: `${(start / totalDuration) * 100}%`,
              width: `${((end - start) / totalDuration) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/40 bg-brand-blue shadow-[0_0_12px_rgba(28,47,255,0.6)]"
            style={{ left: `calc(${(start / totalDuration) * 100}% - 8px)` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/40 bg-brand-blue shadow-[0_0_12px_rgba(28,47,255,0.6)]"
            style={{ left: `calc(${(end / totalDuration) * 100}% - 8px)` }}
          />
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={start}
            onChange={(event) => onStartChange(Number(event.target.value))}
            className="absolute inset-0 h-7 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={end}
            onChange={(event) => onEndChange(Number(event.target.value))}
            className="absolute inset-0 h-7 w-full appearance-none bg-transparent"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/60">
          <span>
            Time selection: {formatSeconds(start)} - {formatSeconds(end)}
          </span>
          <span>{duration}s</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineEditor;
