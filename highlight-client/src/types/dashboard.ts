export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
}

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  footnote?: string;
}

export interface PipelineStepData {
  id: string;
  label: string;
  status: string;
  count: number;
  state: "active" | "pending" | "complete" | "disabled";
}

export interface UploadRecord {
  id: string;
  title: string;
  date: string;
  status: "processing" | "published" | "uploaded" | "failed" | "deleted";
  platform: string;
  thumbnail: string;
}

export interface DashboardData {
  stats: StatCardData[];
  uploads: UploadRecord[];
}

export type DashboardRange = "last7" | "today";
