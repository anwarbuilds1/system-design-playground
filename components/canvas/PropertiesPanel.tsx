"use client";

import { COMPONENTS } from "@/data/components";
import { NODE_ICON, NODE_COLOR, type ArchNodeData } from "./nodes";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, X } from "lucide-react";
import type { Node } from "reactflow";

export function PropertiesPanel({
  node,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
}: {
  node: Node<ArchNodeData>;
  onRename: (label: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const spec = COMPONENTS[node.data.componentType];
  const Icon = NODE_ICON[spec.type];
  const color = NODE_COLOR[spec.type];

  return (
    <div className="flex h-full w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-surface/40 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>
            <Icon size={17} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-2 mono">{spec.category}</div>
            <div className="text-sm font-medium text-foreground">{spec.name}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-2 hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">Label</span>
        <input
          value={node.data.label}
          onChange={(e) => onRename(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      <p className="mb-4 text-[13px] leading-relaxed text-muted">{spec.description}</p>

      <Section title="Purpose">
        <p className="text-[13px] leading-relaxed text-muted">{spec.purpose}</p>
      </Section>

      <Section title="Advantages">
        <ul className="space-y-1">
          {spec.advantages.map((a) => (
            <li key={a} className="flex gap-1.5 text-[13px] text-foreground/90">
              <span className="text-accent">+</span>
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Trade-offs">
        <ul className="space-y-1">
          {spec.disadvantages.map((d) => (
            <li key={d} className="flex gap-1.5 text-[13px] text-foreground/90">
              <span className="text-danger">-</span>
              {d}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typical use">
        <ul className="space-y-1">
          {spec.useCases.map((u) => (
            <li key={u} className="text-[13px] text-muted">
              {u}
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="secondary" size="sm" onClick={onDuplicate} className="flex-1">
          <Copy size={13} /> Duplicate
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete} className="flex-1">
          <Trash2 size={13} /> Delete
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-2">{title}</div>
      {children}
    </div>
  );
}
