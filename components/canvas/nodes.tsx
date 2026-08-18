import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  Users,
  Split,
  Server,
  Globe,
  Zap,
  Database,
  Layers,
  Inbox,
  Cog,
} from "lucide-react";
import type { ComponentType } from "@/types/architecture";
import { clsx } from "clsx";

export const NODE_ICON: Record<ComponentType, typeof Users> = {
  client: Users,
  load_balancer: Split,
  api_server: Server,
  cdn: Globe,
  redis: Zap,
  postgres: Database,
  mongodb: Layers,
  queue: Inbox,
  worker: Cog,
};

export const NODE_COLOR: Record<ComponentType, string> = {
  client: "#8b8d91",
  load_balancer: "#60a5fa",
  api_server: "#34d399",
  cdn: "#c084fc",
  redis: "#f87171",
  postgres: "#38bdf8",
  mongodb: "#4ade80",
  queue: "#fbbf24",
  worker: "#fb923c",
};

export interface ArchNodeData {
  label: string;
  componentType: ComponentType;
  bottleneck?: "warning" | "critical" | null;
}

function ArchNodeImpl({ data, selected }: NodeProps<ArchNodeData>) {
  const Icon = NODE_ICON[data.componentType];
  const color = NODE_COLOR[data.componentType];
  const bottleneck = data.bottleneck;

  return (
    <div
      className={clsx(
        "group relative flex min-w-[132px] items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-2.5 shadow-lg transition-all",
        selected ? "border-accent shadow-[0_0_0_1px_rgba(52,211,153,0.4)]" : "border-border-strong",
        bottleneck === "critical" && "border-danger pulse-danger",
        bottleneck === "warning" && "border-warning",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-2" />
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-foreground">{data.label}</div>
        {bottleneck && (
          <div className={clsx("text-[10px] mono uppercase tracking-wide", bottleneck === "critical" ? "text-danger" : "text-warning")}>
            {bottleneck === "critical" ? "overloaded" : "at risk"}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-muted-2" />
    </div>
  );
}

export const ArchNode = memo(ArchNodeImpl);

export const nodeTypes = {
  archNode: ArchNode,
};
