# System Design Playground (MVP)

Learn system design by building it. Drag components onto a canvas, run a
deterministic traffic simulation against your architecture, see exactly where
it breaks, fix it, and watch your score climb.

This is the vertical slice described in the product brief:

```
Lesson → Canvas → Build → Run Simulation → Results → Score → XP
```

implemented end to end across all 6 lessons, 4 challenges, and a free
playground.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables or database setup
required — the MVP uses in-memory data plus localStorage for persistence (see
"What's mocked" below).

Other scripts:

```bash
npm run test    # runs the simulation engine's unit tests (vitest)
npm run build   # production build
npm run lint    # eslint
```

## What's actually in here

- **Deterministic simulation engine** (`lib/simulation/`) — `validators.ts`,
  `metrics.ts`, `rules.ts`, `scoring.ts`, `engine.ts`. No AI, no randomness.
  Same architecture + requirements always produce the same result. Fully
  testable without React — see `lib/simulation/__tests__/engine.test.ts`
  (10 tests covering bottleneck detection, load-balancer scaling, Redis
  caching, async offload, SPOF detection, and the "don't reward unnecessary
  components" scoring rule).
- **`/api/simulations`** — a real Next.js API route. The frontend calls this
  over HTTP rather than importing the engine directly, so the simulation
  logic is genuinely separated from the UI.
- **6 lessons** (`data/lessons.ts`): client/server/db, load balancing,
  caching, replication, async processing, and a combined URL shortener
  challenge — each with a Learn step and a Build & Simulate step sharing the
  same canvas component.
- **4 challenges** (`data/challenges.ts`) with hidden expected architectures,
  including the URL Shortener working end to end.
- **Free playground** (`/playground`) with templates, save/load, and
  adjustable traffic requirements.
- **Gamification**: XP, 4 levels, 6 badges, a progress page, and a (mocked)
  leaderboard.
- **Reusable canvas** (`components/canvas/ArchitectureCanvas.tsx`) built on
  React Flow: drag-and-drop palette, custom nodes per component type,
  properties/knowledge panel, bottleneck highlighting.

## What's mocked / simplified for the MVP

Per the brief's own instructions ("if setting up PostgreSQL would slow
development, use an in-memory/mock repository"):

- **No database.** User progress (XP, completed lessons/challenges, badges)
  and saved playground architectures live in `zustand` stores persisted to
  `localStorage` (`store/progress-store.ts`, `store/playground-store.ts`).
  Swapping these for a Postgres + Prisma-backed API is a matter of changing
  those two files — nothing else references localStorage directly.
- **No auth.** Everything is guest-mode, scoped to the browser.
- **AI review is a documented gap, not a fake abstraction.** The brief asks
  for an `ArchitectureReviewer` abstraction with a mock deterministic
  implementation for MVP. The commendations/deductions already returned by
  `calculateScore()` serve that purpose today (see "What you did well" /
  "What could improve" in the results panel). A literal `ArchitectureReviewer`
  interface wasn't split out separately since the scoring engine already
  produces the same plain-language feedback — wiring an LLM later means
  adding a new function with the same return shape, not restructuring
  anything.
- **Leaderboard is mocked** with a handful of static entries plus your real
  XP for comparison, exactly as the brief allows.

## Architecture

```
app/
  page.tsx                 Landing page
  learn/                   Lesson list + [lessonId] Learn/Build experience
  playground/               Free playground
  challenges/               Challenge list + [challengeId] detail
  profile/                  XP, levels, badges, completed lessons
  leaderboard/               Mocked leaderboard
  api/simulations/           POST endpoint running the engine server-side

lib/
  simulation/               engine.ts, rules.ts, metrics.ts, scoring.ts,
                             validators.ts — pure, tested, UI-independent
  architecture/              useArchitecture.ts — React Flow state + graph helpers
  gamification.ts            Level thresholds, badge definitions

components/
  canvas/                    Palette, custom nodes, properties panel, canvas
  simulation/                Simulation runner, results panel, validation errors
  ui/                        Button, Card, Badge, ProgressBar, XP toast

store/
  progress-store.ts          XP / levels / badges (persisted)
  playground-store.ts        Saved architectures (persisted)

data/
  components.ts               Component catalog: cost, latency, capacity
  lessons.ts / challenges.ts   Content + requirements
  templates.ts                 Starter architectures for the playground

types/architecture.ts          Shared graph + simulation types
```

## Simulation model, briefly

The engine is intentionally an approximation, not a real infra simulator:

- Each component type has a fixed `capacityRps`, `baseLatencyMs`, and
  `baseCostPerMonth` (`data/components.ts`).
- A CDN offloads ~35% of traffic before it reaches the API tier.
- Redis absorbs ~70% of what would otherwise hit the database.
- Multiple API servers only help throughput if a load balancer is present —
  otherwise only one server's worth of capacity is counted.
- Latency accumulates per hop, plus a congestion penalty once any tier
  crosses 80% of capacity.
- Availability starts near 99.99% and is docked per single point of failure
  (one API server, one database, etc).
- Scoring rewards meeting the traffic/latency/availability requirements and
  penalizes components that don't earn their place (Redis under low traffic,
  a queue with no consumer requirement, an unnecessary read replica, etc.) —
  the "don't reward complexity for its own sake" rule from the brief.

## Known gaps vs. the full brief

- Lessons/challenges are served as static TypeScript data rather than through
  `GET /api/lessons` / `GET /api/challenges` endpoints — the brief explicitly
  says to keep the backend simple, and this content doesn't change at
  runtime.
- No GitHub/Google auth — guest mode only, as the brief allows.
- No Prisma schema/migrations, per the in-memory-first fallback the brief
  describes.

These are straightforward to add later without touching the simulation
engine or the canvas — that separation was the point.
