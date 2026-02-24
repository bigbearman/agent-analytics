# CLAUDE.md — AI Assistant Context

> This file helps AI assistants (Claude, Cursor, Copilot...) quickly understand the project without needing re-explanation.
> Place this file at the project root. Update whenever important architectural decisions are made.

---

## Project: Agent Access Analytics

Analytics platform for AI agent traffic. Customers embed a JS snippet into their website to track and analyze AI agent behavior — something Google Analytics can't do.

---

## Tech Stack & Versions

```
NestJS        v10+     Fastify adapter (NOT Express)
BullMQ        v5+      Queue processing
PostgreSQL    v16+     Partitioned tables
Redis         v7+      Cache + Queue broker
ReactJS       v18+     Dashboard
ViteJS        v5+      Build tool for dashboard
TypeScript    v5+      Entire codebase
Turborepo     v2+      Monorepo manager
Prisma        v5+      ORM (type-safe)
```

---

## Monorepo Structure

```
apps/api/          NestJS backend
apps/dashboard/    React + Vite frontend
apps/tracker/      Vanilla TS embed snippet
packages/types/    Shared TypeScript types (@agent-analytics/types)
```

---

## Coding Conventions

### General
- **Code language:** TypeScript strict mode, never use `any`
- **Comment language:** English for all comments
- **Naming:** camelCase for variables/functions, PascalCase for classes/types, SCREAMING_SNAKE_CASE for constants
- **File naming:** kebab-case (`ingest.controller.ts`, `agent-detection.service.ts`)

### NestJS conventions
- Each feature = 1 module (`IngestModule`, `AnalyticsModule`, `SitesModule`, `AuthModule`)
- Controllers only handle HTTP — push logic down to Services
- Use `@InjectQueue()` for BullMQ, never call queue directly in controller
- DTOs use `class-validator` decorators, no manual validation
- Use `ConfigService` to access env vars, never use `process.env` directly
- Consistent response format:
  ```typescript
  // Success
  { data: T, meta?: PaginationMeta }
  // Error — handled by NestJS exception filter
  ```

### Database conventions
- Prisma schema is the source of truth
- Migration: `npx prisma migrate dev --name <name>` — use descriptive names, e.g. `add_agent_confidence_column`
- Raw SQL only when needed for performance (analytics aggregation) — use `prisma.$queryRaw`
- Never query directly in Controller

### Queue conventions (BullMQ)
```typescript
// Always set removeOnComplete and attempts
await queue.add('process', data, {
  removeOnComplete: true,
  removeOnFail: false,   // keep failed jobs for debugging
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

### Cache conventions
- Cache key pattern: `{entity}:{id}:{params}` — e.g. `overview:site-123:7d`
- Default TTL: 300 seconds (5 minutes) for analytics queries
- Always invalidate cache on related write operations

---

## Key Business Rules

### Rate Limiting (Ingest API)
```
Free:      100 requests/min per site
Starter:   500 requests/min per site
Pro:       2000 requests/min per site
Enterprise: Custom
```

### Plan Limits (events/month)
```
Free:      10,000
Starter:   100,000
Pro:       1,000,000
Enterprise: Unlimited
```
→ When limit exceeded: reject events, return 429, never drop silently

### Agent Detection Confidence Score
```
Layer 1 (Server UA match):   confidence = 95
Layer 2 (Behavioral):        confidence = 60
Layer 3 (Pattern):           confidence = 40
Combined layers:             confidence = max + 5 per extra layer
```
→ Only mark `is_agent = true` when confidence >= 50

### Data Retention
```
Free:    30 days
Starter: 90 days
Pro:     1 year
```

---

## Agent Detection — Known Bots List

```typescript
// packages/types/src/agents.ts
export const KNOWN_AGENTS = {
  'GPTBot': /GPTBot/i,
  'ChatGPT-User': /ChatGPT-User/i,
  'ClaudeBot': /ClaudeBot|Claude-Web/i,
  'Google-Extended': /Google-Extended/i,
  'PerplexityBot': /PerplexityBot/i,
  'ByteSpider': /Bytespider/i,
  'FacebookBot': /FacebookBot/i,
  'Applebot': /Applebot/i,
  'Amazonbot': /Amazonbot/i,
  'YouBot': /YouBot/i,
  'DuckAssistant': /DuckAssistant/i,
} as const;
```

---

## API Contracts

### POST /collect (public)
```typescript
// Request body
{
  siteId: string;          // Site API key
  url: string;             // Full URL
  action: 'pageview' | 'click' | 'fetch' | 'error';
  agent: {
    isAgent: boolean;
    agentName: string;
    confidence: number;
  };
  timestamp: number;       // Unix ms
  meta?: Record<string, unknown>;
}

