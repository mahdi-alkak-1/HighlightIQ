export interface ClipCandidateApi {
  ID: number;
  RecordingID: number;
  StartMS: number;
  EndMS: number;
  Score: number;
  DetectedJSON?: string | null;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}
