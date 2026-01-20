import TimelineEditor from "@/components/clipStudio/TimelineEditor";

interface PreviewPanelProps {
  start: number;
  end: number;
  duration: number;
  maxDuration: number;
  totalDuration: number;
  onRangeChange: (start: number, end: number) => void;
}

const PreviewPanel = ({
  start,
  end,
  duration,
  maxDuration,
  totalDuration,
  onRangeChange,
}: PreviewPanelProps) => {
  return (
    <TimelineEditor
      start={start}
      end={end}
      duration={duration}
      maxDuration={maxDuration}
      totalDuration={totalDuration}
      onChange={onRangeChange}
    />
  );
};

export default PreviewPanel;
