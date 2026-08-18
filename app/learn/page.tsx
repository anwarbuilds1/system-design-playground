"use client";

import Link from "next/link";
import { Check, Lock, ArrowRight } from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { useProgressStore } from "@/store/progress-store";
import { Badge } from "@/components/ui/primitives";

export default function LearnPage() {
  const completions = useProgressStore((s) => s.lessonCompletions);
  const completedIds = new Set(completions.map((c) => c.lessonId));

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-wider text-accent mono">Learning path</div>
        <h1 className="mt-1.5 text-2xl font-semibold text-foreground">Six lessons to a scalable mental model.</h1>
        <p className="mt-2 text-[14px] text-muted">Each lesson pairs a short explanation with a hands-on build.</p>
      </div>

      <div className="flex flex-col gap-3">
        {LESSONS.map((lesson, idx) => {
          const done = completedIds.has(lesson.id);
          const prevDone = idx === 0 || completedIds.has(LESSONS[idx - 1].id);
          const locked = !done && !prevDone;
          const bestScore = completions.find((c) => c.lessonId === lesson.id)?.bestScore;

          const content = (
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                locked
                  ? "border-border bg-surface/20 opacity-60"
                  : "border-border bg-surface/50 hover:border-border-strong"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mono text-[13px] ${
                  done ? "bg-accent/15 text-accent" : locked ? "bg-surface-2 text-muted-2" : "bg-surface-2 text-foreground"
                }`}
              >
                {done ? <Check size={15} /> : locked ? <Lock size={13} /> : lesson.index}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-foreground">{lesson.title}</span>
                  {bestScore !== undefined && (
                    <Badge tone="accent" className="text-[10px]">
                      Best {bestScore}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted">{lesson.concept}</p>
              </div>
              {!locked && <ArrowRight size={15} className="text-muted-2" />}
            </div>
          );

          return locked ? (
            <div key={lesson.id}>{content}</div>
          ) : (
            <Link key={lesson.id} href={`/learn/${lesson.id}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
