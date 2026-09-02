"use client";

import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type ReactFlowInstance,
} from "reactflow";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ComponentPalette } from "./ComponentPalette";
import { PropertiesPanel } from "./PropertiesPanel";
import { nodeTypes } from "./nodes";
import type { UseArchitectureReturn } from "@/lib/architecture/useArchitecture";
import type { ComponentType } from "@/types/architecture";

export function ArchitectureCanvas({
  builder,
  availableComponents,
}: {
  builder: UseArchitectureReturn;
  availableComponents: ComponentType[];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/sdp-component") as ComponentType;
      if (!type || !wrapperRef.current || !instanceRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = instanceRef.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      builder.addComponent(type, position);
    },
    [builder],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-border">
      {/* ── Collapsible Component Palette ───────────────────────── */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: paletteOpen ? "14rem" : "0px" }}
      >
        <div className="h-full w-56">
          <ComponentPalette
            available={availableComponents}
            onAdd={(type) => builder.addComponent(type)}
          />
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────── */}
      <div ref={wrapperRef} className="relative flex-1 bg-background min-w-0">
        <ReactFlow
          nodes={builder.nodes}
          edges={builder.edges}
          onNodesChange={builder.onNodesChange}
          onEdgesChange={builder.onEdgesChange}
          onConnect={builder.onConnect}
          onInit={(instance) => (instanceRef.current = instance)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(_, node) => builder.setSelectedNodeId(node.id)}
          onPaneClick={() => builder.setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ style: { strokeWidth: 1.6 } }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--border)" />
          <Controls showInteractive={false} />
        </ReactFlow>

        {/* Toggle button — sits on the left edge of the canvas */}
        <button
          onClick={() => setPaletteOpen((v) => !v)}
          title={paletteOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted transition-all duration-150 hover:border-accent/50 hover:text-accent hover:bg-surface-2"
        >
          {paletteOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
      </div>

      {/* ── Inspector / Properties Panel ────────────────────────── */}
      {builder.selectedNode && (
        <PropertiesPanel
          node={builder.selectedNode}
          onRename={builder.renameSelected}
          onDuplicate={builder.duplicateSelected}
          onDelete={builder.deleteSelected}
          onClose={() => builder.setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