// Response (always 202, never leak errors to client)
{ ok: true }
```

### GET /analytics/overview
```typescript
// Query params
{ range: '1d' | '7d' | '30d', siteId: string }

// Response
{
  data: {
    totalRequests: number;
    agentRequests: number;
    humanRequests: number;
    agentRatio: number;
    uniqueAgents: number;
    agentChange: number;    // % change vs previous period
    topAgents: Array<{ name: string; count: number; ratio: number }>;
  }
}
```

---

## Common Patterns

### Ingest flow
```
POST /collect
  → ThrottlerGuard (rate limit by siteId)
  → IngestController.collect()
  → Validate DTO
  → Enrich with server-side UA detection
  → eventsQueue.add('process', data)
  → return 202 { ok: true }

Worker: ProcessEventJob
  → Validate site exists & within plan limits
  → Deduplicate (Redis SET with TTL 1s)
  → Insert into PostgreSQL
  → Update daily aggregates
```

### Analytics query pattern
```typescript
// Always check cache first
async getOverview(siteId: string, range: string) {
  const cacheKey = `overview:${siteId}:${range}`;

  return this.cache.wrap(cacheKey, 300, async () => {
    // Raw SQL for performance
    return this.prisma.$queryRaw`
      SELECT ...
      FROM events
      WHERE site_id = ${siteId}
        AND timestamp > NOW() - ${range}::INTERVAL
    `;
  });
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_analytics

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
APP_URL=https://agentanalytics.io
TRACKER_CDN_URL=https://cdn.agentanalytics.io/tracker.js
NODE_ENV=development
```

---

## What NOT to do

- Do NOT use Express adapter — always use Fastify
- Do NOT query DB in Controller
- Do NOT use `process.env` directly — use `ConfigService`
- Do NOT block ingest response — everything must go through queue
- Do NOT store PII of end users — only aggregate data
- Do NOT use `any` in TypeScript
- Do NOT create index migrations without `CONCURRENTLY` (PostgreSQL will lock table)
- Do NOT hardcode agent list in code — import from `@agent-analytics/types`

---

## Useful Commands

```bash
# Start dev
pnpm dev                              # Run all apps

# Database
npx prisma migrate dev --name <name>  # Create new migration
npx prisma studio                     # GUI to browse database

# Queue
# BullMQ dashboard: http://localhost:3000/admin/queues (Bull Board)

# Docker
docker compose up -d                  # Start PostgreSQL + Redis

# Test
pnpm test                             # Unit tests
pnpm test:e2e                         # E2E tests
```

---

## Current Status

- [ ] Project scaffold (Turborepo + NestJS + React + Tracker)
- [ ] Docker compose (PostgreSQL + Redis)
- [ ] Prisma schema + migrations
- [ ] Ingest API + BullMQ queue
- [ ] Agent detection service (3 layers)
- [ ] Analytics query service + cache
- [ ] JWT auth + site management
- [ ] React dashboard + charts
- [ ] JS tracker bundle
- [ ] Deploy (Railway / Render / VPS)

---

## Decisions Log

| Date       | Decision                              | Reason                                          |
|------------|---------------------------------------|-------------------------------------------------|
| 2026-02-22 | NestJS instead of Laravel             | Team prefers JS/TS, full JS/TS stack            |
| 2026-02-22 | Fastify adapter instead of Express    | Ingest API needs high throughput                |
| 2026-02-22 | BullMQ instead of direct DB write     | Don't block ingest response, handle burst load  |
| 2026-02-22 | PostgreSQL partition by timestamp     | Events table will grow large, range queries are common |
| 2026-02-22 | Turborepo monorepo                    | Share types between tracker, API, dashboard     |
