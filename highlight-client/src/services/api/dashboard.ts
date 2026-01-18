import { request } from "@/services/api/client";
import { PipelineStepData } from "@/types/dashboard";

interface PipelineResponse {
  stages: PipelineStepData[];
}

export const getPipeline = async () => {
  return request<PipelineResponse>("/dashboard/pipeline");
};
