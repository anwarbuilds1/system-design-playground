export type ComponentType =
  | "client"
  | "load_balancer"
  | "api_server"
  | "cdn"
  | "redis"
  | "postgres"
  | "mongodb"
  | "queue"
  | "worker";

export interface ArchNode {
  id: string;
  type: ComponentType;
  label: string;
  position: { x: number; y: number };
}

export interface ArchEdge {
  id: string;
  source: string;
  target: string;
}

export interface Architecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export interface Requirements {
  id: string;
  name: string;
  trafficRps: number;
  users?: number;
  maxLatencyMs: number;
  minAvailability: number;
  readHeavy?: boolean;
  hasExpensiveWrites?: boolean;
  staticAssets?: boolean;
}

export type Severity = "info" | "warning" | "critical";

export interface Bottleneck {
  nodeId: string;
  message: string;
  severity: Severity;
  explanation: string;
}

export interface Warning {
  message: string;
  severity: Severity;
}

export interface ScoreBreakdown {
  scalability: number;
  reliability: number;
  performance: number;
  cost: number;
  simplicity: number;
}

export interface ScoreDeduction {
  label: string;
  points: number;
}

export interface SimulationMetrics {
  latencyMs: number;
  throughputRps: number;
  availabilityPct: number;
  databaseLoadPct: number;
  estimatedMonthlyCost: number;
  complexity: "Low" | "Medium" | "High";
}

export interface SimulationResult {
  metrics: SimulationMetrics;
  bottlenecks: Bottleneck[];
  warnings: Warning[];
  score: number;
  breakdown: ScoreBreakdown;
  deductions: ScoreDeduction[];
  commendations: string[];
  meetsRequirements: boolean;
}
