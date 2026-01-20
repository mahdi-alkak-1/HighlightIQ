import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatSeconds } from "@/utils/time";

interface TimelineEditorProps {
  start: number;
  end: number;
  duration: number;
  maxDuration: number;
  totalDuration: number;
  onChange: (start: number, end: number) => void;
}

type DragMode = "start" | "end" | "range" | null;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function TimelineEditor({
  start,
  end,
  duration,
  maxDuration,
  totalDuration,
  onChange,
}: TimelineEditorProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);

  const dragStartXRef = useRef(0);
  const dragStartStartRef = useRef(0);
  const dragStartEndRef = useRef(0);

  const safeTotal = Math.max(1, totalDuration);
  const safeStart = clamp(start, 0, safeTotal - 1);
  const safeEnd = clamp(end, safeStart + 1, safeTotal);

  useEffect(() => {
    console.log("[Timeline] props changed", { start, end });
  }, [start, end]);

  const startPct = useMemo(() => (safeStart / safeTotal) * 100, [safeStart, safeTotal]);
  const endPct = useMemo(() => (safeEnd / safeTotal) * 100, [safeEnd, safeTotal]);
  const widthPct = Math.max(0, endPct - startPct);

  const ticks = useMemo(() => {
    const count = 8;
    return Array.from({ length: count + 1 }, (_, i) => Math.round((i / count) * safeTotal));
  }, [safeTotal]);

  const pxToSeconds = (dx: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const w = el.getBoundingClientRect().width || 1;
    return (dx / w) * safeTotal;
  };

  const commit = (s: number, e: number) => {
    const ns = Math.round(s);
    const ne = Math.round(e);

    const finalStart = clamp(ns, 0, safeTotal - 1);
    const finalEnd = clamp(Math.max(finalStart + 1, ne), finalStart + 1, safeTotal);

    console.log("[Timeline] commit", { finalStart, finalEnd });
    onChange(finalStart, finalEnd);
  };

  const constrainForStartDrag = (s: number, fixedEnd: number) => {
    let nextStart = clamp(s, 0, safeTotal - 1);
    let nextEnd = clamp(fixedEnd, nextStart + 1, safeTotal);

    // cap max duration (keep end fixed where possible)
    if (nextEnd - nextStart > maxDuration) {
      nextStart = nextEnd - maxDuration;
    }

    // keep inside bounds
    if (nextStart < 0) {
      nextStart = 0;
      nextEnd = Math.min(safeTotal, nextStart + maxDuration);
    }

    // ensure at least 1s
    if (nextEnd <= nextStart) {
      nextEnd = Math.min(safeTotal, nextStart + 1);
    }

    return { nextStart, nextEnd };
  };

  const constrainForEndDrag = (fixedStart: number, e: number) => {
    let nextEnd = clamp(e, fixedStart + 1, safeTotal);
    let nextStart = clamp(fixedStart, 0, nextEnd - 1);

    // cap max duration (keep start fixed where possible)
    if (nextEnd - nextStart > maxDuration) {
      nextEnd = nextStart + maxDuration;
    }

    // keep inside bounds
    if (nextEnd > safeTotal) {
      nextEnd = safeTotal;
      nextStart = Math.max(0, nextEnd - maxDuration);
    }

    // ensure at least 1s
    if (nextEnd <= nextStart) {
      nextEnd = Math.min(safeTotal, nextStart + 1);
    }

    return { nextStart, nextEnd };
  };

  const constrainForRangeDrag = (s: number, e: number) => {
    const len = e - s;
    let nextStart = s;
    let nextEnd = e;

    if (nextStart < 0) {
      nextStart = 0;
      nextEnd = len;
    }
    if (nextEnd > safeTotal) {
      nextEnd = safeTotal;
      nextStart = safeTotal - len;
    }

    // if length somehow > max, cap
    if (nextEnd - nextStart > maxDuration) {
      nextEnd = nextStart + maxDuration;
    }

    if (nextEnd <= nextStart) {
      nextEnd = Math.min(safeTotal, nextStart + 1);
    }

    nextStart = clamp(nextStart, 0, safeTotal - 1);
    nextEnd = clamp(nextEnd, nextStart + 1, safeTotal);

    return { nextStart, nextEnd };
  };

  const beginDragFrom = (mode: DragMode, e: React.PointerEvent, captureEl: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();

    captureEl.setPointerCapture?.(e.pointerId);

    setDragMode(mode);
    dragStartXRef.current = e.clientX;
    dragStartStartRef.current = safeStart;
    dragStartEndRef.current = safeEnd;

    console.log("[Timeline] beginDrag", { mode, safeStart, safeEnd, safeTotal, maxDuration });
  };

  const onHandleDown = (mode: "start" | "end") => (e: React.PointerEvent) => {
    beginDragFrom(mode, e, e.currentTarget as HTMLElement);
  };

  const onTrackDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-handle='true']")) return;
    beginDragFrom("range", e, e.currentTarget as HTMLElement);
  };

  useEffect(() => {
    if (!dragMode) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStartXRef.current;
      const dt = pxToSeconds(dx);

      const baseStart = dragStartStartRef.current;
      const baseEnd = dragStartEndRef.current;

      if (dragMode === "start") {
        const after = constrainForStartDrag(baseStart + dt, baseEnd);
        console.log("[Timeline] move(start)", { dx, dt, baseStart, baseEnd, after });
        commit(after.nextStart, after.nextEnd);
        return;
      }

      if (dragMode === "end") {
        const after = constrainForEndDrag(baseStart, baseEnd + dt);
        console.log("[Timeline] move(end)", { dx, dt, baseStart, baseEnd, after });
        commit(after.nextStart, after.nextEnd);
        return;
      }

      if (dragMode === "range") {
        const len = baseEnd - baseStart;
        const after = constrainForRangeDrag(baseStart + dt, baseStart + dt + len);
        console.log("[Timeline] move(range)", { dx, dt, baseStart, baseEnd, after });
        commit(after.nextStart, after.nextEnd);
      }
    };

    const onUp = () => {
      console.log("[Timeline] pointer up, end drag", { dragMode });
      setDragMode(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragMode, safeTotal, maxDuration]);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/50">Timeline</div>
          <div className="text-sm font-semibold text-white">Trim your clip</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/50">Max {maxDuration}s</div>
          <div className="text-sm font-semibold text-white/90">{duration}s selected</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-[10px] text-white/40">
        {ticks.map((t) => (
          <span key={t} className="w-10 text-center">
            {formatSeconds(t)}
          </span>
        ))}
      </div>

      <div
        ref={trackRef}
        className="relative mt-3 h-14"
        onPointerDown={onTrackDown}
        style={{ touchAction: "none" }}
      >
        {/* base track */}
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />

        {/* selected fill */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-400/70 to-cyan-400/70"
          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
        />

        {/* selection window visual only */}
        <div
          className="absolute top-1/2 h-8 -translate-y-1/2 rounded-xl border border-white/15 bg-white/5 pointer-events-none"
          style={{ left: `${startPct}%`, width: `${widthPct}%`, zIndex: 5 }}
        />

        {/* START HANDLE */}
        <button
          data-handle="true"
          type="button"
          onPointerDown={onHandleDown("start")}
          className="absolute top-1/2 -translate-y-1/2 rounded-lg border border-white/20 bg-[#121827] px-2 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: `calc(${startPct}% - 18px)`, zIndex: 50, touchAction: "none" }}
          aria-label="Adjust clip start"
        >
          <div className="h-6 w-2 rounded-full bg-white/15" />
          <div className="mt-1 text-[10px] font-semibold text-white/80">{formatSeconds(safeStart)}</div>
        </button>

        {/* END HANDLE */}
        <button
          data-handle="true"
          type="button"
          onPointerDown={onHandleDown("end")}
          className="absolute top-1/2 -translate-y-1/2 rounded-lg border border-white/20 bg-[#121827] px-2 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: `calc(${endPct}% - 18px)`, zIndex: 50, touchAction: "none" }}
          aria-label="Adjust clip end"
        >
          <div className="h-6 w-2 rounded-full bg-white/15" />
          <div className="mt-1 text-[10px] font-semibold text-white/80">{formatSeconds(safeEnd)}</div>
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
        <span>
          Selection: <span className="text-white/80">{formatSeconds(safeStart)} → {formatSeconds(safeEnd)}</span>
        </span>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/70">
          Total: {formatSeconds(safeTotal)}
        </span>
      </div>
    </div>
  );
}
