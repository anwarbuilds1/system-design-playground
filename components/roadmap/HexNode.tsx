"use client";

import Link from "next/link";
import { Check, Lock, Crown, Play } from "lucide-react";
import { useRef } from "react";

export type NodeState = "completed" | "active" | "locked" | "coming-soon" | "boss-locked" | "boss-active";

export interface HexNodeProps {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  xpReward: number;
  state: NodeState;
  zoneColor: string;
  lessonId?: string;
  bestScore?: number;
  isBoss?: boolean;
  onCompletedClick?: (
    rect: DOMRect,
    data: { title: string; score: number; lessonId: string }
  ) => void;
}

/** Pointy-top hexagon polygon points for a 100×116 viewBox */
const HEX_POINTS = "50,2 98,27 98,77 50,102 2,77 2,27";
/** Boss is slightly bigger — same shape, bigger rendered size */

function HexShape({
  state,
  zoneColor,
  isBoss,
}: {
  state: NodeState;
  zoneColor: string;
  isBoss?: boolean;
}) {
  const isCompleted = state === "completed";
  const isActive = state === "active" || state === "boss-active";
  const isBossActive = state === "boss-active";
  const isBossLocked = state === "boss-locked";
  const isLocked = state === "locked" || state === "coming-soon" || isBossLocked;
  const size = isBoss ? 112 : 88;

  let fill = "#15171a";
  let stroke = "#2c2f34";
  let strokeWidth = 2.5;
  let filterEl: React.ReactNode = null;

  if (isCompleted) {
    fill = `${zoneColor}18`;
    stroke = zoneColor;
    strokeWidth = 2.5;
  } else if (isActive && !isBossActive) {
    fill = "rgba(52,211,153,0.08)";
    stroke = "#34d399";
    strokeWidth = 3;
  } else if (isBossActive) {
    fill = "rgba(245,158,11,0.12)";
    stroke = "#f59e0b";
    strokeWidth = 3;
    filterEl = (
      <filter id="boss-glow-filter">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    );
  } else if (isLocked) {
    fill = "#0f1113";
    stroke = "#212327";
    strokeWidth = 1.5;
  }

  return (
    <svg
      width={size}
      height={Math.round(size * 1.155)}
      viewBox="0 0 100 116"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {filterEl && <defs>{filterEl}</defs>}
      {/* Background fill */}
      <polygon
        points={HEX_POINTS}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        filter={isBossActive ? "url(#boss-glow-filter)" : undefined}
      />
      {/* Glow stroke for completed/active */}
      {(isCompleted || isActive) && (
        <polygon
          points={HEX_POINTS}
          fill="none"
          stroke={isCompleted ? zoneColor : isBossActive ? "#f59e0b" : "#34d399"}
          strokeWidth={1}
          strokeLinejoin="round"
          opacity={0.35}
          transform="scale(1.06) translate(-3, -3.5)"
        />
      )}
    </svg>
  );
}

