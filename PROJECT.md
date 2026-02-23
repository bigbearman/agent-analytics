# Agent Access Analytics — Project Context

## Overview
Specialized analytics platform for AI agent traffic. Website owners embed a JS snippet to track and analyze AI agent behavior (ChatGPT, Claude, Perplexity, Gemini...) on their websites — something Google Analytics can't do.

## Problem
- Google Analytics measures people, not agents
- AI agent traffic is growing rapidly but no one can track it
- No visibility into which agents are using a site, their frequency, actions, or errors
- First-mover opportunity — no competitor focused on this segment yet

## Solution
- JS embed snippet (< 3KB, vanilla TS, no dependencies)
- Server-side + behavioral + pattern detection (3 layers)
- Real-time dashboard: agent vs human, top pages, top actions, timeline
- SaaS subscription by volume

---

## Tech Stack

### Backend
- **Framework:** NestJS + Fastify adapter (high throughput ingest)
- **Queue:** BullMQ + Redis (async event processing)
- **Database:** PostgreSQL with table partitioning by day
- **Cache:** Redis (pre-aggregated analytics, TTL 5 minutes)
- **Auth:** JWT, per-site API keys, multi-tenant

### Frontend
- **Dashboard:** ReactJS + ViteJS
- **Charts:** Recharts
- **Styling:** TailwindCSS

### Tracker
- Vanilla TypeScript → small ES module bundle
- Auto detect agent via UA + behavioral signals
- Fire-and-forget POST, does not block page load

### Monorepo
- **Tool:** Turborepo
- **Shared packages:** `@agent-analytics/types` (shared TypeScript types)

---

## Project Structure

```
agent-analytics/
├── apps/
│   ├── api/                        # NestJS backend
│   │   └── src/
│   │       ├── ingest/             # Receive events from tracker
│   │       ├── analytics/          # Query, aggregate, cache
│   │       ├── sites/              # Site management, API keys
│   │       ├── auth/               # JWT auth, user management
│   │       └── billing/            # Subscription, plan limits
│   ├── dashboard/                  # React + Vite frontend
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       └── hooks/
│   └── tracker/                    # JS embed snippet
│       └── src/
│           ├── detect.ts           # Agent detection logic
│           ├── collect.ts          # Event collection & send
│           └── index.ts            # Entry point
├── packages/
│   └── types/                      # Shared TypeScript types
│       └── src/
│           ├── event.ts
│           ├── analytics.ts
│           └── site.ts
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Database Schema

### sites
```sql
id UUID PRIMARY KEY
user_id INT
domain VARCHAR(255)
api_key VARCHAR(64) UNIQUE
plan VARCHAR(20) DEFAULT 'free'
created_at TIMESTAMPTZ
```

### events (partitioned by timestamp)
```sql
id BIGSERIAL
site_id UUID
session_id VARCHAR(64)
url TEXT
action VARCHAR(50)           -- pageview | click | fetch | error
is_agent BOOLEAN
agent_name VARCHAR(100)      -- GPTBot | ClaudeBot | PerplexityBot | ...
confidence SMALLINT          -- 0-100, detection confidence score
country VARCHAR(2)
timestamp TIMESTAMPTZ
meta JSONB                   -- extra data (status code, error message...)
```

### Key indexes
```sql
CREATE INDEX idx_events_site_agent ON events(site_id, is_agent, timestamp DESC);
CREATE INDEX idx_events_agent_name ON events(agent_name, timestamp DESC);
```

---

## Agent Detection — 3 Layers

### Layer 1: Server-side User Agent (most reliable)
Known bots: GPTBot, ClaudeBot, Claude-Web, Google-Extended, PerplexityBot, ByteSpider, FacebookBot, Applebot, Amazonbot, DuckAssistant, YouBot

### Layer 2: Behavioral (client-side)
- No mousemove within first 5 seconds
- No scroll events
- Overly regular request timing
- No focus/blur events

### Layer 3: Request Patterns (server-side)
- Missing Referer header
- Unusual Accept header
- Does not load secondary assets (img, css, fonts)
- Burst requests from same IP

---

## API Endpoints

### Ingest (public, rate-limited)
```
POST /collect                  # Receive event from tracker
```

### Analytics (authenticated)
```
GET /analytics/overview        # Overview: total, agent%, unique agents
GET /analytics/agents          # Breakdown by agent name
GET /analytics/pages           # Top pages by agent traffic
GET /analytics/actions         # Top actions
GET /analytics/timeline        # Time series data
```

### Sites (authenticated)
```
GET    /sites                  # List sites
POST   /sites                  # Create new site
GET    /sites/:id/snippet      # Get embed snippet
POST   /sites/:id/rotate-key   # Rotate API key
```

---

## Shared Types (packages/types)

```typescript
export interface AgentEvent {
  siteId: string;
  url: string;
  action: 'pageview' | 'click' | 'fetch' | 'error';
  agent: {
    isAgent: boolean;
    agentName: string;
    confidence: number;       // 0-100
  };
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface AnalyticsOverview {
  totalRequests: number;
  agentRequests: number;
  humanRequests: number;
  agentRatio: number;         // percentage
  uniqueAgents: number;
  agentChange: number;        // % change vs previous period
}
```

---

## Business Model

| Plan       | Price      | Events/month | Sites     |
|------------|------------|--------------|-----------|
| Free       | $0         | 10K          | 1         |
| Starter    | $29/month  | 100K         | 5         |
| Pro        | $99/month  | 1M           | Unlimited |
| Enterprise | Custom     | Unlimited    | Custom    |

---

## MVP Timeline

| Day | Focus                  | Deliverables                                              |
|-----|------------------------|-----------------------------------------------------------|
| 1   | Ingest Pipeline        | JS Tracker, NestJS ingest endpoint, BullMQ queue, Redis   |
| 2   | Analytics + Auth       | PostgreSQL schema, query service, cache layer, JWT auth   |
| 3   | Dashboard + Deploy     | React dashboard, charts, agent table, onboarding, deploy  |

---

## Environment Variables

```env
# API
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_analytics
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
APP_URL=https://agentanalytics.io
TRACKER_URL=https://cdn.agentanalytics.io/tracker.js
```

---

## Non-goals (MVP)
- Mobile SDK
- Custom event tracking (auto-track only)
- Historical data import
- Team collaboration features
- White-label
