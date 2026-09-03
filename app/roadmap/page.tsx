"use client";

import { useState, useCallback } from "react";
import { ROADMAP_ZONES, ALL_ROADMAP_NODES, LESSON_LINKED_NODES } from "@/data/roadmap";
import { useProgressStore } from "@/store/progress-store";
import type { NodeState } from "@/components/roadmap/HexNode";
import { ZoneBand } from "@/components/roadmap/ZoneBand";
import { PlayerHUD } from "@/components/roadmap/PlayerHUD";
import { CompletedTooltip } from "@/components/roadmap/CompletedTooltip";
import { Map as MapIcon } from "lucide-react";

interface TooltipState {
  rect: DOMRect;
  data: { title: string; score: number; lessonId: string };
}

/** Between-zone connector: a small curved SVG path from one zone to the next */
function ZoneConnector({ fromColor, toColor, reversed }: { fromColor: string; toColor: string; reversed: boolean }) {
  // Connector curves from the exit side of the previous zone to entry side of the next
  // reversed=true means previous zone exited on the left, next enters on the right
  const x1 = reversed ? "15%" : "85%";
  const x2 = reversed ? "85%" : "15%";

  return (
    <div className="relative h-12 w-full my-1 overflow-visible" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 400 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`connector-grad-${fromColor.slice(1)}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Dim background path */}
        <path
          d={`M ${reversed ? 60 : 340},4 C ${reversed ? 60 : 340},44 ${reversed ? 340 : 60},4 ${reversed ? 340 : 60},44`}
          fill="none"
          stroke="#1a1d21"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        {/* Gradient foreground */}
        <path
          d={`M ${reversed ? 60 : 340},4 C ${reversed ? 60 : 340},44 ${reversed ? 340 : 60},4 ${reversed ? 340 : 60},44`}
          fill="none"
          stroke={`url(#connector-grad-${fromColor.slice(1)})`}
          strokeWidth="2"
          strokeDasharray="6 5"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

export default function RoadmapPage() {
  const xp = useProgressStore((s) => s.xp);
  const lessonCompletions = useProgressStore((s) => s.lessonCompletions);
  const displayXp = xp > 0 ? xp : 1240; // default showcase XP

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  /* Build completions map: lessonId → bestScore */
  const completionMap = new globalThis.Map<string, number>();
  if (lessonCompletions.length > 0) {
    lessonCompletions.forEach((c) => completionMap.set(c.lessonId, c.bestScore));
  } else {
    // Demo: show lesson 1 as completed
    completionMap.set("client-server-db", 82);
  }

  /* Derive node states */
  function getNodeState(nodeId: string): NodeState {
    const node = ALL_ROADMAP_NODES.find((n) => n.id === nodeId);
    if (!node) return "locked";

    if (node.isBoss) {
      const allDone = LESSON_LINKED_NODES.every((n) => completionMap.has(n.lessonId!));
      return allDone ? "boss-active" : "boss-locked";
    }

    // No lesson tied yet → coming soon
    if (!node.lessonId) return "coming-soon";

    // Completed?
    if (completionMap.has(node.lessonId)) return "completed";

    // Active = previous lesson-linked node is completed (or this is the very first)
    const lessonNodes = ALL_ROADMAP_NODES.filter((n) => n.lessonId && !n.isBoss);
    const thisIdx = lessonNodes.findIndex((n) => n.id === nodeId);
    if (thisIdx === 0) return "active";
    const prev = lessonNodes[thisIdx - 1];
    if (prev && completionMap.has(prev.lessonId!)) return "active";

    return "locked";
  }

  const nodeStates: Record<string, NodeState> = {};
  ALL_ROADMAP_NODES.forEach((n) => {
    nodeStates[n.id] = getNodeState(n.id);
  });

  /* Tooltip handlers */
  const handleCompletedClick = useCallback(
    (rect: DOMRect, data: { title: string; score: number; lessonId: string }) => {
      setTooltip({ rect, data });
    },
    []
  );

  const handleTooltipClose = useCallback(() => setTooltip(null), []);

  return (
    <>
      {/* Tooltip portal */}
      <CompletedTooltip
        anchorRect={tooltip?.rect ?? null}
        data={tooltip?.data ?? null}
        onClose={handleTooltipClose}
      />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:py-12">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{
              background: "rgba(52,211,153,0.1)",
              borderColor: "rgba(52,211,153,0.25)",
            }}
          >
            <MapIcon size={20} style={{ color: "#34d399" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              System Design Roadmap
            </h1>
            <p className="text-sm text-muted">
              Your journey to mastering distributed systems — level by level.
            </p>
          </div>
        </div>

        {/* Player HUD */}
        <PlayerHUD xp={displayXp} />

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#34d399]" />
            Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#34d399]" />
            Active — click to start
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-border" />
            Locked
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#5c5f65]" />
            Coming Soon
          </div>
        </div>

        {/* Map — mobile: scale down, desktop: full size */}
        <div
          className="map-scaler-wrapper"
          style={{
            /* Mobile scaling applied via CSS below; desktop = no scaling */
          }}
        >
          <div className="map-scaler flex flex-col gap-0">
            {ROADMAP_ZONES.map((zone, zoneIdx) => {
              const reversed = zoneIdx % 2 === 1;
              const nextZone = ROADMAP_ZONES[zoneIdx + 1];

              return (
                <div key={zone.id}>
                  <ZoneBand
                    zone={zone}
                    nodeStates={nodeStates}
                    scores={completionMap}
                    reversed={reversed}
                    animDelay={zoneIdx * 80}
                    onCompletedClick={handleCompletedClick}
                  />

                  {/* Connector between zones */}
                  {nextZone && (
                    <ZoneConnector
                      fromColor={zone.color}
                      toColor={nextZone.color}
                      reversed={reversed}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .map-scaler {
            transform: scale(0.72);
            transform-origin: top center;
          }
          .map-scaler-wrapper {
            /* Compensate for the whitespace created by scaling down */
            overflow: hidden;
          }
        }
        @media (max-width: 480px) {
          .map-scaler {
            transform: scale(0.52);
            transform-origin: top center;
          }
        }
      `}</style>
    </>
  );
}
