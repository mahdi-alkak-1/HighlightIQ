import { request } from "@/services/api/client";
import { ApiListResponse } from "@/types/api";
import { ClipApi } from "@/types/clips";
import { getAuthToken } from "@/utils/authStorage";

export const getClips = async () => {
  return request<ApiListResponse<ClipApi>>("/clips");
};

export const getClipsByRecording = async (recordingUUID: string) => {
  return request<ApiListResponse<ClipApi>>(
    `/clips?recording_uuid=${encodeURIComponent(recordingUUID)}`
  );
};

interface CreateClipInput {
  recording_uuid: string;
  candidate_id: number;
  title: string;
  caption?: string | null;
  start_ms: number;
  end_ms: number;
}

export const createClip = async (input: CreateClipInput) => {
  return request<ClipApi>("/clips", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const exportClip = async (clipId: number) => {
  return request<ClipApi>(`/clips/${clipId}/export`, {
    method: "POST",
  });
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
