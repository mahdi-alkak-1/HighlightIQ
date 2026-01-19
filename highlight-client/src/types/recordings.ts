export interface RecordingApi {
  ID: number;
  UUID: string;
  UserID: number;
  Title: string;
  Game: string;
  OriginalName: string;
  StoragePath: string;
  ThumbnailPath: string;
  DurationSeconds: number;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface RecordingCreateInput {
  title: string;
  game: "Fortnite" | "Valorant";
  file: File;
}
