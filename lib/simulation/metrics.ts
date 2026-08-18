import { COMPONENTS } from "@/data/components";
import type { Architecture, Requirements, SimulationMetrics } from "@/types/architecture";

export interface DerivedGraph {
  numApiServers: number;
  numLoadBalancers: number;
  numDbNodes: number;
  numCdn: number;
  numRedis: number;
  numQueue: number;
  numWorker: number;
  hasLoadBalancer: boolean;
  hasCdn: boolean;
  hasRedis: boolean;
  hasReplication: boolean;
  hasQueueWithWorker: boolean;
  apiConnectedToDb: boolean;
  totalCost: number;
}

export function deriveGraph(architecture: Architecture): DerivedGraph {
  const { nodes, edges } = architecture;
  const byType = (t: string) => nodes.filter((n) => n.type === t);

  const numApiServers = byType("api_server").length;
  const numLoadBalancers = byType("load_balancer").length;
  const numCdn = byType("cdn").length;
  const numRedis = byType("redis").length;
  const numQueue = byType("queue").length;
  const numWorker = byType("worker").length;
  const dbNodes = [...byType("postgres"), ...byType("mongodb")];
  const numDbNodes = dbNodes.length;

  const outgoing = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source)!.push(e.target);
  });

  const apiIds = new Set(byType("api_server").map((n) => n.id));
  const dbIds = new Set(dbNodes.map((n) => n.id));
  const redisIds = new Set(byType("redis").map((n) => n.id));
  const queueIds = new Set(byType("queue").map((n) => n.id));
  const workerIds = new Set(byType("worker").map((n) => n.id));

  let apiConnectedToDb = false;
  for (const [source, targets] of outgoing.entries()) {
    if (!apiIds.has(source)) continue;
    for (const t of targets) {
      if (dbIds.has(t) || redisIds.has(t) || queueIds.has(t)) apiConnectedToDb = true;
    }
  }
  // also count redis -> db as satisfying the path
  for (const [source, targets] of outgoing.entries()) {
    if (!redisIds.has(source)) continue;
    for (const t of targets) if (dbIds.has(t)) apiConnectedToDb = apiConnectedToDb || true;
  }

  const hasQueueWithWorker =
    numQueue > 0 &&
    numWorker > 0 &&
    edges.some((e) => queueIds.has(e.source) && workerIds.has(e.target));

  const totalCost =
    numApiServers * COMPONENTS.api_server.baseCostPerMonth +
    numLoadBalancers * COMPONENTS.load_balancer.baseCostPerMonth +
    numCdn * COMPONENTS.cdn.baseCostPerMonth +
    numRedis * COMPONENTS.redis.baseCostPerMonth +
    numQueue * COMPONENTS.queue.baseCostPerMonth +
    numWorker * COMPONENTS.worker.baseCostPerMonth +
    dbNodes.reduce((sum, n) => sum + COMPONENTS[n.type].baseCostPerMonth, 0);

  return {
    numApiServers,
    numLoadBalancers,
    numDbNodes,
    numCdn,
    numRedis,
    numQueue,
    numWorker,
    hasLoadBalancer: numLoadBalancers > 0,
    hasCdn: numCdn > 0,
    hasRedis: numRedis > 0,
    hasReplication: numDbNodes > 1,
    hasQueueWithWorker,
    apiConnectedToDb,
    totalCost,
  };
}

const CDN_OFFLOAD_RATIO = 0.35;
const CACHE_HIT_RATIO = 0.7;
const QUEUE_LATENCY_RELIEF_MS = 25;
const CONGESTION_LATENCY_MULTIPLIER = 4;

