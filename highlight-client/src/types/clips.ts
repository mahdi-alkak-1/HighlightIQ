export interface ClipApi {
  id: number;
  user_id: number;
  recording_id: number;
  candidate_id?: number | null;
  title: string;
  caption?: string | null;
  start_ms: number;
  end_ms: number;
  duration_seconds: number;
  status: string;
  export_path?: string | null;
  thumbnail_path?: string | null;
  created_at: string;
  updated_at: string;
}
