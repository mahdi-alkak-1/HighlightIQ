import ClipsLibraryPagination from "@/components/clipsLibrary/ClipsLibraryPagination";
import ClipsLibraryRow from "@/components/clipsLibrary/ClipsLibraryRow";
import { ClipLibraryItem } from "@/types/clipsLibrary";

interface ClipsLibraryTableProps {
  items: ClipLibraryItem[];
  thumbnails: Record<number, string>;
  isLoading: boolean;
  rangeLabel: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const ClipsLibraryTable = ({
  items,
  thumbnails,
  isLoading,
  rangeLabel,
  page,
  pageCount,
  onPageChange,
}: ClipsLibraryTableProps) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-4 pb-4 pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Clip Details</p>

      <div className="mt-4 grid grid-cols-[1.6fr_0.5fr_0.6fr_0.5fr_0.6fr] gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
        <span>Video</span>
        <span>Duration</span>
        <span>Status</span>
        <span>Platform</span>
        <span>Performance</span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-white/50">Loading clips...</div>
      ) : (
        <div className="mt-2">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/50">No clips found.</div>
          ) : (
            items.map((item) => (
              <ClipsLibraryRow
                key={item.id}
                item={item}
                thumbnail={thumbnails[item.id] ?? "/images/register-hero.png"}
              />
            ))
          )}
        </div>
      )}

      <ClipsLibraryPagination
        page={page}
        pageCount={pageCount}
        rangeLabel={rangeLabel}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ClipsLibraryTable;
