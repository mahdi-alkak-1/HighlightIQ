type PaginationItem = number | "dots";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const buildPages = (page: number, pageCount: number): PaginationItem[] => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) {
    items.push("dots");
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < pageCount - 1) {
    items.push("dots");
  }

  items.push(pageCount);
  return items;
};

const Pagination = ({ page, pageCount, onPageChange }: PaginationProps) => {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-[11px] text-white/60">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full border border-brand-border bg-white/5 px-3 py-1 text-white/70 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>

      <div className="flex items-center gap-2">
        {buildPages(page, pageCount).map((item, index) =>
          item === "dots" ? (
            <span key={`dots-${index}`} className="px-1 text-white/40">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-7 min-w-[28px] rounded-full border px-2 text-[11px] transition ${
                item === page
                  ? "border-brand-blue bg-brand-blue text-white shadow-[0_0_12px_rgba(28,47,255,0.35)]"
                  : "border-brand-border bg-white/5 text-white/70 hover:border-brand-blue/60"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="rounded-full border border-brand-border bg-white/5 px-3 py-1 text-white/70 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