export function calculateMetrics(architecture: Architecture, requirements: Requirements, graph: DerivedGraph): SimulationMetrics {
  const traffic = requirements.trafficRps;

  // 1. Traffic reaching origin (API layer) after CDN offload for static assets
  const trafficToApi = graph.hasCdn ? traffic * (1 - CDN_OFFLOAD_RATIO) : traffic;

  // 2. Effective API capacity: without a load balancer, extra servers don't help
  const apiUnitCapacity = COMPONENTS.api_server.capacityRps;
  const effectiveApiCapacity =
    graph.numApiServers === 0
      ? 0
      : graph.hasLoadBalancer
        ? graph.numApiServers * apiUnitCapacity
        : apiUnitCapacity;

  // 3. Traffic that survives the cache in front of the database
  const trafficToDb = graph.hasRedis ? trafficToApi * (1 - CACHE_HIT_RATIO) : trafficToApi;

  // 4. Database capacity (replicas add read capacity)
  const dbUnitCapacity = 2000;
  const dbCapacity = graph.numDbNodes === 0 ? 0 : graph.numDbNodes * dbUnitCapacity;

  const databaseLoadPct = dbCapacity === 0 ? 100 : Math.min(200, (trafficToDb / dbCapacity) * 100);

  // 5. Latency: sum of hop latencies + congestion penalty for whichever tier is over capacity
  let latencyMs = COMPONENTS.client.baseLatencyMs;
  if (graph.hasCdn) latencyMs += COMPONENTS.cdn.baseLatencyMs;
  if (graph.hasLoadBalancer) latencyMs += COMPONENTS.load_balancer.baseLatencyMs;
  latencyMs += graph.numApiServers > 0 ? COMPONENTS.api_server.baseLatencyMs : 40; // penalty: no API tier
  if (graph.hasRedis) latencyMs += COMPONENTS.redis.baseLatencyMs;
  latencyMs += graph.numDbNodes > 0 ? COMPONENTS.postgres.baseLatencyMs : 60; // penalty: no DB

  const apiLoadPct = effectiveApiCapacity === 0 ? 200 : (trafficToApi / effectiveApiCapacity) * 100;
  if (apiLoadPct > 80) latencyMs += (apiLoadPct - 80) * CONGESTION_LATENCY_MULTIPLIER * 0.4;
  if (databaseLoadPct > 80) latencyMs += (databaseLoadPct - 80) * CONGESTION_LATENCY_MULTIPLIER;

  if (graph.hasQueueWithWorker) latencyMs = Math.max(5, latencyMs - QUEUE_LATENCY_RELIEF_MS);

  // 6. Throughput: bounded by the tightest tier
  const throughputRps = Math.max(
    0,
    Math.min(traffic, effectiveApiCapacity || 0, dbCapacity > 0 ? dbCapacity / (1 - (graph.hasRedis ? CACHE_HIT_RATIO : 0)) : traffic * 0.05),
  );

  // 7. Availability: start near five nines, dock points for single points of failure
  let availabilityPct = 99.99;
  const spofCount =
    (graph.numApiServers === 1 ? 1 : 0) +
    (graph.numDbNodes === 1 ? 1 : 0) +
    (graph.hasLoadBalancer && graph.numLoadBalancers === 1 && graph.numApiServers > 1 ? 0.5 : 0);
  availabilityPct -= spofCount * 1.4;
  if (databaseLoadPct > 100) availabilityPct -= 3;
  if (apiLoadPct > 100) availabilityPct -= 3;
  availabilityPct = Math.max(90, availabilityPct);

  // 8. Complexity
  const nodeCount = architecture.nodes.filter((n) => n.type !== "client").length;
  const complexity: SimulationMetrics["complexity"] = nodeCount <= 3 ? "Low" : nodeCount <= 6 ? "Medium" : "High";

  return {
    latencyMs: Math.round(latencyMs),
    throughputRps: Math.round(throughputRps),
    availabilityPct: Math.round(availabilityPct * 100) / 100,
    databaseLoadPct: Math.round(Math.min(100, databaseLoadPct)),
    estimatedMonthlyCost: graph.totalCost,
    complexity,
  };
}
