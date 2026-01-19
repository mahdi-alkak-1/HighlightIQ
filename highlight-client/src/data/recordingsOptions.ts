export const gameOptions = ["Fortnite", "Valorant"] as const;

export const statusFilters = ["all", "uploaded","used", "failed"] as const;
export type RecordingStatusFilter = (typeof statusFilters)[number];

export const dateFilters = ["last30", "last7", "today"] as const;
export type RecordingDateFilter = (typeof dateFilters)[number];
