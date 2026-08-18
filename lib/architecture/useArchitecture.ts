"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import { COMPONENTS } from "@/data/components";
import type { Architecture, ArchEdge, ArchNode, ComponentType } from "@/types/architecture";
import type { ArchNodeData } from "@/components/canvas/nodes";

let idCounter = 0;
function nextId(type: ComponentType) {
  idCounter += 1;
  return `${type}-${idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

function toRfNode(node: ArchNode): Node<ArchNodeData> {
  return {
    id: node.id,
    type: "archNode",
    position: node.position,
    data: { label: node.label, componentType: node.type },
  };
}
function toRfEdge(edge: ArchEdge): Edge {
  return { id: edge.id, source: edge.source, target: edge.target, animated: false };
}

export function useArchitecture(initial?: Architecture) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ArchNodeData>(
    (initial?.nodes ?? []).map(toRfNode),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState((initial?.edges ?? []).map(toRfEdge));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `e-${connection.source}-${connection.target}-${Date.now()}` }, eds));
    },
    [setEdges],
  );

  const addComponent = useCallback(
    (type: ComponentType, position?: { x: number; y: number }) => {
      const spec = COMPONENTS[type];
      const id = nextId(type);
      const count = nodes.filter((n) => n.data.componentType === type).length;
      const node: Node<ArchNodeData> = {
        id,
        type: "archNode",
        position: position ?? { x: 120 + ((nodes.length * 60) % 480), y: 80 + ((nodes.length * 70) % 360) },
        data: { label: count > 0 ? `${spec.name} ${count + 1}` : spec.name, componentType: type },
      };
      setNodes((nds) => [...nds, node]);
      setSelectedNodeId(id);
      return id;
    },
    [nodes, setNodes],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNodeId) return;
    const original = nodes.find((n) => n.id === selectedNodeId);
    if (!original) return;
    const id = nextId(original.data.componentType);
    const copy: Node<ArchNodeData> = {
      ...original,
      id,
      position: { x: original.position.x + 40, y: original.position.y + 40 },
      selected: false,
      data: { ...original.data, label: `${original.data.label} copy` },
    };
    setNodes((nds) => [...nds, copy]);
    setSelectedNodeId(id);
  }, [selectedNodeId, nodes, setNodes]);

  const renameSelected = useCallback(
    (label: string) => {
      if (!selectedNodeId) return;
      setNodes((nds) => nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n)));
    },
    [selectedNodeId, setNodes],
  );

  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const loadArchitecture = useCallback(
    (architecture: Architecture) => {
      setNodes(architecture.nodes.map(toRfNode));
      setEdges(architecture.edges.map(toRfEdge));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges],
  );

  const setBottlenecks = useCallback(
    (map: Record<string, "warning" | "critical">) => {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, bottleneck: map[n.id] ?? null } })));
    },
    [setNodes],
  );

  const architecture: Architecture = useMemo(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.componentType,
        label: n.data.label,
        position: n.position,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    }),
    [nodes, edges],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addComponent,
    deleteSelected,
    duplicateSelected,
    renameSelected,
    reset,
    loadArchitecture,
    setBottlenecks,
    architecture,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
  };
}

export type UseArchitectureReturn = ReturnType<typeof useArchitecture>;
