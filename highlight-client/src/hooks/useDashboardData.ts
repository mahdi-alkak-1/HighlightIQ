import { useEffect, useMemo, useState } from "react";
import { getClipCandidates } from "@/services/api/clipCandidates";
import { getClips, getClipThumbnail } from "@/services/api/clips";
import { getRecordings } from "@/services/api/recordings";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import {
  DashboardData,
  DashboardRange,
  PipelineStepData,
  StatCardData,
  UploadRecord,
} from "@/types/dashboard";
import { ClipApi } from "@/types/clips";
import { ClipCandidateApi } from "@/types/clipCandidates";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { isApiError } from "@/types/api";
import { getAuthToken } from "@/utils/authStorage";

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const buildPipeline = (
  recordings: RecordingApi[],
  candidates: ClipCandidateApi[],
  clips: ClipApi[]
): PipelineStepData[] => {
  const safeRecordings = recordings.filter(isRecording);
  const safeCandidates = candidates.filter(isCandidate);
  const safeClips = clips.filter(isClip);

  const uploadedCount = safeRecordings.filter((rec) => rec.Status === "uploaded").length;
  const detectingCount = safeCandidates.filter((candidate) => candidate.Status === "new").length;
  const reviewCount = safeCandidates.filter((candidate) => candidate.Status === "approved").length;
  const publishCount = safeClips.filter((clip) => clip.status === "ready").length;
  const syncCount = 0;

  const stage =
    syncCount > 0
      ? "sync"
      : publishCount > 0
        ? "publish"
        : reviewCount > 0
          ? "review"
          : detectingCount > 0
            ? "detecting"
            : uploadedCount > 0
              ? "upload"
              : "idle";

  const completed = (step: string) => {
    const order = ["upload", "detecting", "review", "publish", "sync"];
    return order.indexOf(step) < order.indexOf(stage);
  };

  return [
    {
      title: "Upload",
      status: `${uploadedCount} pending`,
      state:
        stage === "upload"
          ? "active"
          : uploadedCount > 0 || completed("upload")
            ? "complete"
            : "pending",
    },
    {
      title: "Detecting",
      status: `${detectingCount} processing`,
      state: stage === "detecting" ? "active" : completed("detecting") ? "complete" : "pending",
    },
    {
      title: "Review",
      status: `${reviewCount} ready`,
      state: stage === "review" ? "active" : completed("review") ? "complete" : "disabled",
    },
    {
      title: "Publish",
      status: `${publishCount} scheduled`,
      state: stage === "publish" ? "active" : completed("publish") ? "complete" : "disabled",
    },
    {
      title: "Sync",
      status: `${syncCount} synced`,
      state: stage === "sync" ? "active" : "disabled",
    },
  ];
};

const buildStats = (clips: ClipApi[], publishes: YoutubePublishApi[]): StatCardData[] => {
  const safeClips = clips.filter(isClip);
  const clipsGenerated = safeClips.length;
  const publishedClips = publishes.length;
  const totalViews = publishes.reduce((acc, publish) => acc + publish.views, 0);
  const formattedViews =
    totalViews >= 1_000_000
      ? `${(totalViews / 1_000_000).toFixed(1)}M`
      : totalViews >= 1_000
        ? `${(totalViews / 1_000).toFixed(1)}K`
        : totalViews.toString();

  return [
    {
      label: "Clips generated",
      value: clipsGenerated.toString(),
      change: "Live",
      trend: "neutral",
    },
    {
      label: "ShortsPublished",
      value: publishedClips.toString(),
      change: "Live",
      trend: "neutral",
    },
    {
      label: "Total Shorts Views",
      value: formattedViews,
      change: "Live",
      trend: "neutral",
      footnote: "Summed across published shorts",
    },
    {
      label: "Average Retention Score",
      value: "N/A",
      change: "Preview",
      trend: "neutral",
      footnote: "Metric not available yet",
    },
  ];
};

