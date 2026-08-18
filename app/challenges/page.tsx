"use client";

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { CHALLENGES } from "@/data/challenges";
import { useProgressStore } from "@/store/progress-store";
import { Badge } from "@/components/ui/primitives";

export default function ChallengesPage() {
  const completions = useProgressStore((s) => s.challengeCompletions);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-wider text-accent mono">Challenges</div>
        <h1 className="mt-1.5 text-2xl font-semibold text-foreground">Real problems. Hidden requirements.</h1>
        <p className="mt-2 text-[14px] text-muted">
          You won&apos;t see the exact expected architecture. Discover it by running simulations.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CHALLENGES.map((c) => {
          const best = completions.find((x) => x.challengeId === c.id)?.bestScore;
          return (
            <Link
              key={c.id}
              href={`/challenges/${c.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 p-4 transition-colors hover:border-border-strong"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-foreground">{c.title}</span>
                  {best !== undefined && (
                    <Badge tone="accent" className="text-[10px]">
                      Best {best}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted">{c.description}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-2">
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < c.difficulty ? "fill-accent text-accent" : "text-border-strong"} />
                    ))}
                  </span>
                  <span className="mono">{c.requirements.trafficRps.toLocaleString()} RPS</span>
                </div>
              </div>
              <ArrowRight size={15} className="shrink-0 text-muted-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
