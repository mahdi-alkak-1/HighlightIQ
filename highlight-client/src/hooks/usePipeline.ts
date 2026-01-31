import { useEffect, useMemo, useRef, useState } from "react";
import { getClipCandidates } from "@/services/api/clipCandidates";
import { getClipsByRecording } from "@/services/api/clips";
import { getRecordings } from "@/services/api/recordings";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { PipelineStepData } from "@/types/dashboard";
import { ClipCandidateApi } from "@/types/clipCandidates";
import { ClipApi } from "@/types/clips";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { isApiError } from "@/types/api";
import { getAuthToken } from "@/utils/authStorage";
import {
  PipelineTimeline,
  readPendingUploadStartedAt,
  readPipelineTimeline,
  writePipelineTimeline,
} from "@/utils/pipelineTimeline";

export const usePipeline = () => {
  const [stages, setStages] = useState<PipelineStepData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<PipelineTimeline | null>(readPipelineTimeline());
  const [tick, setTick] = useState(Date.now());
  const detectionWasRunning = useRef(false);
  const initialLoad = useRef(true);
  const errorDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (initialLoad.current) {
        setIsLoading(true);
      }
      if (errorDelayRef.current) {
        clearTimeout(errorDelayRef.current);
        errorDelayRef.current = null;
      }
      setErrorMessage(null);

      try {
        const token = getAuthToken();
        if (!token) {
          setErrorMessage("Please sign in to view your pipeline.");
          return;
        }

        const recordingsResponse = await getRecordings();
        if (!isMounted) {
          return;
        }

        const recordings = recordingsResponse.data ?? [];
        const latest = recordings
          .slice()
          .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())[0];
        const latestCreatedAt = latest ? new Date(latest.CreatedAt).getTime() : null;

        const pendingUploadAt = readPendingUploadStartedAt();
        const pendingUploadActive =
          pendingUploadAt !== null && Date.now() - pendingUploadAt < 15 * 60 * 1000;
        const pendingBeforeRecording =
          pendingUploadActive && (latestCreatedAt === null || latestCreatedAt < pendingUploadAt);

        if (!latest) {
          if (pendingBeforeRecording) {
            setStages(buildUploadingStages());
            return;
          }
          setStages(buildEmptyStages());
          setTimeline(null);
          writePipelineTimeline(null);
          return;
        }

        if (pendingBeforeRecording) {
          setStages(buildUploadingStages());
          return;
        }

        const [candidatesResponse, clipsResponse] = await Promise.all([
          getClipCandidates(latest.UUID),
          getClipsByRecording(latest.UUID),
        ]);

        const candidates = candidatesResponse.items ?? [];
        const clips = clipsResponse.data ?? [];

        const publishLists = await Promise.allSettled(
          clips.map((clip) => getYoutubePublishesByClip(clip.id))
        );

        const publishes = publishLists.flatMap((result) =>
          result.status === "fulfilled" ? result.value.data : []
        );

        const storedTimeline = readPipelineTimeline();
        const latestCreatedAtMs = new Date(latest.CreatedAt).getTime();
        const hasActiveRecording =
          latest.Status === "uploaded" || latest.Status === "processing" || latest.Status === "used";
        const sameRecording = storedTimeline?.recordingId === latest.ID;
        let seedTimeline = sameRecording ? storedTimeline : null;

        if (hasActiveRecording && !seedTimeline) {
          seedTimeline = { recordingId: latest.ID, uploadStartedAt: latestCreatedAtMs };
        } else if (hasActiveRecording && seedTimeline && !seedTimeline.uploadStartedAt) {
          seedTimeline = { ...seedTimeline, uploadStartedAt: latestCreatedAtMs };
        }

        if (seedTimeline) {
          writePipelineTimeline(seedTimeline);
        } else {
          writePipelineTimeline(null);
        }
        setTimeline(seedTimeline);

        const nextTimeline = updateTimeline({
          latestRecording: latest,
          candidates,
          publishes,
          previous: seedTimeline ?? timeline,
          detectionWasRunning,
        });
        setTimeline(nextTimeline);
        writePipelineTimeline(nextTimeline);
        setStages(
          buildStages({
            latestRecording: latest,
            candidates,
            publishes,
            timeline: nextTimeline,
            now: tick,
          })
        );
      } catch (error) {
        if (isMounted) {
          const pendingUploadAt = readPendingUploadStartedAt();
          const pendingUploadActive =
            pendingUploadAt !== null && Date.now() - pendingUploadAt < 15 * 60 * 1000;
          if (pendingUploadActive) {
            setStages(buildUploadingStages());
            setErrorMessage(null);
            return;
          }
          const nextMessage = isApiError(error)
            ? error.data?.message ?? "Unable to load pipeline."
            : "Unable to load pipeline.";
          if (initialLoad.current) {
            errorDelayRef.current = setTimeout(() => {
              if (isMounted) {
                setErrorMessage(nextMessage);
              }
              errorDelayRef.current = null;
            }, 1500);
          } else {
            setErrorMessage(nextMessage);
          }
        }
      } finally {
        if (isMounted) {
          if (initialLoad.current) {
            setIsLoading(false);
            initialLoad.current = false;
          }
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      if (errorDelayRef.current) {
        clearTimeout(errorDelayRef.current);
        errorDelayRef.current = null;
      }
    };
  }, [tick]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = readPipelineTimeline();
      if (
        stored?.recordingId !== timeline?.recordingId ||
        stored?.publishRequestedAt !== timeline?.publishRequestedAt ||
        stored?.uploadStartedAt !== timeline?.uploadStartedAt ||
        stored?.detectionCompletedAt !== timeline?.detectionCompletedAt
      ) {
        setTimeline(stored);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [timeline]);

  return {
    stages,
    isLoading,
    errorMessage,
  };
};

