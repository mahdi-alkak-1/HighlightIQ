interface ClipsLibraryPaginationProps {
  page: number;
  pageCount: number;
  rangeLabel: string;
  onPageChange: (page: number) => void;
}

const ClipsLibraryPagination = ({ page, pageCount, rangeLabel, onPageChange }: ClipsLibraryPaginationProps) => {
  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-brand-border pt-4 text-xs text-white/50">
        <span>{rangeLabel}</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-brand-border bg-white/5 px-3 py-1 text-[11px] text-white/40"
            disabled
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-brand-border bg-white/5 px-3 py-1 text-[11px] text-white/40"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-brand-border pt-4 text-xs text-white/50">
      <span>{rangeLabel}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-brand-border bg-white/5 px-3 py-1 text-[11px] text-white/70 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          className="rounded-lg border border-brand-border bg-white/5 px-3 py-1 text-[11px] text-white/70 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClipsLibraryPagination;
