"use client";

import { useState } from "react";
import { Play, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Architecture, Requirements, SimulationResult } from "@/types/architecture";
import type { ValidationResult } from "@/lib/simulation/validators";

const STAGES = ["Distributing traffic", "Checking API capacity", "Checking database load", "Scanning for bottlenecks"];

export function SimulationRunner({
  architecture,
  requirements,
  onResult,
}: {
  architecture: Architecture;
  requirements: Requirements;
  onResult: (result: SimulationResult | null, validation: ValidationResult) => void;
}) {
  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);

  const run = () => {
    setRunning(true);
    setStageIndex(0);
    let i = 0;
    const interval = setInterval(async () => {
      i += 1;
      if (i >= STAGES.length) {
        clearInterval(interval);
        try {
          const res = await fetch("/api/simulations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ architecture, requirements }),
          });
          const data = await res.json();
          onResult(data.result ?? null, data.validation);
        } catch {
          onResult(null, { valid: false, issues: [{ message: "Could not reach the simulation service." }] });
        } finally {
          setRunning(false);
          setStageIndex(-1);
        }
      } else {
        setStageIndex(i);
      }
    }, 260);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={run} disabled={running} size="lg">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {running ? "Running simulation…" : "Run Simulation"}
      </Button>
      {running && (
        <div className="w-64 rounded-lg border border-border bg-surface p-3 mono text-[12px] animate-fade-up">
          <div className="mb-2 text-muted-2">
            Sending {requirements.trafficRps.toLocaleString()} requests/sec…
          </div>
          <div className="mb-2.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-accent transition-all duration-300 ease-linear"
              style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-1">
            {STAGES.map((s, idx) => (
              <li key={s} className="flex items-center gap-1.5">
                {idx < stageIndex ? (
                  <Check size={11} className="text-accent" />
                ) : idx === stageIndex ? (
                  <Loader2 size={11} className="animate-spin text-accent" />
                ) : (
                  <span className="h-[11px] w-[11px] rounded-full border border-border-strong" />
                )}
                <span className={idx <= stageIndex ? "text-foreground/80" : "text-muted-2"}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
