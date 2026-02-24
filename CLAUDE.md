# CLAUDE.md — AI Assistant Context

> This file helps AI assistants (Claude, Cursor, Copilot...) quickly understand the project.
> **Version:** v2 (aligned with SPEC-v3, Business Model v2)
> **Updated:** 2026-02-24
> **Previous:** docs/CLAUDE-v1.md

---

## Project: AgentPulse — AI Traffic Intelligence

**One-liner:** "Google Analytics for AI traffic"

Analytics platform that helps developers and website owners understand how AI bots interact with their content. Not just detection (Cloudflare does that free) — but **intelligence**: which pages AI crawls most, which AI engines cite you, how your AI visibility is trending, and what to optimize.

> **Product spec:** [docs/SPEC-v3.md](docs/SPEC-v3.md)
> **Business model:** [docs/BUSINESS-MODEL-v2.md](docs/BUSINESS-MODEL-v2.md)
> **Archived:** docs/SPEC.md (v1), docs/SPEC-v2.md (v2 e-commerce), docs/CLAUDE-v1.md, docs/PROJECT-v1.md

---

## Positioning & Differentiation

```
Cloudflare AI Crawl Control  → "Security camera" — detect + block (FREE)
Known Agents / Dark Visitors → "Bouncer" — detect + robots.txt (FREE + WordPress)
Profound                     → "Enterprise analyst" — full intelligence ($$$, enterprise-only)
AgentPulse                   → "Business analyst" — analytics + intelligence (SMB/dev, $0-149/mo)
```

**We don't compete on detection.** We compete on **analytics and intelligence**.

Key differentiators:
1. **Page-level AI analysis** — which content AI finds most valuable
2. **AI referral tracking** — traffic FROM AI platforms (chatgpt.com, perplexity.ai)
3. **Content AI Score** — how "AI-friendly" each page is
4. **Multi-platform SDKs** — works on any hosting, not locked to Cloudflare/Vercel/WordPress
5. **Developer-first** — snippet + SDK + API, not enterprise sales

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
apps/
├── api/               NestJS backend (Fastify)
├── dashboard/         React + Vite frontend (TailwindCSS, Recharts)
└── tracker/           Vanilla TS embed snippet (IIFE bundle, sendBeacon)

packages/
├── types/             Shared TypeScript types (@agent-analytics/types)
└── server-sdk/        Server-side middleware (Express, Fastify, Next.js)

