import { useEffect, useMemo, useState } from "react";
import { getClips } from "@/services/api/clips";
import { getRecordings } from "@/services/api/recordings";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { AnalyticsRange, AnalyticsSeriesPoint, AnalyticsStat, AnalyticsTopClip } from "@/types/analytics";
import { ClipApi } from "@/types/clips";
import { RecordingApi } from "@/types/recordings";
import { YoutubePublishApi } from "@/types/youtubePublishes";
import { isApiError } from "@/types/api";
import { formatCount } from "@/utils/formatters";

interface AnalyticsState {
  stats: AnalyticsStat[];
  series: AnalyticsSeriesPoint[];
  topClips: AnalyticsTopClip[];
  isLoading: boolean;
  errorMessage: string | null;
}

const buildDateBuckets = (range: AnalyticsRange) => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = range === "today" ? 1 : range === "last7" ? 7 : 30;
  const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

  const buckets: Array<{ label: string; key: string }> = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    buckets.push({ label, key });
  }
  return buckets;
};

const resolvePublishDate = (publish: YoutubePublishApi) => {
  return new Date(publish.published_at ?? publish.created_at);
};

const pickLatestPublish = (publishes: YoutubePublishApi[]) => {
  if (publishes.length === 0) {
    return null;
  }
  return publishes
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
};

export const useAnalytics = (range: AnalyticsRange): AnalyticsState => {
  const [clips, setClips] = useState<ClipApi[]>([]);
  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [publishes, setPublishes] = useState<YoutubePublishApi[]>([]);
  const [state, setState] = useState<{ isLoading: boolean; errorMessage: string | null }>({
    isLoading: true,
    errorMessage: null,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState({ isLoading: true, errorMessage: null });
      try {
        const [clipsResponse, recordingsResponse] = await Promise.all([getClips(), getRecordings()]);
        if (!isMounted) {
          return;
        }
        const clipsData = clipsResponse.data ?? [];
        setClips(clipsData);
        setRecordings(recordingsResponse.data ?? []);

        const publishLists = await Promise.allSettled(
          clipsData.map((clip) => getYoutubePublishesByClip(clip.id))
        );
        if (!isMounted) {
          return;
        }
        const publishItems = publishLists.flatMap((result) =>
          result.status === "fulfilled" ? result.value.data : []
        );
        setPublishes(publishItems);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (isApiError(error)) {
          setState({ isLoading: false, errorMessage: error.data?.message ?? "Unable to load analytics." });
        } else {
          setState({ isLoading: false, errorMessage: "Unable to load analytics." });
        }
        return;
      }
      if (isMounted) {
        setState({ isLoading: false, errorMessage: null });
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => {
    const bucketDefs = buildDateBuckets(range);
    const bucketMap = new Map(bucketDefs.map((bucket) => [bucket.key, 0]));

    const totalViews = publishes.reduce((acc, publish) => acc + publish.views, 0);
    const totalLikes = publishes.reduce((acc, publish) => acc + publish.likes, 0);
    const totalComments = publishes.reduce((acc, publish) => acc + publish.comments, 0);

    publishes.forEach((publish) => {
      const dateKey = resolvePublishDate(publish).toISOString().slice(0, 10);
      if (!bucketMap.has(dateKey)) {
        return;
      }
      bucketMap.set(dateKey, (bucketMap.get(dateKey) ?? 0) + publish.views);
    });

    const series: AnalyticsSeriesPoint[] = bucketDefs.map((bucket) => ({
      label: bucket.label,
      value: bucketMap.get(bucket.key) ?? 0,
    }));

    const publishedClipsCount = publishes.length;
    const avgViews = publishedClipsCount > 0 ? Math.round(totalViews / publishedClipsCount) : 0;

    const stats: AnalyticsStat[] = [
      { label: "Total Views", value: formatCount(totalViews), trend: "Live" },
      { label: "Total Likes", value: formatCount(totalLikes), trend: "Live" },
      { label: "Comments", value: formatCount(totalComments), trend: "Live" },
      { label: "Avg Views / Clip", value: formatCount(avgViews), trend: "Live" },
    ];

    const recordingsById = new Map(recordings.map((rec) => [rec.ID, rec]));
    const publishesByClip = new Map<number, YoutubePublishApi>();
    clips.forEach((clip) => {
      const clipPublishes = publishes.filter((item) => item.clip_id === clip.id);
      const latest = pickLatestPublish(clipPublishes);
      if (latest) {
        publishesByClip.set(clip.id, latest);
      }
    });

    const topClips: AnalyticsTopClip[] = clips
      .map((clip) => {
        const publish = publishesByClip.get(clip.id);
        if (!publish) {
          return null;
        }
        const recording = recordingsById.get(clip.recording_id);
        return {
          id: clip.id,
          title: clip.title,
          recordingTitle: recording?.Title ?? "Unknown",
          views: publish.views,
        } satisfies AnalyticsTopClip;
      })
      .filter((item): item is AnalyticsTopClip => Boolean(item))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      stats,
      series,
      topClips,
    };
  }, [clips, recordings, publishes, range]);

  return {
    stats: value.stats,
    series: value.series,
    topClips: value.topClips,
    isLoading: state.isLoading,
    errorMessage: state.errorMessage,
  };
};
