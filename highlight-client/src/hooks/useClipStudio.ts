import { useEffect, useMemo, useRef, useState } from "react";
import { getClipCandidateThumbnail, getClipCandidates } from "@/services/api/clipCandidates";
import { createClip, exportClip, getClipsByRecording, publishClip, updateClip } from "@/services/api/clips";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { getRecordingThumbnail, getRecordingVideo, getRecordings } from "@/services/api/recordings";
import { ClipCandidateApi } from "@/types/clipCandidates";
import { ClipApi } from "@/types/clips";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { isApiError } from "@/types/api";
import { clamp, formatSeconds } from "@/utils/time";
import { markPublishRequested } from "@/utils/pipelineTimeline";
import { maxClipDurationSeconds } from "@/data/clipStudioData";

interface CandidateView {
  id: number;
  startMs: number;
  endMs: number;
  durationSeconds: number;
  status: string;
  label: string;
  timeLabel: string;
  thumbnailAvailable: boolean;
}

interface StudioState {
  isLoading: boolean;
  errorMessage: string | null;
}

const toCandidateView = (candidate: ClipCandidateApi): CandidateView => {
  const startSec = Math.floor(candidate.StartMS / 1000);
  const endSec = Math.ceil(candidate.EndMS / 1000);
  const durationSeconds = Math.max(1, endSec - startSec);
  return {
    id: candidate.ID,
    startMs: candidate.StartMS,
    endMs: candidate.EndMS,
    durationSeconds,
    status: candidate.Status,
    label: `Candidate ${candidate.ID}`,
    timeLabel: `${formatSeconds(startSec)} - ${formatSeconds(endSec)}`,
    thumbnailAvailable: Boolean(candidate.ThumbnailPath),
  };
};

const resolveRecordingDuration = (recording: RecordingApi | null) => {
  if (!recording) {
    return 0;
  }
  return Math.max(1, recording.DurationSeconds || 0);
};

