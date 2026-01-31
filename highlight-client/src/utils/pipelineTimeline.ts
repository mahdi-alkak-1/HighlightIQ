export interface PipelineTimeline {
  recordingId: number;
  uploadStartedAt?: number;
  detectionCompletedAt?: number;
  publishRequestedAt?: number;
  publishCompletedAt?: number;
}

const STORAGE_KEY = "highlightiq_pipeline_timeline";
const PENDING_UPLOAD_KEY = "highlightiq_pending_upload";

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

export const readPendingUploadStartedAt = (): number | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(PENDING_UPLOAD_KEY);
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

export const markPendingUploadStarted = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(PENDING_UPLOAD_KEY, String(Date.now()));
};

export const clearPendingUpload = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(PENDING_UPLOAD_KEY);
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

export const clearPublishRequested = (recordingId: number) => {
  const current = readPipelineTimeline();
  if (!current || current.recordingId !== recordingId) {
    return;
  }
  const next: PipelineTimeline = {
    recordingId,
    uploadStartedAt: current.uploadStartedAt,
    detectionCompletedAt: current.detectionCompletedAt,
    publishRequestedAt: undefined,
    publishCompletedAt: current.publishCompletedAt,
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