export function HexNode({
  id,
  index,
  title,
  subtitle,
  xpReward,
  state,
  zoneColor,
  lessonId,
  bestScore,
  isBoss,
  onCompletedClick,
}: HexNodeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isCompleted = state === "completed";
  const isActive = state === "active" || state === "boss-active";
  const isLocked = state === "locked" || state === "coming-soon" || state === "boss-locked";
  const isBossActive = state === "boss-active";
  const isBossLocked = state === "boss-locked";

  const hexSize = isBoss ? 112 : 88;
  const hexH = Math.round(hexSize * 1.155);

  /** Shake the wrapper briefly */
  function shakeSelf() {
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth; // reflow
    el.classList.add("shake");
  }

  function handleLockedClick() {
    shakeSelf();
  }

  function handleCompletedClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!wrapperRef.current || !lessonId || bestScore === undefined) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    onCompletedClick?.(rect, { title, score: bestScore, lessonId });
  }

  /* ── Centre icon ── */
  const CentreIcon = () => {
    if (isCompleted)
      return (
        <Check
          size={isBoss ? 32 : 26}
          strokeWidth={2.8}
          style={{ color: zoneColor }}
        />
      );
    if (isBossActive || isBossLocked)
      return (
        <Crown
          size={isBoss ? 34 : 28}
          strokeWidth={2}
          style={{ color: isBossLocked ? "#5c5f65" : "#f59e0b" }}
        />
      );
    if (isActive)
      return (
        <Play
          size={26}
          strokeWidth={2.2}
          className="ml-1 fill-current"
          style={{ color: "#34d399" }}
        />
      );
    return (
      <Lock
        size={isBoss ? 28 : 22}
        strokeWidth={2}
        style={{ color: "#5c5f65" }}
      />
    );
  };

  /* ── XP pill color ── */
  const xpColor = isCompleted
    ? zoneColor
    : isActive
    ? "#34d399"
    : "#5c5f65";

  /* ── Wrapper classes ── */
  const wrapperCls = [
    "relative flex flex-col items-center gap-2 select-none",
    isActive && !isBossActive ? "cursor-pointer" : "",
    isCompleted ? "cursor-pointer" : "",
    isLocked ? "opacity-55 cursor-default" : "",
    isBossActive ? "cursor-pointer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <div
      ref={wrapperRef}
      id={`roadmap-node-${id}`}
      className={wrapperCls}
      onClick={
        isLocked
          ? handleLockedClick
          : isCompleted
          ? handleCompletedClick
          : undefined
      }
    >
      {/* Level index pill */}
      <div
        className="mono text-[10px] font-bold px-2 py-0.5 rounded-full border"
        style={{
          color: isCompleted ? zoneColor : isActive ? "#34d399" : "#5c5f65",
          borderColor: isCompleted
            ? `${zoneColor}40`
            : isActive
            ? "rgba(52,211,153,0.3)"
            : "#212327",
          background: isCompleted
            ? `${zoneColor}10`
            : isActive
            ? "rgba(52,211,153,0.07)"
            : "transparent",
        }}
      >
        LVL {String(index).padStart(2, "0")}
      </div>

      {/* Hex + icon stack */}
      <div
        className="relative transition-transform duration-200 hover:scale-105"
        style={{ width: hexSize, height: hexH }}
      >
        {/* Active pulsing ring */}
        {(isActive || isBossActive) && (
          <div
            className="active-ring-hex pointer-events-none absolute rounded-full"
            style={{
              width: hexSize * 1.3,
              height: hexH * 1.3,
              top: "50%",
              left: "50%",
              border: `2px solid ${isBossActive ? "#f59e0b" : "#34d399"}`,
              borderRadius: "50%",
            }}
          />
        )}

        {/* Active sparkles */}
        {isActive && !isBossActive && (
          <>
            <span
              className="twinkle-1 pointer-events-none absolute text-[#34d399] text-xs"
              style={{ top: -8, right: -6 }}
            >
              ✦
            </span>
            <span
              className="twinkle-2 pointer-events-none absolute text-[#34d399] text-xs"
              style={{ bottom: -4, left: -8 }}
            >
              ✦
            </span>
            <span
              className="twinkle-3 pointer-events-none absolute text-[#34d399] text-[8px]"
              style={{ top: 10, left: -10 }}
            >
              ★
            </span>
          </>
        )}

        <HexShape state={state} zoneColor={zoneColor} isBoss={isBoss} />

        {/* Centre icon, absolutely positioned over the hex */}
        <div
          className="pointer-events-none absolute flex items-center justify-center"
          style={{ inset: 0 }}
        >
          <CentreIcon />
        </div>

        {/* Boss "BOSS" badge */}
        {isBoss && (
          <div
            className="absolute -top-3 -right-3 rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest border"
            style={{
              background: isBossLocked ? "#0f1113" : "rgba(245,158,11,0.15)",
              color: isBossLocked ? "#5c5f65" : "#f59e0b",
              borderColor: isBossLocked ? "#212327" : "rgba(245,158,11,0.4)",
            }}
          >
            BOSS
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-0.5 text-center max-w-[120px]">
        <span
          className="text-[12px] font-semibold leading-snug"
          style={{
            color: isCompleted
              ? zoneColor
              : isActive
              ? "#f2f2f0"
              : isBossActive
              ? "#f59e0b"
              : "#5c5f65",
          }}
        >
          {title}
        </span>
        <span className="text-[10px] leading-tight" style={{ color: "#5c5f65" }}>
          {subtitle}
        </span>
      </div>

      {/* XP reward pill */}
      <div
        className="mono text-[10px] font-semibold px-2 py-0.5 rounded-full border"
        style={{
          color: xpColor,
          borderColor: `${xpColor}30`,
          background: `${xpColor}08`,
        }}
      >
        +{xpReward} XP
      </div>

      {/* Coming soon label */}
      {state === "coming-soon" && (
        <div className="text-[9px] font-medium tracking-wider text-muted-2 uppercase">
          Coming Soon
        </div>
      )}
    </div>
  );

  /* Wrap active (non-boss) in a Link */
  if (isActive && !isBossActive && lessonId) {
    return (
      <Link href={`/learn/${lessonId}`} className="no-underline">
        {content}
      </Link>
    );
  }
  if (isBossActive && lessonId) {
    return (
      <Link href={`/learn/${lessonId}`} className="no-underline">
        <div className={`boss-glow rounded-full ${isBossActive ? "hex-float" : ""}`}>
          {content}
        </div>
      </Link>
    );
  }

  return content;
}
