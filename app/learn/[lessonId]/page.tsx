"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock, Zap, AlertTriangle, ChevronRight } from "lucide-react";
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

// --- Icon map for concept nodes in the diagram ---
const COMPONENT_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  client: { icon: "🖥", label: "Client", color: "rgba(52,211,153,0.15)" },
  api_server: { icon: "⚙", label: "API Server", color: "rgba(99,102,241,0.18)" },
  postgres: { icon: "🗄", label: "Database", color: "rgba(251,191,36,0.15)" },
  mongodb: { icon: "🗄", label: "Database", color: "rgba(251,191,36,0.15)" },
  load_balancer: { icon: "⚖", label: "Load Balancer", color: "rgba(248,113,113,0.15)" },
  redis: { icon: "⚡", label: "Redis Cache", color: "rgba(248,113,113,0.18)" },
  cdn: { icon: "🌐", label: "CDN", color: "rgba(52,211,153,0.15)" },
  queue: { icon: "📨", label: "Queue", color: "rgba(251,191,36,0.15)" },
  worker: { icon: "🔧", label: "Worker", color: "rgba(99,102,241,0.18)" },
};

function ConceptDiagram({ components }: { components: string[] }) {
  // Show at most the key architectural components (excluding 'client' from display row since it's implied)
  const displayComponents = components.filter((c) => c !== "client").slice(0, 4);

  return (
    <div className="relative flex items-center justify-center gap-0 py-2">
      {displayComponents.map((comp, idx) => {
        const info = COMPONENT_ICONS[comp] ?? { icon: "📦", label: comp, color: "rgba(139,141,145,0.15)" };
        return (
          <div key={comp} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: info.color,
                  borderColor: info.color.replace("0.15", "0.4").replace("0.18", "0.45"),
                  boxShadow: `0 4px 20px ${info.color.replace("0.15", "0.25")}`,
                }}
              >
                {info.icon}
              </div>
              <span className="text-[11px] font-medium text-muted">{info.label}</span>
            </div>
            {idx < displayComponents.length - 1 && (
              <div className="mx-3 mb-5 flex items-center gap-1">
                <div className="h-[1px] w-6 bg-gradient-to-r from-border to-accent/40" />
                <ChevronRight size={12} className="text-accent/60 -ml-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      {/* ── Sub-header / breadcrumb bar ─────────────────────────────── */}
      <div className="border-b border-border/60 bg-surface/50 backdrop-blur-sm px-6 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            href="/learn"
            className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Learn
          </Link>
          {/* Tab switcher */}
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

      {/* ── LEARN TAB ────────────────────────────────────────────────── */}
      {tab === "learn" ? (
        <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-14">
          {/* Lesson index pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-accent">
              LESSON {String(lesson.index).padStart(2, "0")}
            </span>
          </div>

          {/* Title + Goal */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted max-w-xl">
            <span className="font-semibold text-foreground/70">Goal:</span> {lesson.concept}
          </p>

          {/* ── Concept Diagram card ────────────────────────────────── */}
          <div className="mt-8 rounded-2xl border border-border/70 bg-surface/60 p-6 backdrop-blur-sm shadow-lg overflow-hidden relative">
            {/* glow */}
            <div
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(52,211,153,0.08)" }}
            />
            <ConceptDiagram components={lesson.availableComponents} />
          </div>

          {/* ── Concepts in this lesson ─────────────────────────────── */}
          <div className="mt-10">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted mb-4">
              Concepts in this lesson
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {lesson.teaches.slice(0, 6).map((t) => (
                <div
                  key={t}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface/40 p-4 hover:border-accent/30 hover:bg-surface/60 transition-all duration-200"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/15 border border-accent/25">
                    <Check size={11} className="text-accent" strokeWidth={2.8} />
                  </div>
                  <span className="text-[13px] font-medium text-foreground/85 leading-snug">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Explanation ─────────────────────────────────────────── */}
          <div className="mt-8 rounded-xl border border-border/60 bg-surface/30 p-5">
            <p className="text-[14px] leading-relaxed text-muted">{lesson.explain}</p>
          </div>

          {/* ── Why / Trade-offs side-by-side ───────────────────────── */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-surface/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 border border-accent/25">
                  <Zap size={12} className="text-accent" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent mono">Why this architecture?</span>
              </div>
              <ul className="space-y-2">
                {lesson.whyUseIt.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-[13px] text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/70 bg-surface/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning/15 border border-warning/25">
                  <AlertTriangle size={12} className="text-warning" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-warning mono">Trade-offs</span>
              </div>
              <ul className="space-y-2">
                {lesson.tradeoffs.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-[13px] text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/60" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Challenge prompt ────────────────────────────────────── */}
          <div className="mt-6 rounded-xl border border-accent/25 bg-accent/5 p-5">
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-accent mono font-bold">Your Challenge</div>
            <p className="text-[14px] text-foreground/90 leading-relaxed">{lesson.challengePrompt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <MetricBadge>{lesson.requirements.trafficRps.toLocaleString()} RPS</MetricBadge>
              <MetricBadge>Latency &lt; {lesson.requirements.maxLatencyMs}ms</MetricBadge>
              <MetricBadge>Availability &gt; {lesson.requirements.minAvailability}%</MetricBadge>
            </div>
          </div>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setTab("build")}
              className="group relative flex items-center gap-3 rounded-xl px-10 py-4 text-[15px] font-semibold text-background transition-all duration-200 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                boxShadow: "0 0 30px rgba(52,211,153,0.35), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              {/* shimmer */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/10 transition-transform duration-700 group-hover:translate-x-full"
              />
              Start Building
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* XP reward hint */}
          <p className="mt-3 text-center text-[12px] text-muted">
            Complete this lesson to earn{" "}
            <span className="font-semibold text-accent">{lesson.xpReward} XP</span>
          </p>
        </div>
      ) : (
        /* ── BUILD TAB ────────────────────────────────────────────── */
        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <p className="max-w-lg text-[13px] text-muted">{lesson.challengePrompt}</p>
            <SimulationRunner
              architecture={builder.architecture}
              requirements={lesson.requirements}
              onResult={handleResult}
            />
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

// ── Small helpers ────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

function MetricBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-accent/25 bg-accent/8 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent">
      {children}
    </span>
  );
}
