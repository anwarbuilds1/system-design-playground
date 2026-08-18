import type { Architecture } from "@/types/architecture";

export interface Template {
  id: string;
  name: string;
  description: string;
  architecture: Architecture;
}

export const TEMPLATES: Template[] = [
  {
    id: "basic-web-app",
    name: "Basic Web App",
    description: "Client → API → Database",
    architecture: {
      nodes: [
        { id: "t-client", type: "client", label: "Client", position: { x: 60, y: 120 } },
        { id: "t-api", type: "api_server", label: "API Server", position: { x: 300, y: 120 } },
        { id: "t-db", type: "postgres", label: "PostgreSQL", position: { x: 540, y: 120 } },
      ],
      edges: [
        { id: "t-e1", source: "t-client", target: "t-api" },
        { id: "t-e2", source: "t-api", target: "t-db" },
      ],
    },
  },
  {
    id: "scalable-api",
    name: "Scalable API",
    description: "Client → Load Balancer → API Servers → Database",
    architecture: {
      nodes: [
        { id: "s-client", type: "client", label: "Client", position: { x: 40, y: 140 } },
        { id: "s-lb", type: "load_balancer", label: "Load Balancer", position: { x: 260, y: 140 } },
        { id: "s-api1", type: "api_server", label: "API Server 1", position: { x: 480, y: 60 } },
        { id: "s-api2", type: "api_server", label: "API Server 2", position: { x: 480, y: 220 } },
        { id: "s-db", type: "postgres", label: "PostgreSQL", position: { x: 700, y: 140 } },
      ],
      edges: [
        { id: "s-e1", source: "s-client", target: "s-lb" },
        { id: "s-e2", source: "s-lb", target: "s-api1" },
        { id: "s-e3", source: "s-lb", target: "s-api2" },
        { id: "s-e4", source: "s-api1", target: "s-db" },
        { id: "s-e5", source: "s-api2", target: "s-db" },
      ],
    },
  },
  {
    id: "cached-api",
    name: "Cached API",
    description: "Client → API → Redis → Database",
    architecture: {
      nodes: [
        { id: "c-client", type: "client", label: "Client", position: { x: 40, y: 120 } },
        { id: "c-api", type: "api_server", label: "API Server", position: { x: 260, y: 120 } },
        { id: "c-redis", type: "redis", label: "Redis", position: { x: 480, y: 120 } },
        { id: "c-db", type: "postgres", label: "PostgreSQL", position: { x: 700, y: 120 } },
      ],
      edges: [
        { id: "c-e1", source: "c-client", target: "c-api" },
        { id: "c-e2", source: "c-api", target: "c-redis" },
        { id: "c-e3", source: "c-redis", target: "c-db" },
      ],
    },
  },
];
