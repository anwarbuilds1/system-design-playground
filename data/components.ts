import type { ComponentType } from "@/types/architecture";

export interface ComponentSpec {
  type: ComponentType;
  name: string;
  category: "Infrastructure" | "Storage" | "Messaging";
  description: string;
  purpose: string;
  advantages: string[];
  disadvantages: string[];
  useCases: string[];
  baseCostPerMonth: number;
  baseLatencyMs: number;
  /** requests/sec this single instance can absorb before it degrades */
  capacityRps: number;
}

export const COMPONENTS: Record<ComponentType, ComponentSpec> = {
  client: {
    type: "client",
    name: "Client",
    category: "Infrastructure",
    description: "The browser, mobile app, or service that originates a request.",
    purpose: "Represents where traffic comes from.",
    advantages: ["Entry point for every architecture"],
    disadvantages: ["Not controlled by your system"],
    useCases: ["Every architecture starts here"],
    baseCostPerMonth: 0,
    baseLatencyMs: 0,
    capacityRps: Infinity,
  },
  load_balancer: {
    type: "load_balancer",
    name: "Load Balancer",
    category: "Infrastructure",
    description: "Distributes incoming requests across multiple servers.",
    purpose: "Prevent one server from becoming overloaded.",
    advantages: ["Higher throughput", "Better availability", "Horizontal scaling"],
    disadvantages: ["More infrastructure", "Additional network hop"],
    useCases: ["Any service running more than one API server"],
    baseCostPerMonth: 20,
    baseLatencyMs: 2,
    capacityRps: 50000,
  },
  api_server: {
    type: "api_server",
    name: "API Server",
    category: "Infrastructure",
    description: "Runs your application logic and handles requests.",
    purpose: "Process business logic for each request.",
    advantages: ["Flexible", "Easy to scale horizontally"],
    disadvantages: ["Limited per-instance capacity", "Stateless design required to scale"],
    useCases: ["Handling HTTP requests, business logic"],
    baseCostPerMonth: 25,
    baseLatencyMs: 15,
    capacityRps: 1000,
  },
  cdn: {
    type: "cdn",
    name: "CDN",
    category: "Infrastructure",
    description: "Caches and serves static content from edge locations near users.",
    purpose: "Reduce origin traffic and latency for static assets.",
    advantages: ["Very low latency for static content", "Reduces origin load"],
    disadvantages: ["Only helps static/cacheable content", "Cache invalidation complexity"],
    useCases: ["Images, JS/CSS bundles, static pages"],
    baseCostPerMonth: 15,
    baseLatencyMs: 5,
    capacityRps: 100000,
  },
  redis: {
    type: "redis",
    name: "Redis",
    category: "Storage",
    description: "An in-memory cache for frequently accessed data.",
    purpose: "Reduce database reads.",
    advantages: ["Very fast", "Reduces database load"],
    disadvantages: ["Additional infrastructure", "Memory limitations", "Cache invalidation complexity"],
    useCases: ["Frequently accessed data", "Session storage", "Rate limiting"],
    baseCostPerMonth: 30,
    baseLatencyMs: 1,
    capacityRps: 20000,
  },
  postgres: {
    type: "postgres",
    name: "PostgreSQL",
    category: "Storage",
    description: "A relational database used as the primary source of truth.",
    purpose: "Durable, consistent storage for structured data.",
    advantages: ["Strong consistency", "Rich querying"],
    disadvantages: ["Harder to scale writes horizontally", "Can become a bottleneck under heavy load"],
    useCases: ["Transactional data", "Relational data with strong consistency needs"],
    baseCostPerMonth: 40,
    baseLatencyMs: 8,
    capacityRps: 2000,
  },
  mongodb: {
    type: "mongodb",
    name: "MongoDB",
    category: "Storage",
    description: "A document database optimized for flexible schemas and horizontal scale.",
    purpose: "Store semi-structured or rapidly evolving data.",
    advantages: ["Flexible schema", "Scales horizontally more easily than a single relational primary"],
    disadvantages: ["Weaker consistency guarantees by default", "Joins are less natural"],
    useCases: ["Catalogs, logs, content with flexible shape"],
    baseCostPerMonth: 45,
    baseLatencyMs: 7,
    capacityRps: 2500,
  },
  queue: {
    type: "queue",
    name: "Queue",
    category: "Messaging",
    description: "Buffers work so it can be processed asynchronously by a worker.",
    purpose: "Decouple slow or expensive work from the request path.",
    advantages: ["Lower request latency", "Smooths traffic spikes", "Decouples producers and consumers"],
    disadvantages: ["Eventual, not immediate, processing", "Additional infrastructure and failure modes"],
    useCases: ["Sending emails", "Video/image processing", "Any expensive background job"],
    baseCostPerMonth: 20,
    baseLatencyMs: 3,
    capacityRps: 15000,
  },
  worker: {
    type: "worker",
    name: "Worker",
    category: "Messaging",
    description: "Consumes jobs from a queue and processes them off the request path.",
    purpose: "Execute asynchronous work.",
    advantages: ["Scales independently from API servers"],
    disadvantages: ["Adds operational surface area", "Needs monitoring for stuck/failed jobs"],
    useCases: ["Background job processing"],
    baseCostPerMonth: 25,
    baseLatencyMs: 0,
    capacityRps: 800,
  },
};

export const COMPONENT_LIST = Object.values(COMPONENTS).filter((c) => c.type !== "client");
