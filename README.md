# AgentPulse — AI Traffic Intelligence

> **Google Analytics for AI traffic.**

Analytics platform that helps developers and website owners understand how AI bots interact with their content. Track which AI crawlers visit, which pages they find most valuable, which AI engines cite you, and how to optimize your AI visibility.

**Cloudflare detects AI bots. AgentPulse tells you what they want.**

## Why AgentPulse?

Google Analytics, Adobe Analytics, and Matomo are blind to AI traffic. AI crawlers don't execute JavaScript, don't use cookies, and don't have sessions. ~5-9% of your website traffic is invisible.

AgentPulse closes that gap:

- **AI Traffic Overview** — Human vs AI traffic split, trends, agent breakdown
- **Page-Level AI Analysis** — Which content AI crawls most, per-page agent breakdown
- **AI Referral Tracking** — Traffic arriving FROM AI platforms (ChatGPT, Perplexity, Claude)
- **Content AI Score** — How "AI-friendly" each page is, with optimization recommendations
- **Agent Type Classification** — Training bots vs search bots vs on-demand bots

## How It's Different

```
Cloudflare AI Crawl Control  →  Detects + blocks AI bots (FREE, Cloudflare-only)
Known Agents (Dark Visitors) →  Detects + robots.txt (FREE, WordPress-only)
Profound                     →  Full intelligence (Enterprise-only, $$$)
AgentPulse                   →  Analytics + intelligence (Any platform, $0-149/mo)
```

## Architecture

```
         Website
         ┌─────────────────────────────────────┐
         │  JS Tracker        Server SDK       │
         │  (client-side)     (Express/Fastify/ │
         │  AI referrals      Next.js middleware)│
         │  Behavioral        UA detection      │
         └────────┬──────────────┬─────────────┘
                  │ POST /collect │
                  └──────┬───────┘
                         ▼
         ┌───────────────────────────────────┐
         │        NestJS API (Fastify)       │
         │  ThrottlerGuard → Validate DTO    │
         │  → Agent Type Classify            │
         │  → AI Referral Detect             │
         │  → BullMQ Queue                   │
         └──────────────┬────────────────────┘
                        ▼
         ┌───────────────────────────────────┐
         │        Event Processor            │
         │  Validate site + plan limits      │
         │  Deduplicate (Redis 1s TTL)       │
         │  Insert PostgreSQL                │
         │  Update aggregates                │
         │  Invalidate cache                 │
         └──────────────┬────────────────────┘
                        ▼
         ┌───────────────────────────────────┐
         │      React Dashboard (Vite)       │
         │  Overview · Agents · Content      │
         │  Referrals · Timeline · Sites     │
         └───────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | NestJS + Fastify | High-throughput ingest API |
| Queue | BullMQ | Async event processing, 3 retries |
| Database | PostgreSQL 16 | Partitioned event storage |
| Cache | Redis 7 | Analytics cache (5min TTL) + queue broker |
| Frontend | React 18 + Vite | Dashboard (TailwindCSS, Recharts) |
| Tracker | Vanilla TypeScript | Client-side JS snippet (IIFE, sendBeacon) |
| Server SDK | TypeScript | Express, Fastify, Next.js middleware |
| ORM | Prisma 5 | Type-safe database access |
| Monorepo | Turborepo | Shared types across packages |

## Project Structure

```
apps/
├── api/               NestJS backend (Fastify adapter)
├── dashboard/         React + Vite frontend
└── tracker/           Vanilla TS embed snippet

packages/
├── types/             Shared TypeScript types (@agent-analytics/types)
└── server-sdk/        Server-side middleware (Express, Fastify, Next.js)
```

## Agent Detection (3 Layers)

| Layer | Method | Confidence | Description |
|-------|--------|------------|-------------|
| 1 | Server UA match | 95 | Match User-Agent against 16 known AI bots |
| 2 | Behavioral signals | 60 | Mouse movement, scroll, focus/blur detection |
| 3 | Request patterns | 40 | Missing Referer, unusual Accept headers |

**Combined scoring:** `max(layers) + 5 * (extra_layers - 1)`
**Threshold:** `is_agent = true` when confidence >= 50

### Known AI Agents (16)

**Training bots:** GPTBot, ClaudeBot, Google-Extended, ByteSpider, Meta-ExternalAgent, Amazonbot, Applebot

**Search bots:** OAI-SearchBot, PerplexityBot, YouBot, DuckAssistant, GoogleVertexBot, GeminiBot, Gemini-Deep-Research

**On-demand bots:** ChatGPT-User, Claude-User, Perplexity-User

### AI Referral Domains

Track traffic arriving from AI platforms: chatgpt.com, perplexity.ai, you.com, copilot.microsoft.com, gemini.google.com, claude.ai, phind.com, kagi.com

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd agent-analytize
pnpm install

# 2. Start PostgreSQL + Redis
docker compose up -d

# 3. Setup environment
cp apps/api/.env.example apps/api/.env

# 4. Run migrations
cd apps/api && npx prisma migrate dev && cd ../..

# 5. Start all apps
pnpm dev
```

