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
                  {/* Professional YouTube icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-red-500"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M21.58 7.19a2.75 2.75 0 0 0-1.93-1.95C17.86 4.75 12 4.75 12 4.75s-5.86 0-7.65.49A2.75 2.75 0 0 0 2.42 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.93 1.95c1.79.49 7.65.49 7.65.49s5.86 0 7.65-.49a2.75 2.75 0 0 0 1.93-1.95A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.42-4.81Z"
                    />
                    {/* play triangle (cutout-ish) */}
                    <path
                      fill="#0b1220"
                      d="M10.2 15.2V8.8L15.7 12l-5.5 3.2Z"
                    />
                  </svg>

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
