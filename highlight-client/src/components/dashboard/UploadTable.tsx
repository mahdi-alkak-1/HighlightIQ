import StatusBadge from "@/components/dashboard/StatusBadge";
import { UploadRecord } from "@/types/dashboard";

interface UploadTableProps {
  uploads: UploadRecord[];
  isLoading?: boolean;
}

const UploadTable = ({ uploads, isLoading }: UploadTableProps) => {
  return (
    <section className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <h3 className="text-sm font-semibold text-white">Recent Uploads</h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-brand-border">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-white/5 px-4 py-2 text-[11px] uppercase text-white/50">
          <span>Video</span>
          <span>Date</span>
          <span>Status</span>
          <span>Platform</span>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading && (
            <div className="px-4 py-6 text-sm text-white/60">Loading uploads...</div>
          )}
          {!isLoading && uploads.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">No uploads yet.</div>
          )}
          {!isLoading &&
            uploads.map((upload) => (
              <div
                key={upload.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={upload.thumbnail}
                    alt={upload.title}
                    className="h-10 w-16 rounded-md object-cover"
                  />
                  <span className="text-sm text-white">{upload.title}</span>
                </div>
                <span className="text-xs text-white/60">{upload.date}</span>
                <StatusBadge status={upload.status} />
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                  {upload.platform}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default UploadTable;
