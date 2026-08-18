"use client";

import { useState } from "react";
import { RefreshCcw, Save, FolderOpen, LayoutTemplate } from "lucide-react";
import { COMPONENTS } from "@/data/components";
import { TEMPLATES } from "@/data/templates";
import { useArchitecture } from "@/lib/architecture/useArchitecture";
import { ArchitectureCanvas } from "@/components/canvas/ArchitectureCanvas";
import { SimulationRunner } from "@/components/simulation/SimulationRunner";
import { ResultsPanel } from "@/components/simulation/ResultsPanel";
import { ValidationErrors } from "@/components/simulation/ValidationErrors";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playground-store";
import { useProgressStore } from "@/store/progress-store";
import type { ComponentType, Requirements, SimulationResult } from "@/types/architecture";
import type { ValidationResult } from "@/lib/simulation/validators";

const ALL_COMPONENTS = Object.keys(COMPONENTS) as ComponentType[];

const DEFAULT_REQUIREMENTS: Requirements = {
  id: "playground",
  name: "Custom",
  trafficRps: 2000,
  maxLatencyMs: 150,
  minAvailability: 99,
};

export default function PlaygroundPage() {
  const builder = useArchitecture();
  const [requirements, setRequirements] = useState<Requirements>(DEFAULT_REQUIREMENTS);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [menuOpen, setMenuOpen] = useState<"templates" | "saved" | null>(null);
  const [nameInput, setNameInput] = useState("");

  const saved = usePlaygroundStore((s) => s.saved);
  const save = usePlaygroundStore((s) => s.save);
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
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => { builder.reset(); setResult(null); setValidation(null); }}>
            <RefreshCcw size={13} /> New Architecture
          </Button>
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setMenuOpen(menuOpen === "templates" ? null : "templates")}>
              <LayoutTemplate size={13} /> Templates
            </Button>
            {menuOpen === "templates" && (
              <div className="absolute left-0 top-10 z-20 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-xl">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      builder.loadArchitecture(t.architecture);
                      setMenuOpen(null);
                      setResult(null);
                    }}
                    className="block w-full rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-surface-2"
                  >
                    <div className="text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-2">{t.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setMenuOpen(menuOpen === "saved" ? null : "saved")}>
              <FolderOpen size={13} /> Load
            </Button>
            {menuOpen === "saved" && (
              <div className="absolute left-0 top-10 z-20 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-xl">
                {saved.length === 0 ? (
                  <p className="px-2.5 py-2 text-[12px] text-muted-2">Nothing saved yet.</p>
                ) : (
                  saved.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        builder.loadArchitecture(a.architecture);
                        setMenuOpen(null);
                        setResult(null);
                      }}
                      className="block w-full truncate rounded-md px-2.5 py-2 text-left text-[13px] text-foreground hover:bg-surface-2"
                    >
                      {a.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Architecture name"
              className="w-40 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-[12.5px] text-foreground outline-none focus:border-accent"
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!nameInput.trim()}
              onClick={() => {
                save(nameInput.trim(), builder.architecture);
                setNameInput("");
              }}
            >
              <Save size={13} /> Save
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RequirementField
            label="RPS"
            value={requirements.trafficRps}
            onChange={(v) => setRequirements((r) => ({ ...r, trafficRps: v }))}
          />
          <RequirementField
            label="Max ms"
            value={requirements.maxLatencyMs}
            onChange={(v) => setRequirements((r) => ({ ...r, maxLatencyMs: v }))}
          />
          <SimulationRunner architecture={builder.architecture} requirements={requirements} onResult={handleResult} />
        </div>
      </div>

      <div className="mx-auto flex h-40 w-full max-w-6xl items-center justify-center rounded-xl border border-border bg-surface/40 px-6 text-center text-[13px] text-muted md:hidden">
        The playground is optimized for desktop. Open this page on a larger screen to build architectures.
      </div>
      <div className="mx-auto hidden h-[560px] w-full max-w-6xl md:block">
        <ArchitectureCanvas builder={builder} availableComponents={ALL_COMPONENTS} />
      </div>

      {validation && !validation.valid && (
        <div className="mx-auto w-full max-w-6xl">
          <ValidationErrors validation={validation} />
        </div>
      )}
      {result && (
        <div className="mx-auto w-full max-w-6xl">
          <ResultsPanel result={result} requirements={requirements} />
        </div>
      )}
    </div>
  );
}

function RequirementField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-[12px] text-muted-2">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 rounded-md border border-border-strong bg-surface px-2 py-1 mono text-[12.5px] text-foreground outline-none focus:border-accent"
      />
    </label>
  );
}
