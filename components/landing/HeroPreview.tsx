"use client";

import ReactFlow, { Background, BackgroundVariant } from "reactflow";
import { nodeTypes } from "@/components/canvas/nodes";
import type { Node, Edge } from "reactflow";

const nodes: Node[] = [
  { id: "client", type: "archNode", position: { x: 0, y: 90 }, data: { label: "Client", componentType: "client" }, draggable: false },
  { id: "lb", type: "archNode", position: { x: 190, y: 90 }, data: { label: "Load Balancer", componentType: "load_balancer" }, draggable: false },
  { id: "api1", type: "archNode", position: { x: 420, y: 20 }, data: { label: "API Server", componentType: "api_server" }, draggable: false },
  { id: "api2", type: "archNode", position: { x: 420, y: 160 }, data: { label: "API Server", componentType: "api_server" }, draggable: false },
  { id: "db", type: "archNode", position: { x: 650, y: 90 }, data: { label: "PostgreSQL", componentType: "postgres" }, draggable: false },
];

const edges: Edge[] = [
  { id: "e1", source: "client", target: "lb" },
  { id: "e2", source: "lb", target: "api1" },
  { id: "e3", source: "lb", target: "api2" },
  { id: "e4", source: "api1", target: "db" },
  { id: "e5", source: "api2", target: "db" },
];

const METRICS = [
  { label: "Latency", value: "82ms" },
  { label: "Throughput", value: "4.2k RPS" },
  { label: "Availability", value: "99.2%" },
  { label: "Cost", value: "$$" },
];

export function HeroPreview() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-[0_0_60px_-15px_rgba(52,211,153,0.15)]">
      <div className="h-[260px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          panOnDrag={false}
          panOnScroll={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--border)" />
        </ReactFlow>
      </div>
      <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
        {METRICS.map((m) => (
          <div key={m.label} className="px-4 py-3 text-center sm:text-left">
            <div className="text-[10px] uppercase tracking-wider text-muted-2 mono">{m.label}</div>
            <div className="mono text-sm font-medium text-foreground">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
