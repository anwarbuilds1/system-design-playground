import type { Architecture, Bottleneck, Requirements, SimulationMetrics, Warning } from "@/types/architecture";
import type { DerivedGraph } from "./metrics";

export interface RuleOutput {
  bottlenecks: Bottleneck[];
  warnings: Warning[];
}

function findFirst(architecture: Architecture, type: string) {
  return architecture.nodes.find((n) => n.type === type);
}

export function evaluateRules(
  architecture: Architecture,
  requirements: Requirements,
  graph: DerivedGraph,
  metrics: SimulationMetrics,
): RuleOutput {
  const bottlenecks: Bottleneck[] = [];
  const warnings: Warning[] = [];

  // Rule: multiple API servers without a load balancer
  if (graph.numApiServers > 1 && !graph.hasLoadBalancer) {
    warnings.push({
      message: "Multiple API servers exist but traffic is not distributed. Add a Load Balancer.",
      severity: "warning",
    });
  }

  // Rule: API layer missing entirely
  if (graph.numApiServers === 0) {
    warnings.push({ message: "No API server found. Requests have nowhere to be processed.", severity: "critical" });
  }

  // Rule: no database connected
  if (graph.numDbNodes === 0) {
    warnings.push({ message: "No database found. Data has nowhere to be stored.", severity: "critical" });
  } else if (!graph.apiConnectedToDb) {
    warnings.push({
      message: "Your API server is not connected to any database or downstream service.",
      severity: "critical",
    });
  }

  // Rule: database bottleneck
  if (metrics.databaseLoadPct >= 90) {
    const db = findFirst(architecture, "postgres") ?? findFirst(architecture, "mongodb");
    bottlenecks.push({
      nodeId: db?.id ?? "database",
      message: "Database overloaded",
      severity: metrics.databaseLoadPct >= 100 ? "critical" : "warning",
      explanation: `${db?.label ?? "The database"} is receiving more requests than its estimated capacity. Consider adding caching or read replicas.`,
    });
  }

  // Rule: API tier bottleneck
  const apiLoadPct = graph.numApiServers === 0 ? 100 : (requirements.trafficRps / (graph.numApiServers * 1000)) * 100;
  if (graph.hasLoadBalancer && apiLoadPct >= 90) {
    const api = findFirst(architecture, "api_server");
    bottlenecks.push({
      nodeId: api?.id ?? "api",
      message: "API tier overloaded",
      severity: apiLoadPct >= 100 ? "critical" : "warning",
      explanation: "Your API servers are close to or over their combined estimated capacity. Add more servers behind the load balancer.",
    });
  }

  // Rule: Redis present and helping
  if (graph.hasRedis) {
    warnings.push({ message: "Redis is reducing database load and latency.", severity: "info" });
  }

  // Rule: Read replicas
  if (graph.hasReplication) {
    warnings.push({ message: "Read replicas are sharing read traffic with the primary database.", severity: "info" });
  }

  // Rule: Queue / async processing
  if (graph.numQueue > 0 && graph.numWorker === 0) {
    warnings.push({ message: "A queue exists but no Worker is consuming it. Jobs will never be processed.", severity: "critical" });
  }
  if (graph.hasQueueWithWorker) {
    warnings.push({
      message: "Expensive work is processed asynchronously, lowering request latency. Processing now completes with a short delay instead of immediately.",
      severity: "info",
    });
  }

  // Rule: CDN
  if (graph.hasCdn) {
    warnings.push({ message: "The CDN is absorbing static traffic before it reaches your origin.", severity: "info" });
  }

  // Rule: single points of failure
  if (graph.numApiServers === 1) {
    const api = findFirst(architecture, "api_server");
    bottlenecks.push({
      nodeId: api?.id ?? "api",
      message: "Single point of failure",
      severity: "warning",
      explanation: "There is only one API server. If it goes down, the whole system becomes unavailable.",
    });
  }
  if (graph.numDbNodes === 1) {
    const db = findFirst(architecture, "postgres") ?? findFirst(architecture, "mongodb");
    if (db) {
      bottlenecks.push({
        nodeId: db.id,
        message: "Single point of failure",
        severity: "warning",
        explanation: `${db.label} has no replica. If it goes down, all data access stops.`,
      });
    }
  }
  if (graph.numLoadBalancers === 1 && graph.numApiServers > 1) {
    const lb = findFirst(architecture, "load_balancer");
    warnings.push({
      message: `${lb?.label ?? "The load balancer"} is itself a single point of failure, though this is a common and acceptable trade-off at MVP scale.`,
      severity: "info",
    });
  }

  // Rule: latency requirement
  if (metrics.latencyMs > requirements.maxLatencyMs) {
    warnings.push({
      message: `Latency (${metrics.latencyMs}ms) exceeds the requirement of ${requirements.maxLatencyMs}ms.`,
      severity: "critical",
    });
  }

  // Rule: availability requirement
  if (metrics.availabilityPct < requirements.minAvailability) {
    warnings.push({
      message: `Availability (${metrics.availabilityPct}%) is below the required ${requirements.minAvailability}%.`,
      severity: "warning",
    });
  }

  return { bottlenecks, warnings };
}
