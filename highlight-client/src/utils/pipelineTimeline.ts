export interface PipelineTimeline {
  recordingId: number;
  uploadStartedAt?: number;
  detectionCompletedAt?: number;
  publishRequestedAt?: number;
  publishCompletedAt?: number;
}

const STORAGE_KEY = "highlightiq_pipeline_timeline";

export const readPipelineTimeline = (): PipelineTimeline | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PipelineTimeline;
    if (!parsed.recordingId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writePipelineTimeline = (timeline: PipelineTimeline | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!timeline) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timeline));
};

export const markPublishRequested = (recordingId: number) => {
  const current = readPipelineTimeline();
  const next: PipelineTimeline = {
    recordingId,
    uploadStartedAt: current?.recordingId === recordingId ? current.uploadStartedAt : undefined,
    detectionCompletedAt: current?.recordingId === recordingId ? current.detectionCompletedAt : undefined,
    publishRequestedAt: Date.now(),
    publishCompletedAt: current?.recordingId === recordingId ? current.publishCompletedAt : undefined,
  };
  writePipelineTimeline(next);
};

export const markUploadStarted = (recordingId: number) => {
  const current = readPipelineTimeline();
  const next: PipelineTimeline = {
    recordingId,
    uploadStartedAt: Date.now(),
    detectionCompletedAt: current?.recordingId === recordingId ? current.detectionCompletedAt : undefined,
    publishRequestedAt: current?.recordingId === recordingId ? current.publishRequestedAt : undefined,
    publishCompletedAt: current?.recordingId === recordingId ? current.publishCompletedAt : undefined,
  };
  writePipelineTimeline(next);
};
