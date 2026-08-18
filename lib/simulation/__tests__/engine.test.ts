import { describe, expect, it } from "vitest";
import { runSimulation } from "../engine";
import { validateArchitecture } from "../validators";
import type { Architecture, ArchEdge, ArchNode, Requirements } from "@/types/architecture";

function node(id: string, type: ArchNode["type"], label?: string): ArchNode {
  return { id, type, label: label ?? type, position: { x: 0, y: 0 } };
}
function edge(source: string, target: string): ArchEdge {
  return { id: `${source}-${target}`, source, target };
}
function reqs(overrides: Partial<Requirements> = {}): Requirements {
  return {
    id: "test",
    name: "Test challenge",
    trafficRps: 1000,
    maxLatencyMs: 200,
    minAvailability: 99,
    ...overrides,
  };
}

describe("validateArchitecture", () => {
  it("rejects an empty canvas", () => {
    const result = validateArchitecture({ nodes: [], edges: [] });
    expect(result.valid).toBe(false);
  });

  it("flags an API server with no downstream connection", () => {
    const architecture: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server")],
      edges: [edge("c1", "a1")],
    };
    const result = validateArchitecture(architecture);
    expect(result.issues.some((i) => i.message.includes("not connected to any database"))).toBe(true);
  });

  it("accepts a minimal valid chain", () => {
    const architecture: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    expect(validateArchitecture(architecture).valid).toBe(true);
  });
});

describe("runSimulation - single API server under high traffic", () => {
  it("detects an API bottleneck", () => {
    const architecture: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const { result } = runSimulation(architecture, reqs({ trafficRps: 5000 }));
    expect(result).not.toBeNull();
    expect(result!.metrics.throughputRps).toBeLessThan(5000);
    expect(result!.meetsRequirements).toBe(false);
  });
});

describe("runSimulation - multiple API servers with load balancer", () => {
  it("improves throughput over a single server", () => {
    const single: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const scaled: Architecture = {
      nodes: [
        node("c1", "client"),
        node("lb1", "load_balancer"),
        node("a1", "api_server"),
        node("a2", "api_server"),
        node("a3", "api_server"),
        node("d1", "postgres"),
        node("d2", "postgres"),
      ],
      edges: [
        edge("c1", "lb1"),
        edge("lb1", "a1"),
        edge("lb1", "a2"),
        edge("lb1", "a3"),
        edge("a1", "d1"),
        edge("a2", "d1"),
        edge("a3", "d1"),
        edge("d1", "d2"),
      ],
    };
    const traffic = { trafficRps: 2500 };
    const singleResult = runSimulation(single, reqs(traffic)).result!;
    const scaledResult = runSimulation(scaled, reqs(traffic)).result!;
    expect(scaledResult.metrics.throughputRps).toBeGreaterThan(singleResult.metrics.throughputRps);
  });

  it("warns when multiple API servers exist without a load balancer", () => {
    const architecture: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("a2", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1"), edge("a2", "d1")],
    };
    const { result } = runSimulation(architecture, reqs());
    expect(result!.warnings.some((w) => w.message.includes("traffic is not distributed"))).toBe(true);
  });
});

describe("runSimulation - Redis caching", () => {
  it("reduces database load compared to no cache", () => {
    const base: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const cached: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("r1", "redis"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "r1"), edge("r1", "d1")],
    };
    const traffic = { trafficRps: 1500 };
    const baseResult = runSimulation(base, reqs(traffic)).result!;
    const cachedResult = runSimulation(cached, reqs(traffic)).result!;
    expect(cachedResult.metrics.databaseLoadPct).toBeLessThan(baseResult.metrics.databaseLoadPct);
  });
});

describe("runSimulation - queue reduces synchronous latency", () => {
  it("lowers latency when expensive work is offloaded to a worker", () => {
    const sync: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const async: Architecture = {
      nodes: [
        node("c1", "client"),
        node("a1", "api_server"),
        node("q1", "queue"),
        node("w1", "worker"),
        node("d1", "postgres"),
      ],
      edges: [edge("c1", "a1"), edge("a1", "d1"), edge("a1", "q1"), edge("q1", "w1")],
    };
    const r = reqs({ trafficRps: 6000, hasExpensiveWrites: true });
    const syncResult = runSimulation(sync, r).result!;
    const asyncResult = runSimulation(async, r).result!;
    expect(asyncResult.metrics.latencyMs).toBeLessThanOrEqual(syncResult.metrics.latencyMs);
  });
});

describe("runSimulation - single database", () => {
  it("identifies a single point of failure", () => {
    const architecture: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const { result } = runSimulation(architecture, reqs());
    expect(result!.bottlenecks.some((b) => b.message === "Single point of failure" && b.nodeId === "d1")).toBe(true);
  });
});

describe("runSimulation - scoring penalizes unnecessary components", () => {
  it("scores a lean architecture higher than an over-engineered one for low traffic", () => {
    const lean: Architecture = {
      nodes: [node("c1", "client"), node("a1", "api_server"), node("d1", "postgres")],
      edges: [edge("c1", "a1"), edge("a1", "d1")],
    };
    const overEngineered: Architecture = {
      nodes: [
        node("c1", "client"),
        node("cdn1", "cdn"),
        node("lb1", "load_balancer"),
        node("a1", "api_server"),
        node("a2", "api_server"),
        node("r1", "redis"),
        node("q1", "queue"),
        node("w1", "worker"),
        node("d1", "postgres"),
        node("d2", "postgres"),
        node("m1", "mongodb"),
      ],
      edges: [
        edge("c1", "cdn1"),
        edge("cdn1", "lb1"),
        edge("lb1", "a1"),
        edge("lb1", "a2"),
        edge("a1", "r1"),
        edge("a2", "r1"),
        edge("r1", "d1"),
        edge("d1", "d2"),
        edge("a1", "q1"),
        edge("q1", "w1"),
        edge("a2", "m1"),
      ],
    };
    const r = reqs({ trafficRps: 400, maxLatencyMs: 300, minAvailability: 95 });
    const leanResult = runSimulation(lean, r).result!;
    const overResult = runSimulation(overEngineered, r).result!;
    expect(overResult.deductions.length).toBeGreaterThan(0);
    expect(leanResult.breakdown.simplicity).toBeGreaterThan(overResult.breakdown.simplicity);
  });
});
