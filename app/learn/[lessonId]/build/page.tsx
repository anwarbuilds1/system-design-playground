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
import { useProgressStore } from "@/store/progress-store";
import type { SimulationResult } from "@/types/architecture";
import type { ValidationResult } from "@/lib/simulation/validators";

export default function BuildPage() {
  const params = useParams<{ lessonId: string }>();
  const lesson = getLesson(params.lessonId);
  if (!lesson) notFound();

  const nextLesson = getNextLesson(lesson.id);
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
    if (!r) return;

    const bottleneckMap: Record<string, "warning" | "critical"> = {};
    r.bottlenecks.forEach((b) => (bottleneckMap[b.nodeId] = b.severity === "critical" ? "critical" : "warning"));
    builder.setBottlenecks(bottleneckMap);

    awardBadge("first-architecture");
    awardBadge("first-simulation");
    if (r.bottlenecks.length === 0) awardBadge("zero-bottlenecks");
    if (r.metrics.databaseLoadPct < 50 && builder.architecture.nodes.some((n) => n.type === "redis"))
      awardBadge("cache-master");
    if (builder.architecture.nodes.some((n) => n.type === "load_balancer")) awardBadge("scaling-beginner");
    if (r.score >= 90) awardBadge("architecture-optimizer");

    if (r.meetsRequirements) {
      const { xpAwarded } = completeLesson(lesson.id, r.score, lesson.xpReward);
      setXpGain(xpAwarded);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Toolbar row */}
      <div className="shrink-0 flex items-center justify-between gap-4 border-b border-border/40 bg-surface/20 px-4 py-2.5">
        <p className="text-[13px] text-muted truncate max-w-xl">{lesson.challengePrompt}</p>
        <SimulationRunner
          architecture={builder.architecture}
          requirements={lesson.requirements}
          onResult={handleResult}
        />
      </div>

      {/* Mobile fallback */}
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-muted md:hidden">
        The playground is optimized for desktop. Open this page on a larger screen.
      </div>

      {/* Canvas — fills all remaining height */}
      <div className="hidden flex-1 min-h-0 flex-col p-3 md:flex">
        <ArchitectureCanvas builder={builder} availableComponents={lesson.availableComponents} />
      </div>

      {/* Results */}
      {validation && !validation.valid && (
        <div className="shrink-0 px-4 pb-3">
          <ValidationErrors validation={validation} />
        </div>
      )}
      {result && (
        <div className="shrink-0 px-4 pb-4 space-y-3">
          <ResultsPanel result={result} requirements={lesson.requirements} />
          {result.meetsRequirements && (
            <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center gap-2 text-[14px] text-foreground">
                <Check size={16} className="text-accent" />
                {alreadyDone ? "Nice run — lesson already completed." : "Lesson complete!"}
              </div>
              {nextLesson ? (
                <Link href={`/learn/${nextLesson.id}`}>
                  <Button>Next: {nextLesson.title} <ArrowRight size={14} /></Button>
                </Link>
              ) : (
                <Link href="/challenges">
                  <Button>Try a challenge <ArrowRight size={14} /></Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {xpGain !== null && <XpToast amount={xpGain} onDone={() => setXpGain(null)} />}
    </div>
  );
}