const isWithinRange = (date: Date, range: DashboardRange) => {
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  if (range === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const diffMs = now.getTime() - date.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7;
};

const buildUploads = (
  publishes: YoutubePublishApi[],
  clips: ClipApi[],
  range: DashboardRange,
  thumbnails: Record<number, string>
): UploadRecord[] => {
  const clipMap = new Map<number, ClipApi>();
  clips.filter(isClip).forEach((clip) => {
    clipMap.set(clip.id, clip);
  });

  return publishes
    .slice()
    .filter((publish) => {
      const dateString = publish.published_at ?? publish.created_at;
      return isWithinRange(new Date(dateString), range);
    })
    .sort((a, b) => {
      const aDate = new Date(a.published_at ?? a.created_at).getTime();
      const bDate = new Date(b.published_at ?? b.created_at).getTime();
      return bDate - aDate;
    })
    .slice(0, 6)
    .map((publish) => {
      const clip = clipMap.get(publish.clip_id);
      const dateString = publish.published_at ?? publish.created_at;
      const statusLabel =
        publish.status === "deleted"
          ? "deleted"
          : publish.status === "failed"
            ? "failed"
            : publish.status === "uploaded"
              ? "uploaded"
              : "published";
      const thumbnail = clip ? thumbnails[clip.id] ?? "/images/register-hero.png" : "/images/register-hero.png";
      return {
        id: publish.id.toString(),
        title: clip?.title ?? "Untitled clip",
        date: formatDate(dateString),
        status: statusLabel,
        platform: "Shorts",
        thumbnail,
      };
    });
};

const isRecording = (rec: RecordingApi | null): rec is RecordingApi => {
  return Boolean(rec && rec.Status);
};

const isCandidate = (candidate: ClipCandidateApi | null): candidate is ClipCandidateApi => {
  return Boolean(candidate && candidate.Status);
};

const isClip = (clip: ClipApi | null): clip is ClipApi => {
  return Boolean(clip && clip.status);
};

export const useDashboardData = (range: DashboardRange) => {
  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [clips, setClips] = useState<ClipApi[]>([]);
  const [candidates, setCandidates] = useState<ClipCandidateApi[]>([]);
  const [publishes, setPublishes] = useState<YoutubePublishApi[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const token = getAuthToken();
        if (!token) {
          setErrorMessage("Please sign in to view your dashboard.");
          return;
        }

        const recordingsResponse = await getRecordings();
        const clipsResponse = await getClips();

        if (!isMounted) {
          return;
        }

        setRecordings(recordingsResponse.data ?? []);
        setClips(clipsResponse.data ?? []);

        const candidateLists = await Promise.allSettled(
          (recordingsResponse.data ?? []).map((rec) => getClipCandidates(rec.UUID))
        );
        if (!isMounted) {
          return;
        }
        const flattened = candidateLists.flatMap((result) =>
          result.status === "fulfilled" ? result.value.items : []
        );
        setCandidates(flattened);

        const publishLists = await Promise.allSettled(
          (clipsResponse.data ?? []).map((clip) => getYoutubePublishesByClip(clip.id))
        );
        if (!isMounted) {
          return;
        }
        const publishItems = publishLists.flatMap((result) =>
          result.status === "fulfilled" ? result.value.data : []
        );
        setPublishes(publishItems);
      } catch (error) {
        if (isMounted) {
          if (isApiError(error)) {
            const apiMessage = error.data?.message ?? "Unable to load dashboard data.";
            setErrorMessage(apiMessage);
          } else {
            setErrorMessage("Unable to load dashboard data.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cleanupUrls = () => {
      Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
    };

    const loadThumbnails = async () => {
      const clipMap = new Map<number, ClipApi>();
      clips.filter(isClip).forEach((clip) => {
        clipMap.set(clip.id, clip);
      });

      const publishClips = publishes
        .map((publish) => clipMap.get(publish.clip_id))
        .filter((clip): clip is ClipApi => Boolean(clip && clip.thumbnail_path));

      const uniqueIds = Array.from(new Set(publishClips.map((clip) => clip.id)));
      const results = await Promise.allSettled(uniqueIds.map((id) => getClipThumbnail(id)));

      if (!isMounted) {
        return;
      }

      const next: Record<number, string> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          next[uniqueIds[index]] = result.value;
        }
      });

      cleanupUrls();
      setThumbnails(next);
    };

    if (clips.length > 0 && publishes.length > 0) {
      loadThumbnails();
    }

    return () => {
      isMounted = false;
      cleanupUrls();
    };
  }, [clips, publishes]);

  const dashboardData = useMemo<DashboardData>(() => {
    return {
      stats: buildStats(clips, publishes),
      pipeline: buildPipeline(recordings, candidates, clips),
      uploads: buildUploads(publishes, clips, range, thumbnails),
    };
  }, [recordings, candidates, clips, publishes, range, thumbnails]);

  return {
    ...dashboardData,
    isLoading,
    errorMessage,
  };
};
