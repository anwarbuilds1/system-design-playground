import type { Architecture } from "@/types/architecture";

export interface ValidationIssue {
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Structural checks that run before the simulation engine touches the graph.
 * These catch malformed architectures so the engine never has to guard
 * against them internally.
 */
export function validateArchitecture(architecture: Architecture): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = architecture;

  if (nodes.length === 0) {
    return { valid: false, issues: [{ message: "Your canvas is empty. Drag components onto it to get started." }] };
  }

  const clientNodes = nodes.filter((n) => n.type === "client");
  if (clientNodes.length === 0) {
    issues.push({ message: "Every architecture needs a Client to originate requests." });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      issues.push({ message: "An edge references a component that no longer exists." });
    }
    if (edge.source === edge.target) {
      issues.push({ message: "A component cannot connect to itself.", nodeId: edge.source });
    }
  }

  // Disconnected nodes (islands) - every non-client node should have at least one connection
  const connected = new Set<string>();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });
  for (const node of nodes) {
    if (!connected.has(node.id) && nodes.length > 1) {
      issues.push({ message: `${node.label} is not connected to anything.`, nodeId: node.id });
    }
  }

  // API servers with no downstream storage/queue
  const outgoing = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source)!.push(e.target);
  });
  for (const node of nodes.filter((n) => n.type === "api_server")) {
    const targets = outgoing.get(node.id) ?? [];
    const hasDownstream = targets.some((id) => {
      const t = nodes.find((n) => n.id === id);
      return t && ["postgres", "mongodb", "redis", "queue"].includes(t.type);
    });
    if (!hasDownstream) {
      issues.push({
        message: `${node.label} is not connected to any database or downstream service.`,
        nodeId: node.id,
      });
    }
  }

  // Simple cycle detection among non-messaging components (a request path shouldn't loop back on itself)
  const adjacency = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    adjacency.get(e.source)!.push(e.target);
  });
  const visiting = new Set<string>();
  const visited = new Set<string>();
  let hasCycle = false;
  function dfs(id: string) {
    if (hasCycle) return;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) {
      if (visiting.has(next)) {
        hasCycle = true;
        return;
      }
      if (!visited.has(next)) dfs(next);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const node of nodes) {
    if (!visited.has(node.id)) dfs(node.id);
  }
  if (hasCycle) {
    issues.push({ message: "Your architecture has a circular request path. Requests should flow in one direction." });
  }

  const blocking = issues.length > 0 && (clientNodes.length === 0 || hasCycle);
  return { valid: !blocking, issues };
}
