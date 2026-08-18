import type { Architecture, Requirements, SimulationResult } from "@/types/architecture";
import { deriveGraph, calculateMetrics } from "./metrics";
import { evaluateRules } from "./rules";
import { calculateScore } from "./scoring";
import { validateArchitecture, type ValidationResult } from "./validators";

export interface RunSimulationOutput {
  validation: ValidationResult;
  result: SimulationResult | null;
}

/**
 * Deterministic, rule-based simulation. No AI, no randomness — the same
 * architecture + requirements always produce the same result, which keeps
 * the engine testable and the feedback trustworthy.
 */
export function runSimulation(architecture: Architecture, requirements: Requirements): RunSimulationOutput {
  const validation = validateArchitecture(architecture);
  if (!validation.valid) {
    return { validation, result: null };
  }

  const graph = deriveGraph(architecture);
  const metrics = calculateMetrics(architecture, requirements, graph);
  const { bottlenecks, warnings } = evaluateRules(architecture, requirements, graph, metrics);
  const { score, breakdown, deductions, commendations, meetsRequirements } = calculateScore(
    architecture,
    requirements,
    graph,
    metrics,
    bottlenecks,
  );

  return {
    validation,
    result: {
      metrics,
      bottlenecks,
      warnings,
      score,
      breakdown,
      deductions,
      commendations,
      meetsRequirements,
    },
  };
}
