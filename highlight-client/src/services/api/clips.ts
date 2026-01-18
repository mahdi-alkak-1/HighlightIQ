import { request } from "@/services/api/client";
import { ApiListResponse } from "@/types/api";
import { ClipApi } from "@/types/clips";
import { getAuthToken } from "@/utils/authStorage";

export const getClips = async () => {
  return request<ApiListResponse<ClipApi>>("/clips");
};

export const getClipThumbnail = async (clipId: number): Promise<string> => {
  const token = getAuthToken();
  const response = await fetch(`/clips/${clipId}/thumbnail`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("thumbnail fetch failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
