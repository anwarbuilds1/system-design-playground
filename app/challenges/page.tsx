"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Link as LinkIcon,
  MessageSquareText,
  Play,
  ShoppingCart,
  Server,
  Layers,
  Database,
  ShieldAlert,
  Bell,
  Cpu,
  Navigation,
  Rss,
  Star,
  Lock,
  ChevronDown,
} from "lucide-react";
import { CHALLENGES, type Challenge } from "@/data/challenges";
import { useProgressStore } from "@/store/progress-store";

function getChallengeIcon(iconName: string, className: string) {
  switch (iconName) {
    case "link":
      return <LinkIcon className={className} />;
    case "chat":
      return <MessageSquareText className={className} />;
    case "video":
      return <Play className={className} />;
    case "cart":
      return <ShoppingCart className={className} />;
    case "server":
      return <Server className={className} />;
    case "layers":
      return <Layers className={className} />;
    case "database":
      return <Database className={className} />;
    case "shield":
      return <ShieldAlert className={className} />;
    case "bell":
      return <Bell className={className} />;
    case "cpu":
      return <Cpu className={className} />;
    case "navigation":
      return <Navigation className={className} />;
    case "rss":
      return <Rss className={className} />;
    default:
      return <Server className={className} />;
  }
}

const colorStyles: Record<
  Challenge["iconColor"],
  {
    box: string;
    icon: string;
    borderHighlight?: string;
  }
> = {
  emerald: {
    box: "bg-emerald-950/50 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    icon: "text-emerald-400",
  },
  purple: {
    box: "bg-purple-950/50 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    icon: "text-purple-400",
  },
  red: {
    box: "bg-red-950/50 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    icon: "text-red-400",
  },
  amber: {
    box: "bg-amber-950/50 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    icon: "text-amber-400",
  },
  teal: {
    box: "bg-teal-950/50 border-teal-500/30 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]",
    icon: "text-teal-400",
  },
  cyan: {
    box: "bg-cyan-950/50 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    icon: "text-cyan-400",
  },
  blue: {
    box: "bg-blue-950/50 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    icon: "text-blue-400",
  },
  orange: {
    box: "bg-orange-950/50 border-orange-500/30 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    icon: "text-orange-400",
  },
  indigo: {
    box: "bg-indigo-950/50 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
    icon: "text-indigo-400",
  },
  pink: {
    box: "bg-pink-950/50 border-pink-500/30 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.15)]",
    icon: "text-pink-400",
  },
  rose: {
    box: "bg-rose-950/50 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    icon: "text-rose-400",
  },
  violet: {
    box: "bg-violet-950/50 border-violet-500/30 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    icon: "text-violet-400",
  },
};

export default function ChallengesPage() {
  const completions = useProgressStore((s) => s.challengeCompletions);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const completedIds = new Set(completions.map((c) => c.challengeId));

  // Determine unlock status: first challenge, unlockedByDefault, or completed previous
  const isUnlocked = (challenge: Challenge, index: number) => {
    if (challenge.unlockedByDefault || index === 0) return true;
    if (completedIds.has(challenge.id)) return true;
    const prev = CHALLENGES[index - 1];
    return prev ? completedIds.has(prev.id) : false;
  };

  const filteredChallenges = CHALLENGES.filter((c) => {
    if (selectedDifficulty === "all") return true;
    return c.difficulty.toString() === selectedDifficulty;
  });

  const completedCount = completedIds.size;
  const totalCount = CHALLENGES.length;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            System Design Challenges
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Solve real-world problems and level up.
          </p>
        </div>

        <div className="flex items-center gap-6 self-stretch justify-between md:self-auto md:justify-end">
          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-4 pr-10 text-xs font-semibold text-zinc-300 outline-none transition-colors hover:border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="all">All Difficulties</option>
              <option value="1">1 Star (Beginner)</option>
              <option value="2">2 Stars (Easy)</option>
              <option value="3">3 Stars (Medium)</option>
              <option value="4">4 Stars (Hard)</option>
              <option value="5">5 Stars (Expert)</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>

          {/* Progress Tracker */}
          <div className="text-right select-none">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              My Progress
            </div>
            <div className="text-sm font-bold text-white">
              <span className="text-emerald-400">{completedCount}</span> / {totalCount} completed
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredChallenges.map((challenge, idx) => {
          const globalIdx = CHALLENGES.findIndex((c) => c.id === challenge.id);
          const unlocked = isUnlocked(challenge, globalIdx);
          const completed = completedIds.has(challenge.id);
          const style = colorStyles[challenge.iconColor] || colorStyles.emerald;

          // Featured card highlighting for unlocked active challenge (like Card 1 in screenshot)
          const isFeatured = challenge.id === "url-shortener" && unlocked;

          return (
            <div
              key={challenge.id}
              className={`group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                isFeatured
                  ? "border-2 border-emerald-500 bg-zinc-950/90 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  : unlocked
                  ? "border border-zinc-800/90 bg-zinc-950/70 hover:border-emerald-500/40 hover:bg-zinc-900/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                  : "border border-zinc-800/60 bg-zinc-950/40 opacity-80"
              }`}
            >
              <div>
                {/* Icon Container */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${style.box}`}
                >
                  {getChallengeIcon(challenge.icon, `h-8 w-8 stroke-[1.75] ${style.icon}`)}
                </div>

                {/* Title & Description */}
                <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
                  {challenge.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {challenge.description}
                </p>
              </div>

              <div className="mt-8">
                {/* Metric Pill Badge & Star Rating */}
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-lg border border-zinc-800/80 bg-zinc-900/90 px-3 py-1 text-xs font-mono font-medium text-zinc-300">
                    {challenge.metricBadge}
                  </span>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < challenge.difficulty
                            ? "fill-amber-400 text-amber-400"
                            : "fill-zinc-800 text-zinc-800"
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {unlocked ? (
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className={`flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                      completed
                        ? "bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                    }`}
                  >
                    {completed ? "Completed ✓" : "Start Challenge"}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800/90 bg-zinc-900/80 py-3 text-sm font-semibold text-zinc-400 cursor-not-allowed select-none"
                  >
                    <span>Locked</span>
                    <Lock size={15} className="text-zinc-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

