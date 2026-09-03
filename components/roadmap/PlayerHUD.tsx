"use client";

import { getLevelInfo } from "@/lib/gamification";

interface PlayerHUDProps {
  xp: number;
}

export function PlayerHUD({ xp }: PlayerHUDProps) {
  const level = getLevelInfo(xp);
  const nextXp = level.nextLevelXp ?? 9999;
  const pct = Math.min(100, Math.round(((xp - level.minXp) / (nextXp - level.minXp)) * 100));

  return (
    <div
      className="w-full rounded-2xl border p-5 flex items-center gap-6 mb-8"
      style={{
        background: "rgba(15,17,19,0.9)",
        borderColor: "rgba(52,211,153,0.2)",
        boxShadow: "0 0 40px rgba(52,211,153,0.06), 0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Hex level badge */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: 64, height: 74 }}>
        <svg width={64} height={74} viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="50,2 98,27 98,77 50,102 2,77 2,27"
            fill="rgba(52,211,153,0.1)"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="50,2 98,27 98,77 50,102 2,77 2,27"
            fill="none"
            stroke="#34d399"
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.3"
            transform="scale(1.08) translate(-4,-5)"
          />
        </svg>
        <span
          className="absolute mono font-black text-2xl"
          style={{ color: "#34d399", textShadow: "0 0 12px rgba(52,211,153,0.6)" }}
        >
          {level.level}
        </span>
      </div>

      {/* Level info + XP bar */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-foreground">Level {level.level}</div>
            <div className="text-sm text-muted">{level.title}</div>
          </div>
          <div
            className="mono text-sm font-semibold px-3 py-1.5 rounded-xl border"
            style={{
              color: "#34d399",
              borderColor: "rgba(52,211,153,0.25)",
              background: "rgba(52,211,153,0.07)",
            }}
          >
            {xp.toLocaleString()} XP
          </div>
        </div>

        {/* XP progress bar */}
        <div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#15171a" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                boxShadow: "0 0 10px rgba(52,211,153,0.5)",
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted">Progress to Level {level.level + 1}</span>
            <span className="mono text-[11px] text-muted">
              {xp.toLocaleString()} / {nextXp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* Right: quest summary */}
      <div
        className="hidden md:flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center"
        style={{
          background: "rgba(21,23,26,0.8)",
          borderColor: "#212327",
        }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Your Journey
        </div>
        <div className="text-xl font-black text-foreground">System Design</div>
        <div className="text-[11px] text-muted">Master distributed systems</div>
      </div>
    </div>
  );
}
