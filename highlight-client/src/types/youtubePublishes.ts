export interface YoutubePublishApi {
  id: number;
  clip_id: number;
  youtube_video_id: string;
  youtube_url?: string | null;
  status: string;
  published_at?: string | null;
  last_synced_at?: string | null;
  views: number;
  likes: number;
  comments: number;
  analytics?: string | null;
  created_at: string;
  updated_at: string;
}
