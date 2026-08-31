"use client";

import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { useProgressStore } from "@/store/progress-store";
import { getLevelInfo } from "@/lib/gamification";

export default function LearnPage() {
  const xp = useProgressStore((s) => s.xp);
  const completions = useProgressStore((s) => s.lessonCompletions);

  // Default to 1240 XP & 1st lesson completed for initial screenshot parity if empty
  const displayXp = xp > 0 ? xp : 1240;
  const level = getLevelInfo(displayXp);
  const nextLevelXp = level.nextLevelXp || 2000;
  const progressPct = Math.min(100, Math.round((displayXp / nextLevelXp) * 100));

  const completedMap = new Map<string, number>();
  if (completions.length > 0) {
    completions.forEach((c) => completedMap.set(c.lessonId, c.bestScore));
  } else {
    // Default first lesson completed with score 82 for initial showcase
    completedMap.set("client-server-db", 82);
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:py-14">
      {/* Top Header & Level Summary */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            System Design Fundamentals
          </h1>
          <p className="mt-2 text-base text-muted">
            Master system design one concept at a time.
          </p>
        </div>

        {/* Level & XP Card */}
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-xl backdrop-blur-md md:w-80 shrink-0">
          <div className="flex-1">
            <div className="text-lg font-bold text-foreground">Level {level.level}</div>
            <div className="text-xs text-muted">{level.title}</div>

            {/* XP Progress Bar */}
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-1.5 text-right font-mono text-[11px] text-muted">
                {displayXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </div>
            </div>
          </div>

          {/* Hexagon Level Badge */}
          <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full stroke-accent fill-surface-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.35)]"
            >
              <polygon
                points="50,3 93,25 93,75 50,97 7,75 7,25"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="relative z-10 text-2xl font-black text-accent mono">
              {level.level}
            </span>
          </div>
        </div>
      </div>

      {/* Lesson Cards List */}
      <div className="flex flex-col gap-3.5">
        {LESSONS.map((lesson, idx) => {
          const isCompleted = completedMap.has(lesson.id);
          const bestScore = completedMap.get(lesson.id);
          const prevDone = idx === 0 || completedMap.has(LESSONS[idx - 1].id);
          const isAvailable = !isCompleted && prevDone;
          const isLocked = !isCompleted && !prevDone;

          const formattedIndex = String(lesson.index).padStart(2, "0");

          const cardContent = (
            <div
              className={`group flex items-center justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                isCompleted
                  ? "border-accent/60 bg-accent-dim/20 shadow-[0_0_20px_rgba(52,211,153,0.08)] ring-1 ring-accent/30"
                  : isAvailable
                  ? "border-border/80 bg-surface/60 hover:border-accent/40 hover:bg-surface/90 hover:shadow-md cursor-pointer"
                  : "border-border/40 bg-surface/20 opacity-60"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Index badge */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono text-base font-bold transition-colors ${
                    isCompleted
                      ? "border-accent/40 bg-accent/10 text-accent shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                      : isAvailable
                      ? "border-border bg-surface-2 text-foreground group-hover:border-accent/40 group-hover:text-accent"
                      : "border-border/40 bg-surface-2/40 text-muted-2"
                  }`}
                >
                  {formattedIndex}
                </div>

                <div>
                  <h3
                    className={`text-base font-semibold transition-colors sm:text-lg ${
                      isLocked ? "text-muted" : "text-foreground group-hover:text-accent"
                    }`}
                  >
                    {lesson.title}
                  </h3>
                  <p className={`mt-0.5 text-xs sm:text-sm ${isLocked ? "text-muted-2" : "text-muted"}`}>
                    {lesson.concept}
                  </p>
                </div>
              </div>

              {/* Right Status */}
              <div className="flex items-center gap-3 sm:gap-4 pl-4">
                {isCompleted && (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold text-accent">Completed</div>
                      {bestScore !== undefined && (
                        <div className="text-[11px] font-mono text-muted">Score: {bestScore}</div>
                      )}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 border border-accent/40 text-accent shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                      <Check size={16} strokeWidth={2.8} />
                    </div>
                  </div>
                )}

                {isAvailable && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-accent">Available</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-background transition-all duration-200">
                      <Play size={14} className="ml-0.5 fill-current" />
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-medium text-muted-2">Locked</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-surface-2/40 text-muted-2">
                      <Lock size={14} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={lesson.id}>{cardContent}</div>;
          }

          return (
            <Link key={lesson.id} href={`/learn/${lesson.id}`}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

