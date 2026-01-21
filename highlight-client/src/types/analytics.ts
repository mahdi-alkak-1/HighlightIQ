export type AnalyticsRange = "last30" | "last7" | "today";

export interface AnalyticsStat {
  label: string;
  value: string;
  trend?: string;
}

export interface AnalyticsSeriesPoint {
  label: string;
  value: number;
}

export interface AnalyticsTopClip {
  id: number;
  title: string;
  recordingTitle: string;
  views: number;
}