const buildEmptyStages = (): PipelineStepData[] => {
  return [
    { id: "upload", label: "Upload", status: "0 pending", count: 0, state: "disabled" },
    { id: "detecting", label: "Detecting", status: "0 processing", count: 0, state: "disabled" },
    { id: "review", label: "Review", status: "0 ready", count: 0, state: "disabled" },
    { id: "publish", label: "Publish", status: "0 queued", count: 0, state: "disabled" },
    { id: "sync", label: "Sync", status: "0 syncing", count: 0, state: "disabled" },
  ];
};

const buildUploadingStages = (): PipelineStepData[] => {
  return [
    { id: "upload", label: "Upload", status: "1 pending", count: 1, state: "active" },
    { id: "detecting", label: "Detecting", status: "0 processing", count: 0, state: "disabled" },
    { id: "review", label: "Review", status: "0 ready", count: 0, state: "disabled" },
    { id: "publish", label: "Publish", status: "0 queued", count: 0, state: "disabled" },
    { id: "sync", label: "Sync", status: "0 syncing", count: 0, state: "disabled" },
  ];
};

const updateTimeline = ({
  latestRecording,
  candidates,
  publishes,
  previous,
  detectionWasRunning,
}: {
  latestRecording: RecordingApi;
  candidates: ClipCandidateApi[];
  publishes: YoutubePublishApi[];
  previous: PipelineTimeline | null;
  detectionWasRunning: React.MutableRefObject<boolean>;
}): PipelineTimeline => {
  const recordingId = latestRecording.ID;
  let next: PipelineTimeline = previous?.recordingId === recordingId ? { ...previous } : { recordingId };

  if (!next.uploadStartedAt) {
    detectionWasRunning.current = false;
    return { recordingId };
  }

  const detectionRunning =
    latestRecording.Status === "processing" ||
    (latestRecording.Status === "uploaded" &&
      next.uploadStartedAt !== undefined &&
      candidates.length === 0 &&
      !next.detectionCompletedAt);
  if (detectionRunning) {
    detectionWasRunning.current = true;
    next.detectionCompletedAt = undefined;
  } else if (detectionWasRunning.current && !next.detectionCompletedAt) {
    detectionWasRunning.current = false;
    next.detectionCompletedAt = resolveDetectionCompletedAt(latestRecording, candidates);
  } else if (!next.detectionCompletedAt && candidates.length > 0) {
    next.detectionCompletedAt = resolveDetectionCompletedAt(latestRecording, candidates);
  } else if (!next.detectionCompletedAt && latestRecording.Status == "used") {
    next.detectionCompletedAt = resolveDetectionCompletedAt(latestRecording, candidates);
  }

  const latestPublish = resolveLatestPublish(publishes);
  const published = isPublished(latestPublish);
  if (published && !next.publishCompletedAt) {
    next.publishCompletedAt = resolvePublishCompletedAt(latestPublish);
  }

  if (
    next.uploadStartedAt &&
    !next.detectionCompletedAt &&
    latestRecording.Status === "failed"
  ) {
    next.uploadStartedAt = undefined;
  }

  return next;
};

