import { useEffect, useMemo, useState } from "react";
import { getClipCandidates } from "@/services/api/clipCandidates";
import { createClip, exportClip, getClipsByRecording } from "@/services/api/clips";
import { createYoutubePublish, getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { getRecordingThumbnail, getRecordings } from "@/services/api/recordings";
import { ClipCandidateApi } from "@/types/clipCandidates";
import { ClipApi } from "@/types/clips";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { isApiError } from "@/types/api";
import { clamp, formatSeconds } from "@/utils/time";
import { maxClipDurationSeconds } from "@/data/clipStudioData";

interface CandidateView {
  id: number;
  startMs: number;
  endMs: number;
  durationSeconds: number;
  status: string;
  label: string;
  timeLabel: string;
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
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [clips, setClips] = useState<ClipApi[]>([]);
  const [publishes, setPublishes] = useState<YoutubePublishApi[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [timelineStart, setTimelineStart] = useState(0);
  const [timelineEnd, setTimelineEnd] = useState(0);
  const [clipTitle, setClipTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishConnected, setPublishConnected] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
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

    if (activeRecording) {
      loadThumbnail(activeRecording);
    } else {
      setRecordingThumbnail(null);
    }

    return () => {
      isMounted = false;
    };
  }, [activeRecording]);

  useEffect(() => {
    if (!selectedCandidateId) {
      return;
    }
    const candidate = candidates.find((item) => item.id === selectedCandidateId);
    if (!candidate) {
      return;
    }
    const startSec = Math.floor(candidate.startMs / 1000);
    const endSec = Math.ceil(candidate.endMs / 1000);
    const cappedEnd = Math.min(startSec + maxClipDurationSeconds, endSec);
    setTimelineStart(startSec);
    setTimelineEnd(Math.max(cappedEnd, startSec + 1));
    setClipTitle(candidate.label);
  }, [selectedCandidateId, candidates]);

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

  const publishEntry = useMemo(() => {
    if (!selectedClip) {
      return null;
    }
    return publishes.find((item) => item.clip_id === selectedClip.id) ?? null;
  }, [publishes, selectedClip]);

  const hasGeneratedClip = Boolean(selectedClip?.export_path);
  const isPublishReady = Boolean(selectedClip && hasGeneratedClip);

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

  const handleGenerate = async () => {
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
        clip = await createClip({
          recording_uuid: activeRecording.UUID,
          candidate_id: selectedCandidate.id,
          title: clipTitle || selectedCandidate.label,
          caption: null,
          start_ms: Math.round(timelineStart * 1000),
          end_ms: Math.round(timelineEnd * 1000),
        });
        setClips((prev) => [clip, ...prev]);
      }
      if (!clip.export_path) {
        const exported = await exportClip(clip.id);
        setClips((prev) => prev.map((item) => (item.id === exported.id ? exported : item)));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedClip) {
      setModalMessage("Please select a clip to publish.");
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
      setModalMessage("This clip is already queued for YouTube.");
      return;
    }
    setIsPublishing(true);
    try {
      const suffix = `${selectedClip.id}`.slice(0, 12);
      const youtubeId = `pending-${suffix}`;
      const youtubeUrl = `https://youtube.com/shorts/${youtubeId}`;
      const created = await createYoutubePublish(selectedClip.id, {
        youtube_video_id: youtubeId,
        youtube_url: youtubeUrl,
        status: "queued",
      });
      setPublishes((prev) => [created, ...prev]);
    } finally {
      setIsPublishing(false);
    }
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
      return;
    }
    refreshPublishes();
  }, [selectedClip?.id]);

  return {
    recordings,
    activeRecording,
    setActiveRecording,
    recordingThumbnail,
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
    clipTitle,
    setClipTitle,
    isGenerating,
    isPublishing,
    publishConnected,
    setPublishConnected,
    modalMessage,
    setModalMessage,
    hasGeneratedClip,
    isPublishReady,
    handleGenerate,
    handlePublish,
    ...state,
  };
};
