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
