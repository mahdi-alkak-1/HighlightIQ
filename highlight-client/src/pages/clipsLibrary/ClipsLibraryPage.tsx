import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClipsLibraryFilters from "@/components/clipsLibrary/ClipsLibraryFilters";
import ClipsLibraryTable from "@/components/clipsLibrary/ClipsLibraryTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useClipsLibrary } from "@/hooks/useClipsLibrary";
import { getClipThumbnail } from "@/services/api/clips";
import { clipLibraryPageSize } from "@/data/clipsLibraryData";
import { ClipLibraryDateRange, ClipLibraryStatusFilter } from "@/types/clipsLibrary";

const ClipsLibraryPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ClipLibraryStatusFilter>("all");
  const [game, setGame] = useState("all");
  const [dateRange, setDateRange] = useState<ClipLibraryDateRange>("last30");
  const [page, setPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const thumbnailsRef = useRef<Record<number, string>>({});

  const { items, isLoading, errorMessage } = useClipsLibrary({ status, game, dateRange });

  const pageCount = Math.max(1, Math.ceil(items.length / clipLibraryPageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * clipLibraryPageSize;
  const pageEnd = Math.min(pageStart + clipLibraryPageSize, items.length);
  const pageItems = items.slice(pageStart, pageEnd);
  const rangeLabel = items.length === 0 ? "Showing 0 of 0 clips" : `Showing ${pageStart + 1}-${pageEnd} of ${items.length} clips`;

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    let isMounted = true;
    const cleanup = (itemsToClear: Record<number, string>) => {
      Object.values(itemsToClear).forEach((url) => URL.revokeObjectURL(url));
    };

    const loadThumbs = async () => {
      const ids = pageItems.filter((item) => item.thumbnailAvailable).map((item) => item.id);
      if (ids.length === 0) {
        cleanup(thumbnailsRef.current);
        thumbnailsRef.current = {};
        if (isMounted) {
          setThumbnails({});
        }
        return;
      }
      const results = await Promise.allSettled(ids.map((id) => getClipThumbnail(id)));
      if (!isMounted) {
        return;
      }
      const next: Record<number, string> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          next[ids[index]] = result.value;
        }
      });
      cleanup(thumbnailsRef.current);
      thumbnailsRef.current = next;
      setThumbnails(next);
    };

    loadThumbs();

    return () => {
      isMounted = false;
    };
  }, [pageItems]);

  const filteredCount = useMemo(() => items.length, [items.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Clips Library</h1>
            <p className="text-xs text-white/50">Manage your generated and published highlight clips</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/clips-candidates")}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(28,47,255,0.35)]"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="1.5" />
              </svg>
            </span>
            Generate Clips
          </button>
        </div>

        <ClipsLibraryFilters
          status={status}
          game={game}
          dateRange={dateRange}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onGameChange={(value) => {
            setGame(value);
            setPage(1);
          }}
          onDateRangeChange={(value) => {
            setDateRange(value);
            setPage(1);
          }}
        />

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <ClipsLibraryTable
          items={pageItems}
          thumbnails={thumbnails}
          isLoading={isLoading}
          rangeLabel={rangeLabel}
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />

        {filteredCount === 0 && !isLoading && (
          <p className="text-xs text-white/40">No clips match the selected filters.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClipsLibraryPage;
