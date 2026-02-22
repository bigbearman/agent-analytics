# CLAUDE.md — AI Assistant Context

> File này giúp AI assistant (Claude, Cursor, Copilot...) hiểu nhanh project mà không cần giải thích lại từ đầu.
> Đặt file này ở root của project. Cập nhật mỗi khi có quyết định kiến trúc quan trọng.

---

## Project: Agent Access Analytics

Analytics platform cho AI agent traffic. Khách hàng nhúng một JS snippet vào website để track và phân tích AI agent behavior — thứ Google Analytics không làm được.

---

## Tech Stack & Versions

```
NestJS        v10+     Fastify adapter (KHÔNG dùng Express)
BullMQ        v5+      Queue processing
PostgreSQL    v16+     Partitioned tables
Redis         v7+      Cache + Queue broker
ReactJS       v18+     Dashboard
ViteJS        v5+      Build tool cho dashboard
TypeScript    v5+      Toàn bộ codebase
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
- **Ngôn ngữ code:** TypeScript strict mode, không dùng `any`
- **Ngôn ngữ comment:** Tiếng Việt OK cho business logic, English cho technical docs
- **Naming:** camelCase cho variables/functions, PascalCase cho classes/types, SCREAMING_SNAKE_CASE cho constants
- **File naming:** kebab-case (`ingest.controller.ts`, `agent-detection.service.ts`)

### NestJS conventions
- Mỗi feature = 1 module (`IngestModule`, `AnalyticsModule`, `SitesModule`, `AuthModule`)
- Controller chỉ handle HTTP — logic đẩy xuống Service
- Dùng `@InjectQueue()` cho BullMQ, không gọi queue trực tiếp trong controller
- DTOs dùng `class-validator` decorators, không validate thủ công
- Dùng `ConfigService` để access env vars, không dùng `process.env` trực tiếp
- Response format nhất quán:
  ```typescript
  // Success
  { data: T, meta?: PaginationMeta }
  // Error — NestJS exception filter tự xử lý
  ```

### Database conventions
- Prisma schema là source of truth
- Migration: `npx prisma migrate dev --name <tên>` — đặt tên mô tả, VD: `add_agent_confidence_column`
- Raw SQL chỉ dùng khi cần performance (analytics aggregation) — dùng `prisma.$queryRaw`
- Không bao giờ query trực tiếp trong Controller

### Queue conventions (BullMQ)
```typescript
// Luôn set removeOnComplete và attempts
await queue.add('process', data, {
  removeOnComplete: true,
  removeOnFail: false,   // giữ lại failed jobs để debug
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

### Cache conventions
- Cache key pattern: `{entity}:{id}:{params}` — VD: `overview:site-123:7d`
- Default TTL: 300 giây (5 phút) cho analytics queries
- Luôn invalidate cache khi có write operation liên quan

---

## Key Business Rules

### Rate Limiting (Ingest API)
```
Free:      100 requests/phút per site
Starter:   500 requests/phút per site
Pro:       2000 requests/phút per site
Enterprise: Custom
```

### Plan Limits (events/tháng)
```
Free:      10,000
Starter:   100,000
Pro:       1,000,000
Enterprise: Unlimited
```
→ Khi vượt limit: reject events, trả về 429, không drop silently

### Agent Detection Confidence Score
```
Layer 1 (Server UA match):   confidence = 95
Layer 2 (Behavioral):        confidence = 60
Layer 3 (Pattern):           confidence = 40
Combined layers:             confidence = max + 5 per extra layer
```
→ Chỉ mark `is_agent = true` khi confidence >= 50

### Data Retention
```
Free:    30 ngày
Starter: 90 ngày
Pro:     1 năm
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
  siteId: string;          // API key của site
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

// Response (luôn 202, không leak errors ra ngoài)
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
    agentChange: number;    // % so với period trước
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
  → Enrich với server-side UA detection
  → eventsQueue.add('process', data)
  → return 202 { ok: true }

Worker: ProcessEventJob
  → Validate site exists & within plan limits
  → Deduplicate (Redis SET với TTL 1s)
  → Insert vào PostgreSQL
  → Update daily aggregates
```

### Analytics query pattern
```typescript
// Luôn check cache trước
async getOverview(siteId: string, range: string) {
  const cacheKey = `overview:${siteId}:${range}`;

  return this.cache.wrap(cacheKey, 300, async () => {
    // Raw SQL cho performance
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

- ❌ Không dùng Express adapter — luôn dùng Fastify
- ❌ Không query DB trong Controller
- ❌ Không dùng `process.env` trực tiếp — dùng `ConfigService`
- ❌ Không block ingest response — mọi thứ phải qua queue
- ❌ Không store PII của end users — chỉ aggregate data
- ❌ Không dùng `any` trong TypeScript
- ❌ Không tạo index migration mà không có `CONCURRENTLY` (PostgreSQL sẽ lock table)
- ❌ Không hardcode agent list trong code — import từ `@agent-analytics/types`

---

## Useful Commands

```bash
# Start dev
pnpm dev                              # Chạy tất cả apps

# Database
npx prisma migrate dev --name <name>  # Tạo migration mới
npx prisma studio                     # GUI xem database

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
| 2026-02-22 | NestJS thay vì Laravel                | Team không biết PHP, full JS/TS stack           |
| 2026-02-22 | Fastify adapter thay vì Express       | Ingest API cần throughput cao                   |
| 2026-02-22 | BullMQ thay vì direct DB write        | Không block ingest response, handle burst load  |
| 2026-02-22 | PostgreSQL partition by timestamp     | Events table sẽ rất lớn, query theo range phổ biến |
| 2026-02-22 | Turborepo monorepo                    | Share types giữa tracker, API, dashboard        |
