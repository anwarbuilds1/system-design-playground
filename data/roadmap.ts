export interface RoadmapNode {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  xpReward: number;
  lessonId?: string; // links to /learn/[lessonId] if exists
  isBoss?: boolean;
}

export interface RoadmapZone {
  id: number;
  label: string;
  color: string; // hex color for the zone accent
  nodes: RoadmapNode[];
}

export const ROADMAP_ZONES: RoadmapZone[] = [
  {
    id: 1,
    label: "Foundations",
    color: "#34d399",
    nodes: [
      {
        id: "what-is-sd",
        index: 1,
        title: "What is System Design?",
        subtitle: "Introduction & approach",
        xpReward: 100,
      },
      {
        id: "perf-vs-scale",
        index: 2,
        title: "Performance vs Scalability",
        subtitle: "Core trade-offs",
        xpReward: 120,
      },
      {
        id: "cap-theorem",
        index: 3,
        title: "CAP Theorem",
        subtitle: "Consistency, Availability, Partition",
        xpReward: 150,
      },
    ],
  },
  {
    id: 2,
    label: "Availability & Consistency",
    color: "#60a5fa",
    nodes: [
      {
        id: "consistency-patterns",
        index: 4,
        title: "Consistency Patterns",
        subtitle: "Weak, Eventual, Strong",
        xpReward: 150,
      },
      {
        id: "availability-patterns",
        index: 5,
        title: "Availability Patterns",
        subtitle: "Fail-Over strategies",
        xpReward: 150,
      },
      {
        id: "failover-replication",
        index: 6,
        title: "Fail-Over & Replication",
        subtitle: "Master-Slave, Master-Master",
        xpReward: 150,
        lessonId: "replication",
      },
    ],
  },
  {
    id: 3,
    label: "Networking",
    color: "#a78bfa",
    nodes: [
      {
        id: "dns",
        index: 7,
        title: "Domain Name System",
        subtitle: "DNS resolution & records",
        xpReward: 120,
      },
      {
        id: "cdn",
        index: 8,
        title: "Content Delivery Networks",
        subtitle: "Push CDN vs Pull CDN",
        xpReward: 130,
      },
      {
        id: "load-balancers",
        index: 9,
        title: "Load Balancers",
        subtitle: "Layer 4/7, algorithms",
        xpReward: 150,
        lessonId: "load-balancing",
      },
      {
        id: "communication",
        index: 10,
        title: "HTTP / TCP / REST / RPC",
        subtitle: "Communication protocols",
        xpReward: 200,
      },
    ],
  },
  {
    id: 4,
    label: "Data Layer",
    color: "#fb923c",
    nodes: [
      {
        id: "rdbms",
        index: 11,
        title: "RDBMS & SQL Tuning",
        subtitle: "Relational databases",
        xpReward: 150,
        lessonId: "client-server-db",
      },
      {
        id: "nosql",
        index: 12,
        title: "NoSQL Databases",
        subtitle: "Key-Value, Document, Graph",
        xpReward: 150,
      },
      {
        id: "caching",
        index: 13,
        title: "Caching Strategies",
        subtitle: "Cache-Aside, Write-through",
        xpReward: 200,
        lessonId: "caching",
      },
      {
        id: "sharding",
        index: 14,
        title: "Sharding & Federation",
        subtitle: "Horizontal partitioning",
        xpReward: 180,
      },
      {
        id: "async",
        index: 15,
        title: "Asynchronism & Queues",
        subtitle: "Message queues, task queues",
        xpReward: 180,
        lessonId: "async-processing",
      },
    ],
  },
  {
    id: 5,
    label: "Architecture",
    color: "#f87171",
    nodes: [
      {
        id: "microservices",
        index: 16,
        title: "App Layer & Microservices",
        subtitle: "Service discovery, API gateway",
        xpReward: 200,
      },
      {
        id: "cloud-patterns",
        index: 17,
        title: "Cloud Design Patterns",
        subtitle: "CQRS, Event Sourcing, Saga",
        xpReward: 250,
      },
      {
        id: "reliability",
        index: 18,
        title: "Reliability Patterns",
        subtitle: "Circuit Breaker, Bulkhead",
        xpReward: 250,
      },
    ],
  },
  {
    id: 6,
    label: "Observability",
    color: "#fbbf24",
    nodes: [
      {
        id: "monitoring",
        index: 19,
        title: "Monitoring & Security",
        subtitle: "Health, performance, alerts",
        xpReward: 200,
      },
    ],
  },
  {
    id: 7,
    label: "Final Boss",
    color: "#f59e0b",
    nodes: [
      {
        id: "url-shortener-boss",
        index: 20,
        title: "Full System Design",
        subtitle: "URL Shortener Challenge",
        xpReward: 500,
        lessonId: "url-shortener",
        isBoss: true,
      },
    ],
  },
];

export const ALL_ROADMAP_NODES: RoadmapNode[] = ROADMAP_ZONES.flatMap((z) => z.nodes);

/** All nodes that have a real lesson behind them */
export const LESSON_LINKED_NODES = ALL_ROADMAP_NODES.filter((n) => n.lessonId && !n.isBoss);
