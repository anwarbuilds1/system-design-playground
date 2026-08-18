import type {
  Architecture,
  Bottleneck,
  Requirements,
  ScoreBreakdown,
  ScoreDeduction,
  SimulationMetrics,
} from "@/types/architecture";
import type { DerivedGraph } from "./metrics";

export interface ScoringOutput {
  score: number;
  breakdown: ScoreBreakdown;
  deductions: ScoreDeduction[];
  commendations: string[];
  meetsRequirements: boolean;
}

function clamp(n: number, min = 0, max = 20) {
  return Math.max(min, Math.min(max, n));
}

export function calculateScore(
  architecture: Architecture,
  requirements: Requirements,
  graph: DerivedGraph,
  metrics: SimulationMetrics,
  bottlenecks: Bottleneck[],
): ScoringOutput {
  const deductions: ScoreDeduction[] = [];
  const commendations: string[] = [];

  // --- Scalability (20) ---
  let scalability = 10;
  const meetsThroughput = metrics.throughputRps >= requirements.trafficRps * 0.95;
  if (meetsThroughput) {
    scalability += 6;
    commendations.push("Your architecture sustains the required traffic.");
  } else {
    deductions.push({ label: "Throughput below required traffic", points: -8 });
    scalability -= 8;
  }
  if (graph.numApiServers > 1 && graph.hasLoadBalancer) {
    scalability += 4;
    commendations.push("Added horizontal API scaling behind a load balancer.");
  }
  if (requirements.readHeavy && graph.hasReplication) {
    scalability += 4;
    commendations.push("Read replicas handle heavy read traffic well.");
  }
  scalability = clamp(scalability);

  // --- Reliability (20) ---
  let reliability = 14;
  const spofBottlenecks = bottlenecks.filter((b) => b.message === "Single point of failure");
  if (spofBottlenecks.length > 0) {
    reliability -= 5 * spofBottlenecks.length;
    deductions.push({ label: "Single point of failure", points: -10 * spofBottlenecks.length });
  }
  if (metrics.availabilityPct >= requirements.minAvailability) {
    reliability += 4;
  } else {
    deductions.push({ label: "Availability below requirement", points: -6 });
    reliability -= 6;
  }
  if (graph.numQueue > 0 && graph.numWorker === 0) {
    reliability -= 6;
    deductions.push({ label: "Queue has no worker consuming it", points: -6 });
  }
  reliability = clamp(reliability);

  // --- Performance (20) ---
  let performance = 12;
  if (metrics.latencyMs <= requirements.maxLatencyMs) {
    performance += 6;
    commendations.push("Latency stays within the target budget.");
  } else {
    const overBy = metrics.latencyMs - requirements.maxLatencyMs;
    const penalty = Math.min(14, Math.ceil(overBy / 10) * 2);
    performance -= penalty;
    deductions.push({ label: "Latency exceeds requirement", points: -penalty });
  }
  if (metrics.databaseLoadPct >= 100) {
    performance -= 6;
    deductions.push({ label: "Database is overloaded", points: -6 });
  } else if (metrics.databaseLoadPct <= 70) {
    performance += 2;
  }
  if (graph.hasRedis && metrics.databaseLoadPct < 90) {
    commendations.push("Redis is reducing database reads and keeping latency low.");
  }
  performance = clamp(performance);

  // --- Cost (20) ---
  // Reward hitting requirements efficiently; penalize heavy over-provisioning relative to traffic.
  let cost = 16;
  const costPerKRps = requirements.trafficRps > 0 ? metrics.estimatedMonthlyCost / (requirements.trafficRps / 1000) : metrics.estimatedMonthlyCost;
  if (costPerKRps > 40) {
    const penalty = clamp(Math.round((costPerKRps - 40) / 8), 0, 12);
    cost -= penalty;
    if (penalty > 0) deductions.push({ label: "Over-provisioned relative to traffic", points: -penalty });
  } else {
    cost += 2;
  }
  cost = clamp(cost);

  // --- Simplicity / appropriateness (20) ---
  let simplicity = 18;

  const unnecessaryRedis = graph.hasRedis && requirements.trafficRps < 3000 && !requirements.readHeavy;
  if (unnecessaryRedis) {
    simplicity -= 5;
    deductions.push({ label: "Unnecessary Redis", points: -5 });
  }

  const unnecessaryQueue = (graph.numQueue > 0 || graph.numWorker > 0) && !requirements.hasExpensiveWrites;
  if (unnecessaryQueue) {
    simplicity -= 8;
    deductions.push({ label: "Unnecessary Queue", points: -8 });
  }

  const unnecessaryCdn = graph.hasCdn && !requirements.staticAssets;
  if (unnecessaryCdn) {
    simplicity -= 4;
    deductions.push({ label: "Unnecessary CDN", points: -4 });
  }

  const unnecessaryReplica =
    graph.hasReplication && !requirements.readHeavy && requirements.trafficRps < 4000;
  if (unnecessaryReplica) {
    simplicity -= 4;
    deductions.push({ label: "Unnecessary read replica", points: -4 });
  }

  if (metrics.complexity === "High" && requirements.trafficRps < 8000) {
    simplicity -= 3;
    deductions.push({ label: "Architecture is more complex than required", points: -3 });
  }

  if (!unnecessaryRedis && !unnecessaryQueue && !unnecessaryCdn && !unnecessaryReplica) {
    commendations.push("No unnecessary infrastructure — every component earns its place.");
  }

  simplicity = clamp(simplicity);

  const breakdown: ScoreBreakdown = { scalability, reliability, performance, cost, simplicity };
  const score = Math.round(scalability + reliability + performance + cost + simplicity);

  const meetsRequirements =
    meetsThroughput &&
    metrics.latencyMs <= requirements.maxLatencyMs &&
    metrics.availabilityPct >= requirements.minAvailability &&
    !bottlenecks.some((b) => b.severity === "critical");

  return { score, breakdown, deductions, commendations, meetsRequirements };
}
