"use client";

import React from "react";
import { Monitor, Split, Server, Zap, Database, Play, Pause } from "lucide-react";
import { clsx } from "clsx";

interface HeroPreviewProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isPeak: boolean;
  setIsPeak: (peak: boolean) => void;
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
}

export function HeroPreview({
  isPlaying,
  setIsPlaying,
  isPeak,
  setIsPeak,
  hoveredNode,
  setHoveredNode,
}: HeroPreviewProps) {
  const nodes = [
    {
      id: "client",
      label: "Client",
      icon: Monitor,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgAccent: "bg-emerald-500/10",
      glowColor: "shadow-emerald-500/20",
      desc: "Sends HTTPS requests, handles caching",
    },
    {
      id: "lb",
      label: "Load Balancer",
      icon: Split,
      color: "text-teal-400",
      borderColor: "border-teal-500/30",
      bgAccent: "bg-teal-500/10",
      glowColor: "shadow-teal-500/20",
      desc: "Distributes incoming traffic, round-robin",
    },
    {
      id: "api",
      label: "API Server",
      icon: Server,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgAccent: "bg-blue-500/10",
      glowColor: "shadow-blue-500/20",
      desc: "Node.js application, executes business logic",
    },
    {
      id: "redis",
      label: "Redis Cache",
      icon: Zap,
      color: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgAccent: "bg-rose-500/10",
      glowColor: "shadow-rose-500/20",
      desc: "In-memory cache, stores session tokens",
    },
    {
      id: "db",
      label: "PostgreSQL",
      icon: Database,
      color: "text-sky-400",
      borderColor: "border-sky-500/30",
      bgAccent: "bg-sky-500/10",
      glowColor: "shadow-sky-500/20",
      desc: "Relational database, persistent storage",
    },
  ];

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface/40 backdrop-blur-md overflow-hidden shadow-[0_24px_80px_-15px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(52,211,153,0.05)]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-2/40">
        <div className="flex items-center gap-2.5">
          {/* Windows Dots */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/40" />
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <span className="text-[10px] mono text-muted tracking-wider uppercase flex items-center gap-1.5">
            <span className={clsx("w-2 h-2 rounded-full", isPlaying ? "bg-accent animate-pulse" : "bg-muted-2")} />
            {isPlaying ? "Live Simulation running" : "Simulation Paused"}
          </span>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              onClick={() => setIsPeak(!isPeak)}
              className={clsx(
                "px-2.5 py-1 rounded-md text-[10px] font-semibold mono transition-all duration-200 border cursor-pointer",
                isPeak
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                  : "bg-surface-2 border-border text-muted hover:text-foreground hover:border-border-strong"
              )}
            >
              {isPeak ? "⚠️ Peak: ON" : "⚡ Scale to Peak"}
            </button>
          )}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={clsx(
              "p-1.5 rounded-md border transition-all duration-150 flex items-center justify-center cursor-pointer",
              isPlaying
                ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                : "bg-surface-2 border-border text-foreground hover:border-border-strong"
            )}
            title={isPlaying ? "Pause Simulation" : "Start Simulation"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>

      {/* Visualizer Body */}
      <div className="relative p-6 md:p-8 flex flex-col items-center justify-center min-h-[380px]">
        {/* Subtle Grid Background */}
        <div className="grid-fade absolute inset-0 opacity-40 pointer-events-none" />

        {/* Canvas Wrapper */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isHovered = hoveredNode === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={clsx(
                    "group w-full max-w-[240px] rounded-xl border bg-surface/80 p-3 transition-all duration-300 relative cursor-pointer select-none",
                    isHovered
                      ? `${node.borderColor} shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)] scale-[1.03]`
                      : "border-border-strong shadow-md",
                    "hover:shadow-lg"
                  )}
                >
                  {/* Glowing Accent Border */}
                  <div
                    className={clsx(
                      "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none border border-current",
                      node.color,
                      isHovered && "opacity-20"
                    )}
                  />

                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={clsx("h-8.5 w-8.5 rounded-lg flex items-center justify-center transition-all duration-300", node.bgAccent, node.color)}>
                      <Icon size={16} strokeWidth={1.8} className={clsx(isHovered && "scale-110")} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-foreground tracking-tight">{node.label}</div>
                      <div className="text-[10px] text-muted truncate mt-0.5 leading-snug">
                        {isHovered ? node.desc : node.id === "client" ? "Active user sessions" : node.id === "lb" ? "HAProxy, Round-robin" : node.id === "api" ? "NodeJS cluster" : node.id === "redis" ? "Cache hit rate: 94%" : "PostgreSQL Main"}
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center justify-center">
                      <span className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        isPlaying ? (isPeak && node.id === "api" ? "bg-amber-400 animate-ping" : "bg-accent animate-pulse") : "bg-muted-2"
                      )} />
                    </div>
                  </div>
                </div>

                {/* Connector Line & Request Particle */}
                {index < nodes.length - 1 && (
                  <div className="relative h-10 w-[2px] bg-border-strong">
                    {/* Connection Glow */}
                    <div
                      className={clsx(
                        "absolute inset-y-0 left-0 w-full bg-accent/30 transition-opacity duration-300",
                        (hoveredNode === node.id || hoveredNode === nodes[index + 1].id) ? "opacity-100" : "opacity-0"
                      )}
                    />

                    {/* Request Particles */}
                    {isPlaying && (
                      <>
                        <span
                          className={clsx(
                            "absolute left-1/2 w-1.5 h-1.5 rounded-full shadow-lg",
                            isPeak ? "bg-amber-400 shadow-amber-500/50 flow-fast" : "bg-accent shadow-accent/50 flow-slow"
                          )}
                          style={{
                            animationDelay: "0s"
                          }}
                        />
                        <span
                          className={clsx(
                            "absolute left-1/2 w-1.5 h-1.5 rounded-full shadow-lg",
                            isPeak ? "bg-amber-400 shadow-amber-500/50 flow-fast" : "bg-accent shadow-accent/50 flow-slow"
                          )}
                          style={{
                            animationDelay: isPeak ? "0.3s" : "0.6s"
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