### Services

| Service | URL |
|---------|-----|
| API | http://localhost:3002 |
| Dashboard | http://localhost:5173 |
| Prisma Studio | `npx prisma studio` |

## Integration

### Option 1: JavaScript Snippet (Client-side)

Add to your website's `<head>`:

```html
<script
  src="https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev/tracker.js"
  data-site="YOUR_SITE_API_KEY"
  data-endpoint="https://api-production-feb6.up.railway.app"
  defer
></script>
```

Detects: Human traffic + JS-enabled bots + AI referral traffic.
Misses: Bots that don't execute JavaScript (GPTBot, ClaudeBot, etc.)

### Option 2: Server SDK (Server-side) — Recommended

Install the middleware for your framework:

```bash
npm install @agent-analytics/server-sdk
```

**Express:**
```typescript
import { agentAnalytics } from '@agent-analytics/server-sdk';

app.use(agentAnalytics({
  siteId: 'YOUR_SITE_API_KEY',
  endpoint: 'https://api-production-feb6.up.railway.app',
}));
```

**Fastify:**
```typescript
import { agentAnalyticsPlugin } from '@agent-analytics/server-sdk/fastify';

fastify.register(agentAnalyticsPlugin, {
  siteId: 'YOUR_SITE_API_KEY',
  endpoint: 'https://api-production-feb6.up.railway.app',
});
```

**Next.js:**
```typescript
// middleware.ts
import { agentAnalyticsMiddleware } from '@agent-analytics/server-sdk/next';

export default agentAnalyticsMiddleware({
  siteId: 'YOUR_SITE_API_KEY',
  endpoint: 'https://api-production-feb6.up.railway.app',
});

export const config = { matcher: ['/((?!_next|api|static).*)'] };
```

Detects: ALL traffic including bots that skip JavaScript (Layer 1).

**Best practice:** Use both JS snippet (for AI referrals + behavioral detection) + Server SDK (for bot detection) together for full coverage.

## API

### `POST /collect` — Ingest Events

```json
{
  "siteId": "aa_xxxx",
  "url": "https://example.com/page",
  "action": "pageview",
  "agent": { "isAgent": true, "agentName": "GPTBot", "confidence": 95 },
  "timestamp": 1708700000000,
  "source": "server",
  "meta": {
    "aiReferral": true,
    "aiReferralSource": "ChatGPT"
  }
}
```

Always returns `202 { ok: true }`. Never leaks errors to client.

### `GET /analytics/overview` — Traffic Overview

```
?siteId=xxx&range=7d
```

```json
{
  "data": {
    "totalRequests": 12450,
    "agentRequests": 1203,
    "humanRequests": 11247,
    "agentRatio": 0.097,
    "uniqueAgents": 8,
    "agentChange": 23.5,
    "topAgents": [
      { "name": "GPTBot", "count": 452, "ratio": 0.376 },
      { "name": "ClaudeBot", "count": 289, "ratio": 0.240 }
    ]
  }
}
```

### Other Endpoints

```
GET /analytics/agents              Agent breakdown
GET /analytics/pages               Page statistics
GET /analytics/timeline            Time series data
GET /analytics/pages/ai-interest   Page-level AI crawl breakdown (coming)
GET /analytics/referrals           AI referral traffic (coming)
GET /analytics/content-score       Content AI Score (coming)
```

## Pricing

| | Free | Starter | Pro | Business |
|---|---|---|---|---|
| **Price** | $0 | $19/mo | $49/mo | $149/mo |
| **Sites** | 1 | 3 | 10 | Unlimited |
| **Events/month** | 10,000 | 100,000 | 500,000 | 5,000,000 |
| **Rate limit** | 100/min | 500/min | 2,000/min | 10,000/min |
| **Retention** | 7 days | 30 days | 90 days | 1 year |
| Page-level analysis | Top 10 | Top 50 | Unlimited | Unlimited |
| Content AI Score | - | Top 20 | Unlimited | Unlimited |
| API access | - | - | ✅ | ✅ |
| White-label | - | - | - | ✅ |

Events exceeding plan limits are rejected with HTTP 429 (never dropped silently).

## Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| API | Railway | https://api-production-feb6.up.railway.app |
| Dashboard | Vercel | https://dashboard-five-lemon-91.vercel.app |
| Tracker CDN | Cloudflare R2 | https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev |

## Documentation

- [Product Specification](docs/SPEC-v3.md) — Features, architecture, roadmap
- [Business Model](docs/BUSINESS-MODEL-v2.md) — Market analysis, pricing, financial projections

## License

Proprietary — All rights reserved.
