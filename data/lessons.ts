import type { ComponentType, Requirements } from "@/types/architecture";

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  id: string;
  index: number;
  title: string;
  concept: string;
  teaches: string[];
  explain: string;
  whyUseIt: string[];
  tradeoffs: string[];
  challengePrompt: string;
  requirements: Requirements;
  availableComponents: ComponentType[];
  expectedComponents: ComponentType[];
  xpReward: number;
}

export const LESSONS: Lesson[] = [
  {
    id: "client-server-db",
    index: 1,
    title: "Client → Server → Database",
    concept: "The request/response cycle",
    teaches: ["Client", "API Server", "Database", "Request/response"],
    explain:
      "Every system starts the same way: a client sends a request, a server processes it, and a database stores or retrieves the data behind it.",
    whyUseIt: ["Foundation for every backend system", "Separates concerns: presentation, logic, storage"],
    tradeoffs: ["A single server and database can only handle so much traffic before they become bottlenecks"],
    challengePrompt: "Build a basic backend architecture: Client → API Server → Database.",
    requirements: {
      id: "client-server-db",
      name: "Basic backend",
      trafficRps: 300,
      maxLatencyMs: 250,
      minAvailability: 95,
    },
    availableComponents: ["client", "api_server", "postgres", "mongodb"],
    expectedComponents: ["api_server", "postgres"],
    xpReward: 100,
  },
  {
    id: "load-balancing",
    index: 2,
    title: "Load Balancing",
    concept: "Distributing traffic across servers",
    teaches: ["Why one server is insufficient", "Horizontal scaling", "Load balancing"],
    explain:
      "A load balancer distributes incoming requests across multiple servers. This prevents one server from becoming overloaded.",
    whyUseIt: ["Higher throughput", "Better availability", "Horizontal scaling"],
    tradeoffs: ["More infrastructure", "More complexity", "Additional network hop"],
    challengePrompt: "Handle 5,000 requests/second without overloading a single server.",
    requirements: {
      id: "load-balancing",
      name: "Handle 5,000 RPS",
      trafficRps: 5000,
      maxLatencyMs: 150,
      minAvailability: 99,
    },
    availableComponents: ["client", "load_balancer", "api_server", "postgres", "mongodb"],
    expectedComponents: ["load_balancer", "api_server", "postgres"],
    xpReward: 120,
  },
  {
    id: "caching",
    index: 3,
    title: "Caching",
    concept: "Keeping hot data close and fast",
    teaches: ["Cache", "Cache hit", "Cache miss", "Redis", "Database load"],
    explain:
      "A cache keeps frequently accessed data in fast, in-memory storage so most reads never have to touch the database at all.",
    whyUseIt: ["Very fast reads", "Reduces database load", "Absorbs traffic spikes"],
    tradeoffs: ["Additional infrastructure", "Memory limitations", "Cache invalidation complexity"],
    challengePrompt: "Reduce database load for a read-heavy API under 6,000 RPS.",
    requirements: {
      id: "caching",
      name: "Reduce database load",
      trafficRps: 6000,
      maxLatencyMs: 120,
      minAvailability: 99,
      readHeavy: true,
    },
    availableComponents: ["client", "load_balancer", "api_server", "redis", "postgres"],
    expectedComponents: ["load_balancer", "api_server", "redis", "postgres"],
    xpReward: 140,
  },
  {
    id: "replication",
    index: 4,
    title: "Database Replication",
    concept: "Scaling reads with replicas",
    teaches: ["Primary database", "Read replicas", "Read/write separation"],
    explain:
      "A primary database handles writes while one or more read replicas serve read traffic, spreading load across multiple database instances.",
    whyUseIt: ["Scales read throughput", "Isolates heavy reporting queries from writes"],
    tradeoffs: ["Replication lag", "More operational complexity", "Additional cost"],
    challengePrompt: "Handle heavy read traffic (8,000 RPS, 90% reads) without overloading the primary database.",
    requirements: {
      id: "replication",
      name: "Handle heavy read traffic",
      trafficRps: 8000,
      maxLatencyMs: 150,
      minAvailability: 99,
      readHeavy: true,
    },
    availableComponents: ["client", "load_balancer", "api_server", "redis", "postgres"],
    expectedComponents: ["load_balancer", "api_server", "postgres"],
    xpReward: 140,
  },
  {
    id: "async-processing",
    index: 5,
    title: "Asynchronous Processing",
    concept: "Taking slow work off the request path",
    teaches: ["Queue", "Worker", "Async processing", "Decoupling"],
    explain:
      "A queue buffers expensive work so a worker can process it in the background, keeping the API response fast.",
    whyUseIt: ["Lower request latency", "Smooths traffic spikes", "Decouples producers from consumers"],
    tradeoffs: ["Processing is no longer immediate", "Additional infrastructure and failure modes"],
    challengePrompt: "Handle expensive background jobs (video encoding, emails) without slowing down API responses.",
    requirements: {
      id: "async-processing",
      name: "Offload expensive jobs",
      trafficRps: 2000,
      maxLatencyMs: 100,
      minAvailability: 97,
      hasExpensiveWrites: true,
    },
    availableComponents: ["client", "load_balancer", "api_server", "queue", "worker", "postgres"],
    expectedComponents: ["api_server", "queue", "worker", "postgres"],
    xpReward: 140,
  },
  {
    id: "url-shortener",
    index: 6,
    title: "Complete URL Shortener",
    concept: "Combining everything you've learned",
    teaches: ["Load balancing", "Caching", "Replication", "Async processing", "CDN"],
    explain:
      "A production URL shortener has to redirect at very low latency, handle far more reads than writes, and stay up. This challenge combines everything from the previous lessons.",
    whyUseIt: ["Realistic composite system", "Forces trade-off decisions instead of adding everything"],
    tradeoffs: ["Every component you add has a cost — only add what the traffic actually requires"],
    challengePrompt: "Build a URL shortener capable of handling 10,000 requests per second with sub-100ms redirects.",
    requirements: {
      id: "url-shortener",
      name: "URL Shortener",
      trafficRps: 10000,
      users: 1000000,
      maxLatencyMs: 100,
      minAvailability: 99.9,
      readHeavy: true,
      staticAssets: false,
    },
    availableComponents: ["client", "load_balancer", "api_server", "cdn", "redis", "postgres", "mongodb", "queue", "worker"],
    expectedComponents: ["load_balancer", "api_server", "redis", "postgres"],
    xpReward: 250,
  },
];

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function getNextLesson(id: string) {
  const current = getLesson(id);
  if (!current) return undefined;
  return LESSONS.find((l) => l.index === current.index + 1);
}
