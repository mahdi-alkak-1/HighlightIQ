import { request } from "@/services/api/client";
import { ApiItemsResponse } from "@/types/api";
import { ClipCandidateApi } from "@/types/clipCandidates";
import { getAuthToken } from "@/utils/authStorage";

export const getClipCandidates = async (recordingUUID: string) => {
  return request<ApiItemsResponse<ClipCandidateApi>>(
    `/recordings/${recordingUUID}/clip-candidates`
  );
};

export const getClipCandidateThumbnail = async (candidateId: number): Promise<string> => {
  const token = getAuthToken();
  const response = await fetch(`/clip-candidates/${candidateId}/thumbnail`, {
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