docs/
├── SPEC-v3.md         Product specification (ACTIVE)
├── BUSINESS-MODEL-v2.md Business model (ACTIVE)
├── SPEC-v2.md         E-commerce pivot spec (DEPRECATED)
├── SPEC.md            Original publisher spec (ARCHIVED)
├── BUSINESS-MODEL.md  E-commerce business model (DEPRECATED)
├── CLAUDE-v1.md       Previous CLAUDE.md backup
└── PROJECT-v1.md      Previous PROJECT.md backup
```

---

## Coding Conventions

### General
- **Code language:** TypeScript strict mode, never use `any`
- **Comment language:** English for all comments
- **Naming:** camelCase for variables/functions, PascalCase for classes/types, SCREAMING_SNAKE_CASE for constants
- **File naming:** kebab-case (`ingest.controller.ts`, `agent-detection.service.ts`)

### NestJS Conventions
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

### Database Conventions
- Prisma schema is the source of truth
- Migration: `npx prisma migrate dev --name <name>` — use descriptive names
- Raw SQL only when needed for performance (analytics aggregation) — use `prisma.$queryRaw`
- Never query directly in Controller
- Always use `CONCURRENTLY` for index creation (PostgreSQL will lock table otherwise)

### Queue Conventions (BullMQ)
```typescript
await queue.add('process', data, {
  removeOnComplete: true,
  removeOnFail: false,   // keep failed jobs for debugging
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

### Cache Conventions
- Cache key pattern: `{entity}:{siteId}:{params}` — e.g. `overview:site-123:7d`
- Default TTL: 300 seconds (5 minutes) for analytics queries
- Always invalidate cache on related write operations

---

## Business Rules

### Pricing & Plan Limits

```
Plan        Price      Sites  Events/mo  Rate/min  Retention
─────────── ────────── ────── ────────── ───────── ──────────
Free        $0         1      10,000     100       7 days
Starter     $19/mo     3      100,000    500       30 days
Pro         $49/mo     10     500,000    2,000     90 days
Business    $149/mo    ∞      5,000,000  10,000    1 year
```

Note: Code currently has `free/starter/pro/enterprise` tiers with different limits.
**TODO:** Align `packages/types/src/site.ts` PLAN_LIMITS with v3 pricing above.

### Feature Gating by Plan

```
Feature                    Free    Starter  Pro      Business
────────────────────────── ─────── ──────── ──────── ─────────
AI traffic overview        ✅      ✅       ✅       ✅
Agent breakdown            ✅      ✅       ✅       ✅
Agent type classification  ✅      ✅       ✅       ✅
AI referral tracking       Basic   ✅       ✅       ✅
Page-level AI analysis     Top 10  Top 50   ∞        ∞
Content AI Score           ❌      Top 20   ∞        ∞
Recommendations            ❌      Basic    Advanced Advanced
Alerts                     ❌      Weekly   Realtime Realtime
Export (CSV/PDF)           ❌      ❌       ✅       ✅
API access                 ❌      ❌       ✅       ✅
White-label reports        ❌      ❌       ❌       ✅
Multi-user team            ❌      ❌       3 users  ∞
```

### Rate Limiting
When plan event limit exceeded: reject events, return 429, never drop silently.

### Agent Detection — 3 Layers + Confidence

```
Layer 1 (Server UA match):   confidence = 95
Layer 2 (Behavioral):        confidence = 60
Layer 3 (Pattern):           confidence = 40
Combined layers:             confidence = max + 5 per extra layer
Threshold:                   is_agent = true when confidence >= 50
```

### Agent Type Classification

```typescript
// Classify agents by their purpose
type AgentType = 'training' | 'search' | 'on_demand' | 'unknown';

Training bots:    GPTBot, ClaudeBot, Google-Extended, ByteSpider, Meta-ExternalAgent,
                  Amazonbot, Applebot
Search bots:      OAI-SearchBot, PerplexityBot, YouBot, DuckAssistant, GoogleVertexBot,
                  GeminiBot, Gemini-Deep-Research
On-demand bots:   ChatGPT-User, Claude-User, Perplexity-User
```

### AI Referral Domains

```typescript
// Track referral traffic from these AI platforms
const AI_REFERRAL_DOMAINS = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'you.com': 'You.com',
  'copilot.microsoft.com': 'Microsoft Copilot',
  'gemini.google.com': 'Gemini',
  'claude.ai': 'Claude',
  'phind.com': 'Phind',
  'kagi.com': 'Kagi',
};
```

---

## Known Agents List

```typescript
// packages/types/src/agents.ts — 16 known agents
export const KNOWN_AGENTS = {
  GPTBot: /GPTBot/i,
  'ChatGPT-User': /ChatGPT-User/i,
  'OAI-SearchBot': /OAI-SearchBot/i,
  ClaudeBot: /ClaudeBot|Claude-Web/i,
  'Google-Extended': /Google-Extended/i,
  'Gemini-Deep-Research': /Gemini-Deep-Research/i,
  GoogleVertexBot: /Google-CloudVertexBot/i,
  GeminiBot: /GeminiiOS|Gemini\//i,
  PerplexityBot: /PerplexityBot/i,
  ByteSpider: /Bytespider/i,
  FacebookBot: /FacebookBot/i,
  'Meta-ExternalAgent': /Meta-ExternalAgent/i,
  Applebot: /Applebot/i,
  Amazonbot: /Amazonbot/i,
  YouBot: /YouBot/i,
  DuckAssistant: /DuckAssistant|DuckAssistBot/i,
};
```

---

## API Contracts

### POST /collect (public — ingest)
```typescript
// Request body
{
  siteId: string;
  url: string;
  action: 'pageview' | 'click' | 'fetch' | 'error';
  agent: { isAgent: boolean; agentName: string; confidence: number };
  timestamp: number;
  source?: 'tracker' | 'server';
  meta?: Record<string, unknown>;
  // NEW in v3 (via meta or dedicated fields):
  // meta.aiReferral?: boolean
  // meta.aiReferralSource?: string
  // meta.referrerDomain?: string
}
// Response (always 202, never leak errors to client)
{ ok: true }
```

### GET /analytics/overview (authenticated)
```typescript
// Query: { siteId, range: '1d' | '7d' | '30d' }
// Response:
{
  data: {
    totalRequests: number;
    agentRequests: number;
    humanRequests: number;
    agentRatio: number;
    uniqueAgents: number;
    agentChange: number;
    topAgents: Array<{ name: string; count: number; ratio: number }>;
  }
}
```

### GET /analytics/pages (authenticated — exists)
### GET /analytics/agents (authenticated — exists)
### GET /analytics/timeline (authenticated — exists)

### NEW endpoints needed (v3):
```
GET /analytics/pages/ai-interest    Page-level AI crawl breakdown
GET /analytics/referrals            AI referral traffic sources
GET /analytics/referrals/pages      Landing pages from AI referrals
GET /analytics/content-score        Content AI Score per page (Phase 2)
GET /analytics/recommendations      Optimization recommendations (Phase 2)
POST /scan/readiness                On-demand page readiness scan (Phase 2)
```

---

## Ingest Flow

```
POST /collect
  → ThrottlerGuard (rate limit by siteId)
  → IngestController.collect()
  → Validate DTO
  → Enrich with server-side UA detection
  → Classify agent type (training/search/on_demand)
  → Detect AI referral from meta
  → eventsQueue.add('process', data)
  → return 202 { ok: true }

Worker: ProcessEventJob
  → Validate site exists & within plan limits
  → Deduplicate (Redis SET with TTL 1s)
  → Insert into PostgreSQL
  → If AI referral → insert into ai_referrals table
  → Update daily aggregates
  → Update page_ai_scores (daily cron, not per-event)
  → Invalidate relevant cache keys
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5437/agent_analytics

# Redis
REDIS_URL=redis://localhost:6381

# Auth
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe (TODO: implement)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
APP_URL=http://localhost:3000
TRACKER_CDN_URL=http://localhost:3002/tracker.js
NODE_ENV=development
```

---

## What NOT to Do

- Do NOT use Express adapter — always use Fastify
- Do NOT query DB in Controller — use Services
- Do NOT use `process.env` directly — use `ConfigService`
- Do NOT block ingest response — everything must go through queue
- Do NOT store PII of end users — only aggregate data
- Do NOT use `any` in TypeScript
- Do NOT create index migrations without `CONCURRENTLY`
- Do NOT hardcode agent list — import from `@agent-analytics/types`
- Do NOT build e-commerce/Shopify features — SPEC-v2 is deprecated
- Do NOT build robots.txt management — Known Agents does this, not our focus
- Do NOT build blocking/control features — Cloudflare does this free, not our focus
- Do NOT compete on detection — compete on analytics and intelligence

---

## Useful Commands

```bash
# Start dev
pnpm dev                              # Run all apps

# Database
npx prisma migrate dev --name <name>  # Create new migration
npx prisma studio                     # GUI to browse database

# Docker
docker compose up -d                  # Start PostgreSQL + Redis

# Build
pnpm build                            # Build all packages
pnpm clean                            # Clean all dist/

# Test
pnpm test                             # Unit tests
pnpm test:e2e                         # E2E tests
```

---

## Current Deployment

```
API:       Railway  → https://api-production-feb6.up.railway.app
Dashboard: Vercel   → https://dashboard-five-lemon-91.vercel.app
Tracker:   CF R2    → https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev
```

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-22 | NestJS instead of Laravel | Team prefers JS/TS, full JS/TS stack |
| 2026-02-22 | Fastify adapter | Ingest API needs high throughput |
| 2026-02-22 | BullMQ for async processing | Don't block ingest response |
| 2026-02-22 | PostgreSQL partition by timestamp | Events table grows large, range queries common |
| 2026-02-22 | Turborepo monorepo | Share types between tracker, API, dashboard |
| 2026-02-24 | **Deprecate e-commerce pivot (v2)** | 0% code built, team lacks Shopify expertise, market unvalidated |
| 2026-02-24 | **Adopt "AI Traffic Intelligence" (v3)** | 70% code already built, validated by Cloudflare/Profound/Known Agents market |
| 2026-02-24 | **Compete on analytics, not detection** | Detection is free (Cloudflare). Intelligence is the gap at SMB/dev tier. |
| 2026-02-24 | **Price lower: $19/$49/$149** | Can't charge premium when Cloudflare gives detection free. Value is in analytics. |
| 2026-02-24 | **Server SDK as key differentiator** | Detects bots at server level (JS snippet misses most crawlers). Multi-platform. |
