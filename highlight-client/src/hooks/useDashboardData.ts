import { useEffect, useMemo, useState } from "react";
import { getClips, getClipThumbnail } from "@/services/api/clips";
import { getYoutubePublishesByClip } from "@/services/api/youtubePublishes";
import { DashboardData, DashboardRange, StatCardData, UploadRecord } from "@/types/dashboard";
import { ClipApi } from "@/types/clips";
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
        platform: "YouTube",
        thumbnail,
      };
    });
};

const isClip = (clip: ClipApi | null): clip is ClipApi => {
  return Boolean(clip && clip.status);
};

export const useDashboardData = (range: DashboardRange) => {
  const [clips, setClips] = useState<ClipApi[]>([]);
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

        const clipsResponse = await getClips();

        if (!isMounted) {
          return;
        }

        setClips(clipsResponse.data ?? []);

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
      uploads: buildUploads(publishes, clips, range, thumbnails),
    };
  }, [clips, publishes, range, thumbnails]);

  return {
    ...dashboardData,
    isLoading,
    errorMessage,
  };
};
