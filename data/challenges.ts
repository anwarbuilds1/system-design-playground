import type { ComponentType, Requirements } from "@/types/architecture";

export interface Challenge {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  requirementsList: string[];
  constraints: string[];
  requirements: Requirements;
  availableComponents: ComponentType[];
  expected: ComponentType[];
  optional: ComponentType[];
  xpReward: number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "basic-api",
    title: "Build a Basic API",
    difficulty: 1,
    description: "Stand up a simple backend that can serve requests and persist data.",
    requirementsList: ["Accept client requests", "Persist data", "Return responses"],
    constraints: ["Latency < 250ms", "Availability > 95%"],
    requirements: { id: "basic-api", name: "Basic API", trafficRps: 300, maxLatencyMs: 250, minAvailability: 95 },
    availableComponents: ["client", "api_server", "postgres", "mongodb"],
    expected: ["api_server", "postgres"],
    optional: [],
    xpReward: 100,
  },
  {
    id: "scale-api",
    title: "Scale an API",
    difficulty: 2,
    description: "Your basic API is falling over under load. Make it handle real traffic.",
    requirementsList: ["Handle 5,000 RPS", "No single server should take all the traffic"],
    constraints: ["Latency < 150ms", "Availability > 99%"],
    requirements: { id: "scale-api", name: "Scale an API", trafficRps: 5000, maxLatencyMs: 150, minAvailability: 99 },
    availableComponents: ["client", "load_balancer", "api_server", "postgres"],
    expected: ["load_balancer", "api_server", "postgres"],
    optional: ["redis"],
    xpReward: 150,
  },
  {
    id: "slow-database",
    title: "Fix a Slow Database",
    difficulty: 3,
    description: "Reads are drowning your primary database. Bring latency back down without throwing away consistency.",
    requirementsList: ["Reduce read load on the primary database", "Keep write consistency"],
    constraints: ["Latency < 120ms", "Availability > 99%"],
    requirements: {
      id: "slow-database",
      name: "Fix a slow database",
      trafficRps: 7000,
      maxLatencyMs: 120,
      minAvailability: 99,
      readHeavy: true,
    },
    availableComponents: ["client", "load_balancer", "api_server", "redis", "postgres"],
    expected: ["load_balancer", "api_server", "redis", "postgres"],
    optional: [],
    xpReward: 180,
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    difficulty: 3,
    description: "Build the classic system design interview problem end to end.",
    requirementsList: ["Create short URLs", "Redirect users", "Track clicks", "Handle high read traffic"],
    constraints: ["Latency < 100ms", "Availability > 99.9%"],
    requirements: {
      id: "url-shortener",
      name: "URL Shortener",
      trafficRps: 10000,
      users: 1000000,
      maxLatencyMs: 100,
      minAvailability: 99.9,
      readHeavy: true,
    },
    availableComponents: ["client", "load_balancer", "api_server", "cdn", "redis", "postgres", "mongodb", "queue", "worker"],
    expected: ["load_balancer", "api_server", "redis", "postgres"],
    optional: ["queue"],
    xpReward: 250,
  },
];

export function getChallenge(id: string) {
  return CHALLENGES.find((c) => c.id === id);
}
