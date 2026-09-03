"use client";

import type { RoadmapZone, RoadmapNode } from "@/data/roadmap";
import type { NodeState } from "./HexNode";
import { HexNode } from "./HexNode";

interface ZoneBandProps {
  zone: RoadmapZone;
  /** Map from node.id → NodeState */
  nodeStates: Record<string, NodeState>;
  /** Map from lessonId → bestScore */
  scores: Map<string, number>;
  reversed: boolean; // connector direction (not node order)
  animDelay: number; // stagger the zone-reveal animation
  onCompletedClick: (
    rect: DOMRect,
    data: { title: string; score: number; lessonId: string }
  ) => void;
}

/** XP gem shown along the connecting path */
function XpGem({ color, delay }: { color: string; delay: string }) {
  return (
    <div
      className="gem-bob pointer-events-none flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-black shrink-0"
      style={{
        animationDelay: delay,
        color,
        borderColor: `${color}30`,
        background: `${color}10`,
      }}
    >
      ◆
    </div>
  );
}

/** Dashed SVG line connecting two nodes */
function PathSegment({
  isCompleted,
  color,
}: {
  isCompleted: boolean;
  color: string;
}) {
  return (
    <div className="relative flex items-center justify-center flex-1 min-w-[40px] max-w-[80px] h-10">
      <svg
        width="100%"
        height="20"
        viewBox="0 0 80 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background (always dashed dim) */}
        <line
          x1="0"
          y1="10"
          x2="80"
          y2="10"
          stroke="#212327"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        {/* Foreground: filled if completed, marching if active edge */}
        {isCompleted && (
          <line
            x1="0"
            y1="10"
            x2="80"
            y2="10"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="path-march"
            style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
          />
        )}
      </svg>
    </div>
  );
}

export function ZoneBand({
  zone,
  nodeStates,
  scores,
  reversed,
  animDelay,
  onCompletedClick,
}: ZoneBandProps) {
  const nodes: RoadmapNode[] = zone.nodes;
  const isBossZone = zone.id === 7;

  return (
    <div
      className="zone-reveal relative w-full rounded-2xl border overflow-hidden"
      style={{
        animationDelay: `${animDelay}ms`,
        background: `${zone.color}05`,
        borderColor: `${zone.color}18`,
        boxShadow: `inset 0 0 40px ${zone.color}04`,
      }}
    >
      {/* Colored left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, ${zone.color}, ${zone.color}40)` }}
      />

      <div className="flex items-center gap-4 px-6 py-5 pl-8">
        {/* Zone label */}
        <div className="shrink-0 w-[140px] min-w-[140px]">
          <div
            className="text-[9px] font-black tracking-[0.2em] uppercase mb-0.5"
            style={{ color: `${zone.color}99` }}
          >
            Zone {zone.id}
          </div>
          <div
            className="text-[13px] font-bold leading-tight"
            style={{ color: zone.color }}
          >
            {zone.label}
          </div>
        </div>

        {/* Nodes row with paths */}
        <div
          className={`flex-1 flex items-center justify-around gap-0 ${
            isBossZone ? "justify-center" : ""
          }`}
        >
          {nodes.map((node, idx) => {
            const state = nodeStates[node.id] ?? "locked";
            const score = node.lessonId ? scores.get(node.lessonId) : undefined;
            const isNodeCompleted = state === "completed";

            // Determine if the path BEFORE this node (between idx-1 and idx) is completed
            // Path is completed if the node to the left of it (in the original non-reversed order)
            // is completed
            const prevNode = nodes[idx - 1];
            const pathBeforeCompleted = prevNode
              ? nodeStates[prevNode.id] === "completed"
              : false;

            return (
              <div key={node.id} className="flex items-center">
                {/* Path segment before this node (except first) */}
                {idx > 0 && !isBossZone && (
                  <>
                    <PathSegment
                      isCompleted={pathBeforeCompleted && isNodeCompleted}
                      color={zone.color}
                    />
                    {/* XP gem between nodes */}
                    <XpGem color={zone.color} delay={`${idx * 0.4}s`} />
                    <PathSegment
                      isCompleted={pathBeforeCompleted && isNodeCompleted}
                      color={zone.color}
                    />
                  </>
                )}

                <HexNode
                  id={node.id}
                  index={node.index}
                  title={node.title}
                  subtitle={node.subtitle}
                  xpReward={node.xpReward}
                  state={state}
                  zoneColor={zone.color}
                  lessonId={node.lessonId}
                  bestScore={score}
                  isBoss={node.isBoss}
                  onCompletedClick={onCompletedClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
