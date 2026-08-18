"use client";

import { LESSONS } from "@/data/lessons";
import { CHALLENGES } from "@/data/challenges";
import { BADGES, getLevelInfo } from "@/lib/gamification";
import { useProgressStore } from "@/store/progress-store";
import { Card, ProgressBar } from "@/components/ui/primitives";
import { Check, Award, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const xp = useProgressStore((s) => s.xp);
  const lessonCompletions = useProgressStore((s) => s.lessonCompletions);
  const challengeCompletions = useProgressStore((s) => s.challengeCompletions);
  const badges = useProgressStore((s) => s.badges);
  const bestScore = useProgressStore((s) => s.bestScore());
  const reset = useProgressStore((s) => s.reset);
  const level = getLevelInfo(xp);

  const xpIntoLevel = xp - level.minXp;
  const xpForLevel = level.nextLevelXp ? level.nextLevelXp - level.minXp : xpIntoLevel || 1;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-accent mono">Your Progress</div>
          <h1 className="mt-1.5 text-2xl font-semibold text-foreground">
            Level {level.level}
            <span className="ml-2 text-lg font-normal text-muted">{level.title}</span>
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={13} /> Reset progress
        </Button>
      </div>

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between text-[13px]">
          <span className="mono text-muted-2">{xp.toLocaleString()} XP</span>
          {level.nextLevelXp && <span className="mono text-muted-2">Next level at {level.nextLevelXp}</span>}
        </div>
        <ProgressBar value={xpIntoLevel} max={xpForLevel} />
      </Card>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">
            {lessonCompletions.length} <span className="text-base text-muted-2">/ {LESSONS.length}</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-2">Lessons</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">
            {challengeCompletions.length} <span className="text-base text-muted-2">/ {CHALLENGES.length}</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-2">Challenges</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">{bestScore || "—"}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-2">Best Score</div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-[11px] uppercase tracking-wider text-muted-2 mono">Completed lessons</div>
        {lessonCompletions.length === 0 ? (
          <p className="text-[13px] text-muted-2">No lessons completed yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {LESSONS.filter((l) => lessonCompletions.some((c) => c.lessonId === l.id)).map((l) => {
              const score = lessonCompletions.find((c) => c.lessonId === l.id)?.bestScore;
              return (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2">
                  <span className="flex items-center gap-2 text-[13px] text-foreground/90">
                    <Check size={13} className="text-accent" /> {l.title}
                  </span>
                  <span className="mono text-[12px] text-muted-2">{score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-2 mono">
          <Award size={12} /> Badges
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {BADGES.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-lg border p-3 ${earned ? "border-accent/30 bg-accent/5" : "border-border bg-surface/20 opacity-50"}`}
              >
                <div className={`text-[12.5px] font-medium ${earned ? "text-accent" : "text-muted"}`}>{b.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-2">{b.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
