import { request } from "@/services/api/client";
import { ApiItemsResponse } from "@/types/api";
import { ClipCandidateApi } from "@/types/clipCandidates";

export const getClipCandidates = async (recordingUUID: string) => {
  return request<ApiItemsResponse<ClipCandidateApi>>(
    `/recordings/${recordingUUID}/clip-candidates`
  );
};
