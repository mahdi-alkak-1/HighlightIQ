import { useEffect, useMemo, useState } from "react";
import { getClips } from "@/services/api/clips";
import { getRecordings } from "@/services/api/recordings";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { ClipApi } from "@/types/clips";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { ClipLibraryDateRange, ClipLibraryItem, ClipLibraryStatus, ClipLibraryStatusFilter } from "@/types/clipsLibrary";
import { isApiError } from "@/types/api";

interface ClipsLibraryFilters {
  status: ClipLibraryStatusFilter;
  game: string;
  dateRange: ClipLibraryDateRange;
}

interface ClipsLibraryState {
  items: ClipLibraryItem[];
  isLoading: boolean;
  errorMessage: string | null;
}

const resolveStatus = (clip: ClipApi, publish: YoutubePublishApi | null): ClipLibraryStatus => {
  if (publish) {
    if (publish.status === "failed") {
      return "Failed";
    }
    return "Published";
  }
  if (clip.status === "failed") {
    return "Failed";
  }
  if (clip.status === "ready") {
    return "Ready";
  }
  return "Draft";
};

const withinRange = (iso: string, range: ClipLibraryDateRange) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") {
    return date >= startOfToday;
  }
  const days = range === "last7" ? 7 : 30;
  const start = new Date(startOfToday.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= start;
};

const pickLatestPublish = (publishes: YoutubePublishApi[]) => {
  if (publishes.length === 0) {
    return null;
  }
  return [...publishes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
};

export const useClipsLibrary = (filters: ClipsLibraryFilters): ClipsLibraryState => {
  const [clips, setClips] = useState<ClipApi[]>([]);
  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [publishes, setPublishes] = useState<Record<number, YoutubePublishApi | null>>({});
  const [state, setState] = useState<{ isLoading: boolean; errorMessage: string | null }>({
    isLoading: true,
    errorMessage: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadBase = async () => {
      setState({ isLoading: true, errorMessage: null });
      try {
        const [clipsResponse, recordingsResponse] = await Promise.all([getClips(), getRecordings()]);
        if (!isMounted) {
          return;
        }
        setClips(clipsResponse.data ?? []);
        setRecordings(recordingsResponse.data ?? []);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (isApiError(error)) {
          setState({ isLoading: false, errorMessage: error.data?.message ?? "Unable to load clips." });
        } else {
          setState({ isLoading: false, errorMessage: "Unable to load clips." });
        }
        return;
      }
      if (isMounted) {
        setState({ isLoading: false, errorMessage: null });
      }
    };

    loadBase();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (clips.length === 0) {
      setPublishes({});
      return () => {
        isMounted = false;
      };
    }

    const loadPublishes = async () => {
      const results = await Promise.allSettled(clips.map((clip) => getYoutubePublishesByClip(clip.id)));
      if (!isMounted) {
        return;
      }
      const next: Record<number, YoutubePublishApi | null> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          next[clips[index].id] = pickLatestPublish(result.value.data);
        } else {
          next[clips[index].id] = null;
        }
      });
      setPublishes(next);
    };

    loadPublishes();

    return () => {
      isMounted = false;
    };
  }, [clips]);

  const items = useMemo(() => {
    const recordingsById = new Map(recordings.map((rec) => [rec.ID, rec]));
    return clips
      .map((clip) => {
        const rec = recordingsById.get(clip.recording_id);
        const publish = publishes[clip.id] ?? null;
        const status = resolveStatus(clip, publish);
        return {
          id: clip.id,
          title: clip.title,
          recordingTitle: rec?.Title ?? "Unknown",
          game: rec?.Game ?? "-",
          createdAt: clip.created_at,
          durationSeconds: clip.duration_seconds,
          status,
          platform: "YouTube",
          views: publish?.views ?? 0,
          likes: publish?.likes ?? 0,
          thumbnailAvailable: Boolean(clip.thumbnail_path),
        } satisfies ClipLibraryItem;
      })
      .filter((item) => {
        if (!withinRange(item.createdAt, filters.dateRange)) {
          return false;
        }
        if (filters.game !== "all" && item.game !== filters.game) {
          return false;
        }
        if (filters.status !== "all") {
          const statusMatch =
            (filters.status === "published" && item.status === "Published") ||
            (filters.status === "ready" && item.status === "Ready") ||
            (filters.status === "failed" && item.status === "Failed");
          return statusMatch;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clips, recordings, publishes, filters]);

  return {
    items,
    isLoading: state.isLoading,
    errorMessage: state.errorMessage,
  };
};
