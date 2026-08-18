"use client";

import type { DragEvent } from "react";
import { COMPONENTS } from "@/data/components";
import { NODE_ICON, NODE_COLOR } from "./nodes";
import type { ComponentType } from "@/types/architecture";
import { clsx } from "clsx";

const CATEGORY_ORDER = ["Infrastructure", "Storage", "Messaging"] as const;

export function ComponentPalette({
  available,
  onAdd,
}: {
  available: ComponentType[];
  onAdd: (type: ComponentType) => void;
}) {
  const specs = available.map((t) => COMPONENTS[t]);

  const onDragStart = (event: DragEvent<HTMLDivElement>, type: ComponentType) => {
    event.dataTransfer.setData("application/sdp-component", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface/40 p-3">
      <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-2 mono">Components</div>
      {CATEGORY_ORDER.map((category) => {
        const items = specs.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="mb-4">
            <div className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">{category}</div>
            <div className="flex flex-col gap-1.5">
              {items.map((spec) => {
                const Icon = NODE_ICON[spec.type];
                const color = NODE_COLOR[spec.type];
                return (
                  <div
                    key={spec.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, spec.type)}
                    onClick={() => onAdd(spec.type)}
                    className={clsx(
                      "flex cursor-grab items-center gap-2.5 rounded-lg border border-border px-2.5 py-2 text-[13px] text-foreground/90",
                      "bg-surface hover:border-border-strong hover:bg-surface-2 active:cursor-grabbing transition-colors",
                    )}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${color}1a`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="truncate">{spec.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="mt-auto px-1 pt-3 text-[11px] leading-relaxed text-muted-2">
        Drag a component onto the canvas, or click it to drop it in.
      </p>
    </div>
  );
}
