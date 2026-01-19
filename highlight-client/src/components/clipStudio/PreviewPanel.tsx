import TimelineEditor from "@/components/clipStudio/TimelineEditor";

interface PreviewPanelProps {
  imageUrl: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  maxDuration: number;
  totalDuration: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

const PreviewPanel = ({
  imageUrl,
  title,
  start,
  end,
  duration,
  maxDuration,
  totalDuration,
  onStartChange,
  onEndChange,
}: PreviewPanelProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-panel">
        <img src={imageUrl} alt={title} className="h-64 w-full object-cover" />
      </div>
      <TimelineEditor
        start={start}
        end={end}
        duration={duration}
        maxDuration={maxDuration}
        totalDuration={totalDuration}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
      />
    </div>
  );
};

export default PreviewPanel;
