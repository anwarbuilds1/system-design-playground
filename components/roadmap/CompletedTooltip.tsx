"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, RotateCcw, Star } from "lucide-react";

interface TooltipData {
  title: string;
  score: number;
  lessonId: string;
}

interface CompletedTooltipProps {
  anchorRect: DOMRect | null;
  data: TooltipData | null;
  onClose: () => void;
}

export function CompletedTooltip({ anchorRect, data, onClose }: CompletedTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!data) return;
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [data, onClose]);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!anchorRect || !data) return null;

  /* Position tooltip centered above/below the anchor node */
  const scrollY = window.scrollY;
  const tooltipW = 220;
  const gap = 12;

  const left = Math.max(
    8,
    Math.min(
      anchorRect.left + anchorRect.width / 2 - tooltipW / 2,
      window.innerWidth - tooltipW - 8
    )
  );
  const top = anchorRect.top + scrollY - gap;

  /* Score tier styling */
  const scoreColor =
    data.score >= 80 ? "#34d399" : data.score >= 60 ? "#fbbf24" : "#f87171";
  const scoreLabel =
    data.score >= 80 ? "Excellent" : data.score >= 60 ? "Good" : "Needs Work";

  const stars = data.score >= 80 ? 3 : data.score >= 60 ? 2 : 1;

  return (
    <div
      ref={tooltipRef}
      className="tooltip-in fixed z-50 pointer-events-auto"
      style={{
        left,
        top,
        width: tooltipW,
        transform: "translateY(-100%)",
      }}
    >
      <div
        className="rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3"
        style={{
          background: "rgba(15,17,19,0.97)",
          borderColor: "rgba(52,211,153,0.3)",
          boxShadow: "0 0 30px rgba(52,211,153,0.1), 0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              Completed
            </div>
            <div className="mt-0.5 text-[13px] font-bold text-foreground leading-snug">
              {data.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-0.5 rounded-lg p-1 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Score */}
        <div
          className="rounded-xl border p-3 flex flex-col gap-2"
          style={{
            background: `${scoreColor}0a`,
            borderColor: `${scoreColor}25`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted">Best Score</span>
            <span
              className="mono text-sm font-black"
              style={{ color: scoreColor }}
            >
              {data.score}
              <span className="text-[10px] font-medium opacity-60"> /100</span>
            </span>
          </div>

          {/* Score bar */}
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${data.score}%`,
                background: scoreColor,
                boxShadow: `0 0 8px ${scoreColor}80`,
              }}
            />
          </div>

          {/* Stars + label */}
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={s <= stars ? "fill-current" : ""}
                  style={{
                    color: s <= stars ? scoreColor : "#2c2f34",
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium" style={{ color: scoreColor }}>
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* Replay button */}
        <Link
          href={`/learn/${data.lessonId}`}
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[12px] font-semibold text-accent transition-all duration-150 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_12px_rgba(52,211,153,0.2)]"
        >
          <RotateCcw size={13} strokeWidth={2.5} />
          Replay Lesson
        </Link>

        {/* Arrow pointing down toward the node */}
        <div
          className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-r border-b"
          style={{
            background: "rgba(15,17,19,0.97)",
            borderColor: "rgba(52,211,153,0.3)",
          }}
        />
      </div>
    </div>
  );
}
