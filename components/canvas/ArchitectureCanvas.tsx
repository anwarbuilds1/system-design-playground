"use client";

import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type ReactFlowInstance,
} from "reactflow";
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
      <ComponentPalette available={availableComponents} onAdd={(type) => builder.addComponent(type)} />
      <div ref={wrapperRef} className="relative flex-1 bg-background">
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
          <MiniMap
            pannable
            zoomable
            nodeColor="#212327"
            maskColor="rgba(10,11,13,0.75)"
          />
        </ReactFlow>
      </div>
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
