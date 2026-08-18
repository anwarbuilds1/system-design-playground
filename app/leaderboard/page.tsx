"use client";

import { Trophy } from "lucide-react";
import { useProgressStore } from "@/store/progress-store";
import { getLevelInfo } from "@/lib/gamification";
import { Card } from "@/components/ui/primitives";
import { clsx } from "clsx";

const MOCK_ENTRIES = [
  { name: "priya.dev", xp: 2840 },
  { name: "kernel_panic", xp: 2210 },
  { name: "shipfast", xp: 1690 },
  { name: "queue.worker", xp: 1120 },
  { name: "load_bearing_dev", xp: 640 },
];

export default function LeaderboardPage() {
  const xp = useProgressStore((s) => s.xp);

  const entries = [...MOCK_ENTRIES, { name: "you", xp }].sort((a, b) => b.xp - a.xp);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-wider text-accent mono">Leaderboard</div>
        <h1 className="mt-1.5 text-2xl font-semibold text-foreground">Top builders this season</h1>
        <p className="mt-2 text-[14px] text-muted">Illustrative for the MVP — global ranking ships later.</p>
      </div>

      <Card className="divide-y divide-border p-0">
        {entries.map((entry, idx) => {
          const isYou = entry.name === "you";
          const level = getLevelInfo(entry.xp);
          return (
            <div
              key={entry.name + idx}
              className={clsx("flex items-center justify-between px-4 py-3", isYou && "bg-accent/5")}
            >
              <div className="flex items-center gap-3">
                <span className={clsx("mono w-5 text-[12px]", idx === 0 ? "text-accent" : "text-muted-2")}>
                  {idx === 0 ? <Trophy size={13} /> : `#${idx + 1}`}
                </span>
                <span className={clsx("text-[13.5px]", isYou ? "font-medium text-accent" : "text-foreground/90")}>
                  {isYou ? "You" : entry.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-muted-2">
                <span>Lv.{level.level}</span>
                <span className="mono">{entry.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
