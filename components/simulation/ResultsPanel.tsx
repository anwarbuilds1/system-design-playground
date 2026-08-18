"use client";

import { AlertTriangle, TrendingUp, Gauge, Database, DollarSign, ShieldCheck, Layers3 } from "lucide-react";
import { Card, Badge, ProgressBar } from "@/components/ui/primitives";
import type { Requirements, SimulationResult } from "@/types/architecture";
import { clsx } from "clsx";

function metricExplanation(key: string, result: SimulationResult, req: Requirements): string {
  const m = result.metrics;
  switch (key) {
    case "latency":
      return m.latencyMs <= req.maxLatencyMs
        ? `Comfortably under the ${req.maxLatencyMs}ms target.`
        : `Above the ${req.maxLatencyMs}ms target — look for the slowest hop in the request path.`;
    case "throughput":
      return m.throughputRps >= req.trafficRps * 0.95
        ? `Sustains the required ${req.trafficRps.toLocaleString()} RPS.`
        : `Falls short of the required ${req.trafficRps.toLocaleString()} RPS — a tier upstream is capping traffic.`;
    case "availability":
      return m.availabilityPct >= req.minAvailability
        ? `Meets the ${req.minAvailability}% target.`
        : `Below the ${req.minAvailability}% target — check for single points of failure.`;
    case "db":
      return `Your database is handling ${m.databaseLoadPct}% of its estimated capacity.`;
    case "cost":
      return `Estimated infrastructure cost per month for this architecture.`;
    case "complexity":
      return `${m.complexity} complexity based on component count and dependencies.`;
    default:
      return "";
  }
}

export function ResultsPanel({ result, requirements }: { result: SimulationResult; requirements: Requirements }) {
  const m = result.metrics;

  const metricCards = [
    { key: "latency", label: "Latency", value: `${m.latencyMs} ms`, icon: Gauge, ok: m.latencyMs <= requirements.maxLatencyMs },
    {
      key: "throughput",
      label: "Throughput",
      value: `${(m.throughputRps / 1000).toFixed(1)}k RPS`,
      icon: TrendingUp,
      ok: m.throughputRps >= requirements.trafficRps * 0.95,
    },
    {
      key: "availability",
      label: "Availability",
      value: `${m.availabilityPct}%`,
      icon: ShieldCheck,
      ok: m.availabilityPct >= requirements.minAvailability,
    },
    { key: "db", label: "Database Load", value: `${m.databaseLoadPct}%`, icon: Database, ok: m.databaseLoadPct < 90 },
    { key: "cost", label: "Est. Cost / mo", value: `$${m.estimatedMonthlyCost}`, icon: DollarSign, ok: true },
    { key: "complexity", label: "Complexity", value: m.complexity, icon: Layers3, ok: m.complexity !== "High" },
  ];

  const breakdownEntries = Object.entries(result.breakdown) as [keyof typeof result.breakdown, number][];

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Score */}
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-2 mono">Architecture Score</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tabular-nums text-foreground">{result.score}</span>
            <span className="text-lg text-muted-2">/ 100</span>
          </div>
        </div>
        <Badge tone={result.meetsRequirements ? "accent" : "warning"} className="text-[11px]">
          {result.meetsRequirements ? "Requirements met" : "Requirements not met"}
        </Badge>
      </Card>

      {/* Breakdown */}
      <Card className="p-5">
        <div className="mb-3 text-[11px] uppercase tracking-wider text-muted-2 mono">Breakdown</div>
        <div className="flex flex-col gap-3">
          {breakdownEntries.map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="capitalize text-foreground/80">{key}</span>
                <span className="mono text-muted-2">{value}/20</span>
              </div>
              <ProgressBar value={value} max={20} />
            </div>
          ))}
        </div>
      </Card>

      {/* System health metrics */}
      <Card className="p-5">
        <div className="mb-3 text-[11px] uppercase tracking-wider text-muted-2 mono">System Health</div>
        <div className="grid grid-cols-2 gap-3">
          {metricCards.map(({ key, label, value, icon: Icon, ok }) => (
            <div key={key} className="rounded-lg border border-border bg-surface-2/50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-2">
                <Icon size={12} className={ok ? "text-accent" : "text-warning"} />
                {label}
              </div>
              <div className="mono text-lg font-medium text-foreground">{value}</div>
              <div className="mt-1 text-[11px] leading-snug text-muted-2">{metricExplanation(key, result, requirements)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottlenecks */}
      {result.bottlenecks.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-2 mono">
            <AlertTriangle size={12} className="text-warning" /> Bottlenecks
          </div>
          <div className="flex flex-col gap-2.5">
            {result.bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className={clsx(
                  "rounded-lg border p-3 text-[13px]",
                  b.severity === "critical" ? "border-danger/40 bg-danger/5" : "border-warning/40 bg-warning/5",
                )}
              >
                <div className="font-medium text-foreground">{b.message}</div>
                <div className="mt-0.5 text-[12px] text-muted">{b.explanation}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trade-off feedback */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2.5 text-[11px] uppercase tracking-wider text-accent mono">What you did well</div>
          {result.commendations.length === 0 ? (
            <p className="text-[13px] text-muted-2">Nothing stood out yet — iterate and run again.</p>
          ) : (
            <ul className="space-y-1.5">
              {result.commendations.map((c) => (
                <li key={c} className="flex gap-1.5 text-[13px] text-foreground/85">
                  <span className="text-accent">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <div className="mb-2.5 text-[11px] uppercase tracking-wider text-warning mono">What could improve</div>
          {result.deductions.length === 0 ? (
            <p className="text-[13px] text-muted-2">No penalties detected. Solid work.</p>
          ) : (
            <ul className="space-y-1.5">
              {result.deductions.map((d, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 text-[13px] text-foreground/85">
                  <span className="flex gap-1.5">
                    <span className="text-warning">⚠</span>
                    {d.label}
                  </span>
                  <span className="mono text-[12px] text-muted-2">{d.points}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
