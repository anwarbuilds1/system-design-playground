"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Check, Star } from "lucide-react";
import { getChallenge } from "@/data/challenges";
import { COMPONENTS } from "@/data/components";
import { useArchitecture } from "@/lib/architecture/useArchitecture";
import { ArchitectureCanvas } from "@/components/canvas/ArchitectureCanvas";
import { SimulationRunner } from "@/components/simulation/SimulationRunner";
import { ResultsPanel } from "@/components/simulation/ResultsPanel";
import { ValidationErrors } from "@/components/simulation/ValidationErrors";
import { Badge } from "@/components/ui/primitives";
import { XpToast } from "@/components/ui/xp-toast";
import { useProgressStore } from "@/store/progress-store";
import type { SimulationResult } from "@/types/architecture";
import type { ValidationResult } from "@/lib/simulation/validators";

export default function ChallengePage() {
  const params = useParams<{ challengeId: string }>();
  const challenge = getChallenge(params.challengeId);
  if (!challenge) notFound();

  const builder = useArchitecture();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const completeChallenge = useProgressStore((s) => s.completeChallenge);
  const awardBadge = useProgressStore((s) => s.awardBadge);

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
        const { xpAwarded } = completeChallenge(challenge.id, r.score, challenge.xpReward);
        setXpGain(xpAwarded);
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-[16px] font-medium text-foreground">{challenge.title}</h1>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < challenge.difficulty ? "fill-accent text-accent" : "text-border-strong"} />
              ))}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-[13px] text-muted">{challenge.description}</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-2">Requirements</div>
              <ul className="space-y-1">
                {challenge.requirementsList.map((r) => (
                  <li key={r} className="text-[12.5px] text-foreground/85">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-2">Constraints</div>
              <div className="flex flex-wrap gap-1.5">
                {challenge.constraints.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
                <Badge>{challenge.requirements.trafficRps.toLocaleString()} RPS</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <SimulationRunner architecture={builder.architecture} requirements={challenge.requirements} onResult={handleResult} />
      </div>

      <div className="mx-auto flex h-40 w-full max-w-6xl items-center justify-center rounded-xl border border-border bg-surface/40 px-6 text-center text-[13px] text-muted md:hidden">
        The playground is optimized for desktop. Open this page on a larger screen to build architectures.
      </div>
      <div className="mx-auto hidden h-[560px] w-full max-w-6xl md:block">
        <ArchitectureCanvas builder={builder} availableComponents={challenge.availableComponents} />
      </div>

      {validation && !validation.valid && (
        <div className="mx-auto w-full max-w-6xl">
          <ValidationErrors validation={validation} />
        </div>
      )}

      {result && (
        <div className="mx-auto w-full max-w-6xl">
          <ResultsPanel result={result} requirements={challenge.requirements} />
          {result.meetsRequirements && (
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-[14px] text-foreground">
                <Check size={16} className="text-accent" /> Challenge passed.
              </div>
              <p className="text-[13px] text-muted">
                The expected reasoning: {challenge.expected.map((t) => COMPONENTS[t].name).join(", ")}
                {challenge.optional.length > 0 && (
                  <> — with {challenge.optional.map((t) => COMPONENTS[t].name).join(", ")} as an optional improvement.</>
                )}{" "}
                Multiple architectures can satisfy this challenge; yours is one valid solution.
              </p>
            </div>
          )}
        </div>
      )}

      {xpGain !== null && <XpToast amount={xpGain} onDone={() => setXpGain(null)} />}
    </div>
  );
}
