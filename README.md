# Agent Access Analytics

Analytics platform for AI agent traffic. Track and analyze AI bot behavior on your website — something Google Analytics can't do.

Customers embed a JS snippet or deploy Edge Middleware to detect AI agents (GPTBot, ClaudeBot, PerplexityBot...) crawling their sites in real-time.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │               Your Website                  │
                    │                                             │
                    │  ┌─────────────────┐  ┌──────────────────┐  │
                    │  │ Edge Middleware  │  │  Client Tracker   │  │
                    │  │ (server-side)   │  │  (JavaScript)     │  │
                    │  │ Detects bots    │  │  Detects humans   │  │
                    │  │ that skip JS    │  │  + JS-enabled     │  │
                    │  └────────┬────────┘  └────────┬─────────┘  │
                    └───────────┼─────────────────────┼────────────┘
                                │    POST /collect    │
                                ▼                     ▼
                    ┌─────────────────────────────────────────────┐
                    │              NestJS API (Fastify)            │
                    │                                             │
                    │  Ingest → ThrottlerGuard → BullMQ Queue     │
                    │                    │                        │
                    │                    ▼                        │
                    │  Worker: Agent Detection (3 layers)          │
                    │    → Validate site & plan limits            │
                    │    → Deduplicate (Redis)                    │
                    │    → Insert PostgreSQL                      │
                    │    → Update aggregates                      │
                    └──────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────────────┐
                    │         React Dashboard (Vite)              │
                    │                                             │
                    │  Overview · Top Agents · Traffic Charts      │
                    │  Site Management · Embed Snippets           │
                    └─────────────────────────────────────────────┘
```

## Tech Stack

| Layer       | Technology      | Purpose                       |
|-------------|-----------------|-------------------------------|
| Backend     | NestJS + Fastify| High-throughput ingest API     |
| Queue       | BullMQ          | Async event processing        |
| Database    | PostgreSQL 16   | Partitioned event storage     |
| Cache       | Redis 7         | Caching + queue broker        |
| Frontend    | React 18 + Vite | Analytics dashboard           |
| Tracker     | Vanilla TS      | Client-side JS snippet        |
| Edge        | Vercel Middleware| Server-side bot detection     |
| ORM         | Prisma 5        | Type-safe database access     |
| Monorepo    | Turborepo       | Shared types across packages  |

## Monorepo Structure

```
agent-analytize/
├── apps/
│   ├── api/            # NestJS backend (Fastify adapter)
│   ├── dashboard/      # React + Vite frontend
│   └── tracker/        # Vanilla TS embed snippet
├── packages/
│   └── types/          # Shared TypeScript types (@agent-analytics/types)
├── docker-compose.yml  # PostgreSQL + Redis
├── turbo.json
└── package.json
```

## Agent Detection (3 Layers)

| Layer | Method              | Confidence | Description                           |
|-------|---------------------|------------|---------------------------------------|
| 1     | Server UA match     | 95         | Match User-Agent against known bots   |
| 2     | Behavioral signals  | 60         | JS execution, mouse/scroll events     |
| 3     | Request patterns    | 40         | Timing, headers, navigation patterns  |

**Combined scoring:** `max(layers) + 5 * (extra_layers - 1)`
**Threshold:** `is_agent = true` when confidence >= 50

### Known Agents

GPTBot, ChatGPT-User, ClaudeBot, Google-Extended, PerplexityBot, ByteSpider, FacebookBot, Applebot, Amazonbot, YouBot, DuckAssistant

## API Endpoints

### `POST /collect` (Public)

Ingest endpoint for tracking events. Always returns `202 { ok: true }`.

```json
{
  "siteId": "aa_xxxx",
  "url": "https://example.com/page",
  "action": "pageview",
  "agent": {
    "isAgent": true,
    "agentName": "GPTBot",
    "confidence": 95
  },
  "timestamp": 1708700000000,
  "meta": {}
}
```

### `GET /analytics/overview`

Returns traffic overview for a site.

```
?siteId=xxx&range=7d
```

```json
{
  "data": {
    "totalRequests": 1234,
    "agentRequests": 567,
    "humanRequests": 667,
    "agentRatio": 0.46,
    "uniqueAgents": 5,
    "agentChange": 12.5,
    "topAgents": [
      { "name": "GPTBot", "count": 200, "ratio": 0.35 }
    ]
  }
}
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
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
# Edit .env with your database credentials

# 4. Run migrations
cd apps/api && npx prisma migrate dev

# 5. Start all apps
pnpm dev
```

### Services

| Service    | URL                        |
|------------|----------------------------|
| API        | http://localhost:3000       |
| Dashboard  | http://localhost:5173       |
| Prisma Studio | http://localhost:5555    |

## Tracking Integration

### Option 1: JavaScript Snippet (Client-side)

Add this to your website's `<head>`:

```html
<script
  src="https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev/tracker.js"
  data-site="YOUR_SITE_API_KEY"
  data-endpoint="https://api-production-feb6.up.railway.app"
  defer
></script>
```

**Detects:** Human traffic + JS-enabled bots (Layer 2 & 3)
**Misses:** Bots that don't execute JavaScript (GPTBot, ClaudeBot...)

### Option 2: Edge Middleware (Server-side)

For Vercel-hosted sites, add `middleware.ts` at project root:

```typescript
import { next, ipAddress, geolocation } from '@vercel/functions';
import type { RequestContext } from '@vercel/functions';

const KNOWN_AGENTS: Record<string, RegExp> = {
  GPTBot: /GPTBot/i,
  ClaudeBot: /ClaudeBot|Claude-Web/i,
  PerplexityBot: /PerplexityBot/i,
  // ... full list in packages/types/src/agents.ts
};

export default function middleware(request: Request, context: RequestContext) {
  const ua = request.headers.get('user-agent') ?? '';
  let agent = { isAgent: false, agentName: '', confidence: 0 };

  for (const [name, pattern] of Object.entries(KNOWN_AGENTS)) {
    if (pattern.test(ua)) {
      agent = { isAgent: true, agentName: name, confidence: 95 };
      break;
    }
  }

  context.waitUntil(
    fetch('https://api-production-feb6.up.railway.app/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: 'YOUR_SITE_API_KEY',
        url: request.url,
        action: 'pageview',
        agent,
        timestamp: Date.now(),
      }),
    })
  );

  return next();
}

export const config = {
  matcher: ['/', '/about', '/blog', '/contact'],
};
```

**Detects:** ALL traffic including bots that skip JavaScript (Layer 1)
**Recommended:** Use both options together for full coverage.

## Deployment

| Component   | Platform  | URL                                           |
|-------------|-----------|-----------------------------------------------|
| API         | Railway   | https://api-production-feb6.up.railway.app     |
| Dashboard   | Vercel    | https://dashboard-five-lemon-91.vercel.app     |
| Tracker CDN | Cloudflare R2 | https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev |

## Plan Limits

| Feature         | Free    | Starter  | Pro        | Enterprise |
|-----------------|---------|----------|------------|------------|
| Events/month    | 10,000  | 100,000  | 1,000,000  | Unlimited  |
| Rate limit/min  | 100     | 500      | 2,000      | Custom     |
| Data retention  | 30 days | 90 days  | 1 year     | Custom     |

When limits are exceeded, events are rejected with HTTP 429 (never dropped silently).

## License

Proprietary - All rights reserved.
