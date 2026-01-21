import RecordingStatusBadge from "@/components/recordings/RecordingStatusBadge";
import { RecordingApi } from "@/types/recordings";
import { formatDate, formatDuration } from "@/utils/formatters";

interface RecordingsTableProps {
  recordings: RecordingApi[];
  isLoading?: boolean;
  thumbnails?: Record<string, string>;
}

const RecordingsTable = ({ recordings, isLoading, thumbnails }: RecordingsTableProps) => {
  return (
    <section className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <h3 className="text-sm font-semibold text-white">Recent Uploads</h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-brand-border">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 bg-white/5 px-4 py-2 text-[11px] uppercase text-white/50">
          <span>Video</span>
          <span>Game</span>
          <span>Duration</span>
          <span>Uploaded</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading && (
            <div className="px-4 py-6 text-sm text-white/60">Loading recordings...</div>
          )}
          {!isLoading && recordings.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">No recordings yet.</div>
          )}
          {!isLoading &&
            recordings.map((rec) => (
              <div
                key={rec.UUID}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 overflow-hidden rounded-md bg-white/10">
                    {thumbnails?.[rec.UUID] ? (
                      <img
                        src={thumbnails[rec.UUID]}
                        alt={rec.Title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm text-white">{rec.Title}</p>
                    <p className="text-xs text-white/50">{rec.OriginalName}</p>
                  </div>
                </div>
                <span className="text-xs text-white/60">{rec.Game}</span>
                <span className="text-xs text-white/60">
                  {formatDuration(rec.DurationSeconds)}
                </span>
                <span className="text-xs text-white/60">{formatDate(rec.CreatedAt)}</span>
                <RecordingStatusBadge status={rec.Status} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default RecordingsTable;
