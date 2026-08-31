export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number | null;
}

const LEVELS: { level: number; title: string; minXp: number }[] = [
  { level: 1, title: "System Design Beginner", minXp: 0 },
  { level: 2, title: "Backend Builder", minXp: 300 },
  { level: 3, title: "Scalability Explorer", minXp: 700 },
  { level: 4, title: "Distributed Systems Explorer", minXp: 1000 },
  { level: 5, title: "Principal Architect", minXp: 2000 },
];

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
  }
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[idx + 1];
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextLevelXp: next ? next.minXp : 2000,
  };
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first-architecture", name: "First Architecture", description: "Built your first architecture." },
  { id: "first-simulation", name: "First Simulation", description: "Ran your first simulation." },
  { id: "cache-master", name: "Cache Master", description: "Used Redis to cut database load below 50%." },
  { id: "scaling-beginner", name: "Scaling Beginner", description: "Scaled an API with a load balancer." },
  { id: "zero-bottlenecks", name: "Zero Bottlenecks", description: "Ran a simulation with no bottlenecks detected." },
  { id: "architecture-optimizer", name: "Architecture Optimizer", description: "Scored 90+ on a challenge." },
];
