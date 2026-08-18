"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getLesson, getNextLesson } from "@/data/lessons";
import { useArchitecture } from "@/lib/architecture/useArchitecture";
import { ArchitectureCanvas } from "@/components/canvas/ArchitectureCanvas";
import { SimulationRunner } from "@/components/simulation/SimulationRunner";
import { ResultsPanel } from "@/components/simulation/ResultsPanel";
import { ValidationErrors } from "@/components/simulation/ValidationErrors";
import { XpToast } from "@/components/ui/xp-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useProgressStore } from "@/store/progress-store";
import type { SimulationResult } from "@/types/architecture";
import type { ValidationResult } from "@/lib/simulation/validators";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lesson = getLesson(params.lessonId);
  if (!lesson) notFound();

  const nextLesson = getNextLesson(lesson.id);
  const [tab, setTab] = useState<"learn" | "build">("learn");
  const builder = useArchitecture();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completions = useProgressStore((s) => s.lessonCompletions);
  const awardBadge = useProgressStore((s) => s.awardBadge);
  const alreadyDone = completions.some((c) => c.lessonId === lesson.id);

  const handleResult = (r: SimulationResult | null, v: ValidationResult) => {
    setValidation(v);
    setResult(r);
    if (r) {
      const bottleneckMap: Record<string, "warning" | "critical"> = {};
      r.bottlenecks.forEach((b) => (bottleneckMap[b.nodeId] = b.severity === "critical" ? "critical" : "warning"));
      builder.setBottlenecks(bottleneckMap);

      awardBadge("first-architecture");
      awardBadge("first-simulation");
      if (r.bottlenecks.length === 0) awardBadge("zero-bottlenecks");
      if (r.metrics.databaseLoadPct < 50 && builder.architecture.nodes.some((n) => n.type === "redis")) {
        awardBadge("cache-master");
      }
      if (builder.architecture.nodes.some((n) => n.type === "load_balancer")) awardBadge("scaling-beginner");
      if (r.score >= 90) awardBadge("architecture-optimizer");

      if (r.meetsRequirements) {
        const { xpAwarded } = completeLesson(lesson.id, r.score, lesson.xpReward);
        setXpGain(xpAwarded);
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-surface/30 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-accent mono">Lesson {lesson.index} of 6</div>
            <h1 className="text-[15px] font-medium text-foreground">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            <TabButton active={tab === "learn"} onClick={() => setTab("learn")}>
              1. Learn
            </TabButton>
            <TabButton active={tab === "build"} onClick={() => setTab("build")}>
              2. Build &amp; Simulate
            </TabButton>
          </div>
        </div>
      </div>

      {tab === "learn" ? (
        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
          <h2 className="text-2xl font-semibold text-foreground">{lesson.concept}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{lesson.explain}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-accent mono">Why use it?</div>
              <ul className="space-y-1.5">
                {lesson.whyUseIt.map((w) => (
                  <li key={w} className="flex gap-1.5 text-[13px] text-foreground/85">
                    <span className="text-accent">+</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-warning mono">Trade-offs</div>
              <ul className="space-y-1.5">
                {lesson.tradeoffs.map((w) => (
                  <li key={w} className="flex gap-1.5 text-[13px] text-foreground/85">
                    <span className="text-warning">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-5">
            <div className="mb-1.5 text-[11px] uppercase tracking-wide text-accent mono">Your challenge</div>
            <p className="text-[14px] text-foreground/90">{lesson.challengePrompt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{lesson.requirements.trafficRps.toLocaleString()} RPS</Badge>
              <Badge>Latency &lt; {lesson.requirements.maxLatencyMs}ms</Badge>
              <Badge>Availability &gt; {lesson.requirements.minAvailability}%</Badge>
            </div>
          </div>

          <Button size="lg" className="mt-8" onClick={() => setTab("build")}>
            Open the playground <ArrowRight size={15} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <p className="max-w-lg text-[13px] text-muted">{lesson.challengePrompt}</p>
            <SimulationRunner architecture={builder.architecture} requirements={lesson.requirements} onResult={handleResult} />
          </div>
          <div className="mx-auto flex h-40 w-full max-w-6xl items-center justify-center rounded-xl border border-border bg-surface/40 px-6 text-center text-[13px] text-muted md:hidden">
            The playground is optimized for desktop. Open this page on a larger screen to build architectures.
          </div>
          <div className="mx-auto hidden h-[560px] w-full max-w-6xl md:block">
            <ArchitectureCanvas builder={builder} availableComponents={lesson.availableComponents} />
          </div>
          {validation && !validation.valid && (
            <div className="mx-auto w-full max-w-6xl">
              <ValidationErrors validation={validation} />
            </div>
          )}
          {result && (
            <div className="mx-auto w-full max-w-6xl">
              <ResultsPanel result={result} requirements={lesson.requirements} />
              {result.meetsRequirements && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-5">
                  <div className="flex items-center gap-2 text-[14px] text-foreground">
                    <Check size={16} className="text-accent" />
                    {alreadyDone ? "Nice run — lesson already completed." : "Lesson complete."}
                  </div>
                  {nextLesson ? (
                    <Link href={`/learn/${nextLesson.id}`}>
                      <Button>
                        Next: {nextLesson.title} <ArrowRight size={14} />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/challenges">
                      <Button>
                        Try a challenge <ArrowRight size={14} />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {xpGain !== null && <XpToast amount={xpGain} onDone={() => setXpGain(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
        active ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
