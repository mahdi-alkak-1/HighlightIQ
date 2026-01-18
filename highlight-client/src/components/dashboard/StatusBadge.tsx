import { UploadRecord } from "@/types/dashboard";

interface StatusBadgeProps {
  status: UploadRecord["status"];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles =
    status === "processing"
      ? "bg-brand-processing/15 text-brand-processing"
      : status === "deleted"
        ? "bg-red-500/15 text-red-400"
        : status === "failed"
          ? "bg-red-500/15 text-red-400"
          : "bg-brand-ready/15 text-brand-ready";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-semibold ${styles}`}
    >
      {status === "processing"
        ? "Processing"
        : status === "deleted"
          ? "Deleted"
          : status === "failed"
            ? "Failed"
            : status === "uploaded"
              ? "Uploaded"
              : "Published"}
    </span>
  );
};

export default StatusBadge;
