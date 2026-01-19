interface RecordingStatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  uploaded: "bg-brand-blue/15 text-brand-blue",
  processing: "bg-brand-processing/15 text-brand-processing",
  used: "bg-brand-ready/15 text-brand-ready",
  failed: "bg-red-500/15 text-red-400",
};

const RecordingStatusBadge = ({ status }: RecordingStatusBadgeProps) => {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const style = statusStyles[status] ?? "bg-white/10 text-white/60";

  return (
    <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-semibold ${style}`}>
      {label}
    </span>
  );
};

export default RecordingStatusBadge;
