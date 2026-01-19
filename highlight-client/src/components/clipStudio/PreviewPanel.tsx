import TimelineEditor from "@/components/clipStudio/TimelineEditor";

interface PreviewPanelProps {
  start: number;
  end: number;
  duration: number;
  maxDuration: number;
  totalDuration: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

const PreviewPanel = ({
  start,
  end,
  duration,
  maxDuration,
  totalDuration,
  onStartChange,
  onEndChange,
}: PreviewPanelProps) => {
  return (
    <TimelineEditor
      start={start}
      end={end}
      duration={duration}
      maxDuration={maxDuration}
      totalDuration={totalDuration}
      onStartChange={onStartChange}
      onEndChange={onEndChange}
    />
  );
};

export default PreviewPanel;