export const useClipStudio = () => {
  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [activeRecording, setActiveRecording] = useState<RecordingApi | null>(null);
  const [recordingThumbnail, setRecordingThumbnail] = useState<string | null>(null);
  const [recordingVideo, setRecordingVideo] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [candidateThumbnails, setCandidateThumbnails] = useState<Record<number, string>>({});
  const candidateThumbRef = useRef<Record<number, string>>({});
  const [clips, setClips] = useState<ClipApi[]>([]);
  const [publishes, setPublishes] = useState<YoutubePublishApi[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [timelineStart, setTimelineStart] = useState(0);
  const [timelineEnd, setTimelineEnd] = useState(0);
  const [clipTitle, setClipTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishRequested, setPublishRequested] = useState(false);
  const [publishConnected, setPublishConnected] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [confirmPublishInput, setConfirmPublishInput] = useState<{
    title: string;
    description: string;
    privacyStatus: "public" | "unlisted" | "private";
  } | null>(null);
  const publishPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const publishPollAttempts = useRef(0);
  const publishedNoticeRef = useRef<Set<number>>(new Set());
  const [state, setState] = useState<StudioState>({
    isLoading: true,
    errorMessage: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadRecordings = async () => {
      setState({ isLoading: true, errorMessage: null });
      try {
        const response = await getRecordings();
        if (!isMounted) {
          return;
        }
        const items = response.data ?? [];
        setRecordings(items);
        setActiveRecording(items[0] ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (isApiError(error)) {
          setState({ isLoading: false, errorMessage: error.data?.message ?? "Unable to load recordings." });
        } else {
          setState({ isLoading: false, errorMessage: "Unable to load recordings." });
        }
        return;
      }
      if (isMounted) {
        setState({ isLoading: false, errorMessage: null });
      }
    };

    loadRecordings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStudioData = async (recording: RecordingApi) => {
      setState({ isLoading: true, errorMessage: null });
      try {
        const [candidateResponse, clipsResponse] = await Promise.all([
          getClipCandidates(recording.UUID),
          getClipsByRecording(recording.UUID),
        ]);

        if (!isMounted) {
          return;
        }

        const nextCandidates = candidateResponse.items.map(toCandidateView);
        setCandidates(nextCandidates);
        setClips(clipsResponse.data ?? []);
        setSelectedCandidateId((prev) => prev ?? nextCandidates[0]?.id ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (isApiError(error)) {
          setState({ isLoading: false, errorMessage: error.data?.message ?? "Unable to load candidates." });
        } else {
          setState({ isLoading: false, errorMessage: "Unable to load candidates." });
        }
        return;
      }

      if (isMounted) {
        setState({ isLoading: false, errorMessage: null });
      }
    };

    if (activeRecording) {
      loadStudioData(activeRecording);
    } else {
      setCandidates([]);
      setClips([]);
    }

    return () => {
      isMounted = false;
    };
  }, [activeRecording]);

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async (recording: RecordingApi) => {
      try {
        const url = await getRecordingThumbnail(recording.UUID);
        if (isMounted) {
          setRecordingThumbnail(url);
        }
      } catch {
        if (isMounted) {
          setRecordingThumbnail(null);
        }
      }
    };

    const loadVideo = async (recording: RecordingApi) => {
      try {
        const url = await getRecordingVideo(recording.UUID);
        if (isMounted) {
          setRecordingVideo(url);
        }
      } catch {
        if (isMounted) {
          setRecordingVideo(null);
        }
      }
    };

    if (activeRecording) {
      loadThumbnail(activeRecording);
      loadVideo(activeRecording);
    } else {
      setRecordingThumbnail(null);
      setRecordingVideo(null);
    }

    return () => {
      isMounted = false;
    };
  }, [activeRecording]);

  useEffect(() => {
    let isMounted = true;

    const cleanup = (items: Record<number, string>) => {
      Object.values(items).forEach((url) => URL.revokeObjectURL(url));
    };

    const loadCandidateThumbnails = async () => {
      const ids = candidates.filter((item) => item.thumbnailAvailable).map((item) => item.id);
      if (ids.length === 0) {
        cleanup(candidateThumbRef.current);
        candidateThumbRef.current = {};
        setCandidateThumbnails({});
        return;
      }

      const results = await Promise.allSettled(ids.map((id) => getClipCandidateThumbnail(id)));
      if (!isMounted) {
        return;
      }

      const next: Record<number, string> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          next[ids[index]] = result.value;
        }
      });
      cleanup(candidateThumbRef.current);
      candidateThumbRef.current = next;
      setCandidateThumbnails(next);
    };

    loadCandidateThumbnails();

    return () => {
      isMounted = false;
    };
  }, [candidates]);

  const recordingDuration = resolveRecordingDuration(activeRecording);

  const selectedCandidate = useMemo(
    () => candidates.find((item) => item.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  );

  const selectedClip = useMemo(() => {
    if (!selectedCandidate) {
      return null;
    }
    return clips.find((clip) => clip.candidate_id === selectedCandidate.id) ?? null;
  }, [clips, selectedCandidate]);

  useEffect(() => {
    if (!selectedCandidate) {
      return;
    }
    const startSec = Math.floor(selectedCandidate.startMs / 1000);
    const endSec = Math.ceil(selectedCandidate.endMs / 1000);
    const cappedEnd = Math.min(startSec + maxClipDurationSeconds, endSec);
    setTimelineStart(startSec);
    setTimelineEnd(Math.max(cappedEnd, startSec + 1));
    setClipTitle(selectedClip?.title || selectedCandidate.label);
  }, [selectedCandidate, selectedClip?.title]);

  const publishEntry = useMemo(() => {
    if (!selectedClip) {
      return null;
    }
    return publishes.find((item) => item.clip_id === selectedClip.id) ?? null;
  }, [publishes, selectedClip]);

  const hasGeneratedClip = Boolean(selectedClip?.export_path);
  const isPublishReady = Boolean(selectedClip && hasGeneratedClip);

  // ✅ NEW: Atomic update for start+end (prevents left handle "snapping back")
  const updateTimelineRange = (startSec: number, endSec: number) => {
    const safeTotal = Math.max(1, recordingDuration);

    let s = clamp(startSec, 0, Math.max(0, safeTotal - 1));
    let e = clamp(endSec, s + 1, safeTotal);

    // enforce max duration
    if (e - s > maxClipDurationSeconds) {
      e = Math.min(safeTotal, s + maxClipDurationSeconds);
    }

    // ensure at least 1s
    if (e <= s) {
      e = Math.min(safeTotal, s + 1);
    }

    setTimelineStart(s);
    setTimelineEnd(e);
  };

  // Keep existing single setters if you still use them elsewhere
  const updateTimelineStart = (value: number) => {
    const safeStart = clamp(value, 0, Math.max(0, recordingDuration - 1));
    let safeEnd = timelineEnd;
    if (safeEnd - safeStart > maxClipDurationSeconds) {
      safeEnd = Math.min(recordingDuration, safeStart + maxClipDurationSeconds);
    }
    if (safeEnd <= safeStart) {
      safeEnd = Math.min(recordingDuration, safeStart + 1);
    }
    setTimelineStart(safeStart);
    setTimelineEnd(safeEnd);
  };

  const updateTimelineEnd = (value: number) => {
    const safeEnd = clamp(value, 1, recordingDuration);
    let safeStart = timelineStart;
    if (safeEnd - safeStart > maxClipDurationSeconds) {
      safeStart = Math.max(0, safeEnd - maxClipDurationSeconds);
    }
    if (safeEnd <= safeStart) {
      safeStart = Math.max(0, safeEnd - 1);
    }
    setTimelineStart(safeStart);
    setTimelineEnd(safeEnd);
  };

  const handleGenerate = async (description: string) => {
    if (!activeRecording || !selectedCandidate) {
      return;
    }
    if (hasGeneratedClip) {
      return;
    }
    setIsGenerating(true);
    try {
      let clip = selectedClip;
      if (!clip) {
        const created = await createClip({
          recording_uuid: activeRecording.UUID,
          candidate_id: selectedCandidate.id,
          title: clipTitle || selectedCandidate.label,
          caption: description ? description : null,
          start_ms: Math.round(timelineStart * 1000),
          end_ms: Math.round(timelineEnd * 1000),
        });
        clip = created;
        setClips((prev) => [created, ...prev]);
      } else if (description && clip.caption !== description) {
        const updated = await updateClip(clip.id, {
          title: clipTitle || selectedCandidate.label,
          caption: description,
        });
        clip = updated;
        setClips((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
      if (!clip.export_path) {
        const exported = await exportClip(clip.id);
        setClips((prev) => prev.map((item) => (item.id === exported.id ? exported : item)));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sendPublishRequest = async (input: {
    title: string;
    description: string;
    privacyStatus: "public" | "unlisted" | "private";
  }) => {
    const trimmedDescription = input.description.trim();
    await publishClip(selectedClip!.id, {
      title: input.title,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      privacy_status: input.privacyStatus,
    });
    if (activeRecording) {
      markPublishRequested(activeRecording.ID);
    }
    setPublishRequested(true);
    setModalMessage("Publish request sent to workflow.");
  };

  const handlePublish = async (input: {
    title: string;
    description: string;
    privacyStatus: "public" | "unlisted" | "private";
  }) => {
    if (!selectedClip) {
      setModalMessage("Please generate a clip to publish.");
      return;
    }
    if (!hasGeneratedClip) {
      setModalMessage("Generate the clip before publishing.");
      return;
    }
    if (!publishConnected) {
      setModalMessage("Connect YouTube to publish this clip.");
      return;
    }
    if (publishEntry) {
      if (publishEntry.status === "uploaded") {
        setConfirmPublishInput(input);
        setModalMessage("This clip is already published. Publish it again?");
      } else {
        setModalMessage("This clip is still publishing. Please wait for it to finish.");
      }
      return;
    }
    if (publishRequested) {
      setModalMessage("This clip is still publishing. Please wait for it to finish.");
      return;
    }
    setIsPublishing(true);
    try {
      await sendPublishRequest(input);
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmPublishAgain = async () => {
    if (!confirmPublishInput || !selectedClip) {
      setConfirmPublishInput(null);
      setModalMessage(null);
      return;
    }
    setIsPublishing(true);
    try {
      await sendPublishRequest(confirmPublishInput);
    } finally {
      setConfirmPublishInput(null);
      setIsPublishing(false);
    }
  };

  const cancelConfirmPublish = () => {
    setConfirmPublishInput(null);
  };

  const refreshPublishes = async () => {
    if (!selectedClip) {
      setPublishes([]);
      return;
    }
    const response = await getYoutubePublishesByClip(selectedClip.id);
    setPublishes(response.data ?? []);
  };

  useEffect(() => {
    if (!selectedClip) {
      setPublishes([]);
      setPublishRequested(false);
      setConfirmPublishInput(null);
      return;
    }
    setPublishRequested(false);
    refreshPublishes();
  }, [selectedClip?.id]);

  useEffect(() => {
    if (!publishRequested || !selectedClip) {
      if (publishPollRef.current) {
        clearInterval(publishPollRef.current);
        publishPollRef.current = null;
      }
      publishPollAttempts.current = 0;
      return;
    }

    if (publishPollRef.current) {
      return;
    }

    publishPollRef.current = setInterval(() => {
      publishPollAttempts.current += 1;
      refreshPublishes();
      if (publishPollAttempts.current >= 24) {
        clearInterval(publishPollRef.current as ReturnType<typeof setInterval>);
        publishPollRef.current = null;
        publishPollAttempts.current = 0;
      }
    }, 5000);
    return () => {
      if (publishPollRef.current) {
        clearInterval(publishPollRef.current);
        publishPollRef.current = null;
      }
    };
  }, [publishRequested, selectedClip?.id]);

  useEffect(() => {
    if (!publishRequested || !selectedClip) {
      return;
    }
    const uploaded = publishes.find((item) => item.status === "uploaded");
    if (!uploaded || publishedNoticeRef.current.has(uploaded.id)) {
      return;
    }
    publishedNoticeRef.current.add(uploaded.id);
    setPublishRequested(false);
    setModalMessage("Clip successfully published.");
  }, [publishes, publishRequested, selectedClip?.id]);

  return {
    recordings,
    activeRecording,
    setActiveRecording,
    recordingThumbnail,
    recordingVideo,
    candidateThumbnails,
    candidates,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedCandidate,
    selectedClip,
    publishEntry,
    timelineStart,
    timelineEnd,
    recordingDuration,
    updateTimelineStart,
    updateTimelineEnd,
    updateTimelineRange, // ✅ export new atomic function
    clipTitle,
    setClipTitle,
    isGenerating,
    isPublishing,
    publishConnected,
    setPublishConnected,
    publishRequested,
    modalMessage,
    setModalMessage,
    confirmPublishInput,
    confirmPublishAgain,
    cancelConfirmPublish,
    hasGeneratedClip,
    isPublishReady,
    handleGenerate,
    handlePublish,
    ...state,
  };
};
