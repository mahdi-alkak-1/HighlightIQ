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
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 py-3">
      <div className="flex items-center justify-between text-[10px] text-white/60">
        <span>Timeline</span>
        <span>
          Duration: {duration}s / {maxDuration}s
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <svg viewBox="0 0 100 40" className="h-16 w-full">
          <polyline
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            points={points}
          />
        </svg>

        <div className="relative h-6">
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={start}
            onChange={(event) => onStartChange(Number(event.target.value))}
            className="absolute inset-0 h-6 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={end}
            onChange={(event) => onEndChange(Number(event.target.value))}
            className="absolute inset-0 h-6 w-full appearance-none bg-transparent"
          />
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-blue"
            style={{
              left: `${(start / totalDuration) * 100}%`,
              width: `${((end - start) / totalDuration) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-blue"
            style={{ left: `calc(${(start / totalDuration) * 100}% - 6px)` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-blue"
            style={{ left: `calc(${(end / totalDuration) * 100}% - 6px)` }}
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
