import { useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import UploadPanel from "@/components/recordings/UploadPanel";
import RecordingsTable from "@/components/recordings/RecordingsTable";
import RecordingsToolbar from "@/components/recordings/RecordingsToolbar";
import { useRecordings } from "@/hooks/useRecordings";
import {
  RecordingDateFilter,
  RecordingStatusFilter,
  dateFilters,
} from "@/data/recordingsOptions";
import { RecordingApi } from "@/types/recordings";

const filterByStatus = (items: RecordingApi[], status: RecordingStatusFilter) => {
  if (status === "all") {
    return items;
  }
  return items.filter((rec) => rec.Status === status);
};

const filterByDate = (items: RecordingApi[], range: RecordingDateFilter) => {
  if (range === "last30" || range === "last7") {
    const now = new Date();
    const days = range === "last30" ? 30 : 7;
    return items.filter((rec) => {
      const created = new Date(rec.CreatedAt);
      const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= days;
    });
  }

  const today = new Date();
  return items.filter((rec) => {
    const created = new Date(rec.CreatedAt);
    return (
      created.getFullYear() === today.getFullYear() &&
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    );
  });
};

const filterByQuery = (items: RecordingApi[], query: string) => {
  if (!query) {
    return items;
  }
  const lower = query.toLowerCase();
  return items.filter((rec) =>
    `${rec.Title} ${rec.OriginalName}`.toLowerCase().includes(lower)
  );
};

const RecordingsPage = () => {
  const { recordings, thumbnails, isLoading, errorMessage, isUploading, uploadProgress, upload } =
    useRecordings();
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("Fortnite");
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecordingStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<RecordingDateFilter>(dateFilters[0]);

  const filtered = useMemo(() => {
    const byStatus = filterByStatus(recordings, statusFilter);
    const byDate = filterByDate(byStatus, dateFilter);
    return filterByQuery(byDate, query);
  }, [recordings, statusFilter, dateFilter, query]);

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    const created = await upload({ title, game: game as "Fortnite" | "Valorant", file });
    if (created) {
      setTitle("");
      setFile(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Recordings</h1>
            <p className="text-xs text-white/50">
              Upload gameplay recordings and generate highlight clips.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <UploadPanel
          title={title}
          game={game}
          fileName={file?.name}
          isUploading={isUploading}
          progress={uploadProgress}
          onTitleChange={setTitle}
          onGameChange={setGame}
          onFileChange={setFile}
          onUpload={handleUpload}
        />

        <RecordingsToolbar
          query={query}
          status={statusFilter}
          dateRange={dateFilter}
          onQueryChange={setQuery}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateFilter}
        />

        <RecordingsTable recordings={filtered} isLoading={isLoading} thumbnails={thumbnails} />
      </div>
    </DashboardLayout>
  );
};

export default RecordingsPage;
