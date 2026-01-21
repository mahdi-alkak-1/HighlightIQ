import { request } from "@/services/api/client";
import { ApiListResponse } from "@/types/api";
import { YoutubePublishApi } from "@/types/youtubePublishes";

export const getYoutubePublishesByClip = async (clipId: number) => {
  const response = await request<ApiListResponse<YoutubePublishApi>>(
    `/clips/${clipId}/youtube-publishes`
  );
  return {
    data: response.data ?? [],
  };
};

interface CreateYoutubePublishInput {
  youtube_video_id: string;
  youtube_url: string;
  status?: "queued" | "uploaded" | "failed";
}

export const createYoutubePublish = async (
  clipId: number,
  input: CreateYoutubePublishInput
) => {
  return request<YoutubePublishApi>(`/clips/${clipId}/youtube-publishes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
};
