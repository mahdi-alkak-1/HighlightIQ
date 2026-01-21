import { ClipLibraryDateRange, ClipLibraryStatusFilter } from "@/types/clipsLibrary";

export const clipStatusFilters: Array<{ id: ClipLibraryStatusFilter; label: string }> = [
  { id: "all", label: "Status: All" },
  { id: "published", label: "Status: Published" },
  { id: "ready", label: "Status: Ready" },
  { id: "failed", label: "Status: Failed" },
];

export const clipGameFilters = [
  { id: "all", label: "Game: All" },
  { id: "Fortnite", label: "Game: Fortnite" },
  { id: "Valorant", label: "Game: Valorant" },
];

export const clipDateRanges: Array<{ id: ClipLibraryDateRange; label: string }> = [
  { id: "last30", label: "Date: Last 30 Days" },
  { id: "last7", label: "Date: Last 7 Days" },
  { id: "today", label: "Date: Today" },
];

export const clipLibraryPageSize = 5;
