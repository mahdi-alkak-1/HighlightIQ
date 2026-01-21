export type ClipLibraryStatus = "Published" | "Ready" | "Failed" | "Draft";

export type ClipLibraryStatusFilter = "all" | "published" | "ready" | "failed";

export type ClipLibraryDateRange = "last30" | "last7" | "today";

export interface ClipLibraryItem {
  id: number;
  title: string;
  recordingTitle: string;
  game: string;
  createdAt: string;
  durationSeconds: number;
  status: ClipLibraryStatus;
  platform: "YouTube";
  views: number;
  likes: number;
  thumbnailAvailable: boolean;
}
