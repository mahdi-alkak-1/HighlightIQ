import { AnalyticsRange } from "@/types/analytics";

export const analyticsRanges: Array<{ id: AnalyticsRange; label: string }> = [
  { id: "last30", label: "Last 30 Days" },
  { id: "last7", label: "Last 7 Days" },
  { id: "today", label: "Today" },
];
