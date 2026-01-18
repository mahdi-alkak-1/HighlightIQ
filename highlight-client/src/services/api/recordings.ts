import { request } from "@/services/api/client";
import { ApiListResponse } from "@/types/api";
import { RecordingApi } from "@/types/recordings";

export const getRecordings = async () => {
  return request<ApiListResponse<RecordingApi>>("/recordings");
};