const resolveDetectionCompletedAt = (recording: RecordingApi, candidates: ClipCandidateApi[]) => {
  if (candidates.length > 0) {
    const latest = candidates
      .slice()
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())[0];
    return new Date(latest.CreatedAt).getTime();
  }
  return new Date(recording.UpdatedAt).getTime();
};

const resolveLatestPublish = (publishes: YoutubePublishApi[]) => {
  if (publishes.length === 0) {
    return null;
  }
  return publishes
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
};

const isPublished = (publish: YoutubePublishApi | null) => {
  if (!publish) {
    return false;
  }
  return publish.status === "published" || publish.status === "uploaded";
};

const resolvePublishCompletedAt = (publish: YoutubePublishApi | null) => {
  if (!publish) {
    return Date.now();
  }
  return new Date(publish.updated_at).getTime();
};

const buildStages = ({
  latestRecording,
  candidates,
  publishes,
  timeline,
  now,
}: {
  latestRecording: RecordingApi;
  candidates: ClipCandidateApi[];
  publishes: YoutubePublishApi[];
  timeline: PipelineTimeline | null;
  now: number;
}): PipelineStepData[] => {
  const pipelineEnabled = Boolean(timeline?.uploadStartedAt);
  if (!pipelineEnabled) {
    return buildEmptyStages();
  }

  const detectionRunning = latestRecording.Status === "processing";
  const detectionCompletedAt = timeline?.detectionCompletedAt;
  const detectionWindowEnd = detectionCompletedAt ?? null;

  const reviewActive = detectionCompletedAt !== undefined;
  const reviewComplete = false;

  const publishRequestedAt = timeline?.publishRequestedAt;
  const latestPublish = resolveLatestPublish(publishes);
  const published = isPublished(latestPublish);
  const publishCompletedAt = timeline?.publishCompletedAt;

  const publishActive = Boolean(publishRequestedAt) && !published;
  const publishComplete = Boolean(publishCompletedAt);

  const syncEnd = publishCompletedAt ? publishCompletedAt + 5000 : null;
  const syncActive = publishCompletedAt !== undefined && syncEnd !== null && now < syncEnd;
  const syncComplete = syncEnd !== null && now >= syncEnd;

  const uploadTriggered = Boolean(timeline?.uploadStartedAt);
  const uploadActive = uploadTriggered && latestRecording.Status === "uploaded";
  const uploadState = uploadActive || detectionRunning || detectionCompletedAt ? (uploadActive ? "active" : "complete") : "disabled";

  const detectingState =
    detectionRunning ||
    (detectionCompletedAt !== undefined && detectionWindowEnd !== null && now < detectionWindowEnd)
      ? "active"
      : detectionCompletedAt
        ? "complete"
        : "disabled";

  const reviewState = reviewActive ? "active" : "disabled";
  const publishState = publishActive ? "active" : publishComplete ? "complete" : "disabled";
  const syncState = syncActive ? "active" : syncComplete ? "complete" : "disabled";

  return [
    {
      id: "upload",
      label: "Upload",
      count: uploadActive || detectionRunning || detectionCompletedAt ? 1 : 0,
      status: formatStatus(uploadActive ? 1 : 0, "pending"),
      state: uploadState,
    },
    {
      id: "detecting",
      label: "Detecting",
      count: candidates.length,
      status: formatStatus(candidates.length, "processing"),
      state: detectingState,
    },
    {
      id: "review",
      label: "Review",
      count: candidates.length,
      status: formatStatus(candidates.length, "review"),
      state: reviewState,
    },
    {
      id: "publish",
      label: "Publish",
      count: publishes.length > 0 ? publishes.length : publishRequestedAt ? 1 : 0,
      status: formatStatus(publishes.length > 0 ? publishes.length : publishRequestedAt ? 1 : 0, "queued"),
      state: publishState,
    },
    {
      id: "sync",
      label: "Sync",
      count: publishes.length,
      status: formatStatus(publishes.length, "syncing"),
      state: syncState,
    },
  ];
};

const formatStatus = (count: number, label: string) => {
  return `${count} ${label}`;
};
