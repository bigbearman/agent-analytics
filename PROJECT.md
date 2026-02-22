# Agent Access Analytics — Project Context

## Overview
Analytics platform chuyên biệt cho AI agent traffic. Website owners nhúng một JS snippet để track và phân tích AI agent behavior (ChatGPT, Claude, Perplexity, Gemini...) trên website của họ — thứ mà Google Analytics không làm được.

## Problem
- Google Analytics đo người, không đo agent
- AI agent traffic tăng mạnh nhưng không ai track được
- Không biết agent nào đang dùng site, tần suất, action, lỗi gì
- First-mover opportunity — chưa có competitor focused vào segment này

## Solution
- JS embed snippet (< 3KB, vanilla TS, không dependency)
- Server-side + behavioral + pattern detection (3 layers)
- Real-time dashboard: agent vs human, top pages, top actions, timeline
- SaaS subscription theo volume

---

## Tech Stack

### Backend
- **Framework:** NestJS + Fastify adapter (high throughput ingest)
- **Queue:** BullMQ + Redis (async event processing)
- **Database:** PostgreSQL với table partitioning theo ngày
- **Cache:** Redis (pre-aggregated analytics, TTL 5 phút)
- **Auth:** JWT, per-site API keys, multi-tenant

### Frontend
- **Dashboard:** ReactJS + ViteJS
- **Charts:** Recharts
- **Styling:** TailwindCSS

### Tracker
- Vanilla TypeScript → bundle ES module nhỏ
- Auto detect agent via UA + behavioral signals
- Fire-and-forget POST, không block page load

### Monorepo
- **Tool:** Turborepo
- **Shared packages:** `@agent-analytics/types` (TypeScript types dùng chung)

---

## Project Structure

```
agent-analytics/
├── apps/
│   ├── api/                        # NestJS backend
│   │   └── src/
│   │       ├── ingest/             # Nhận events từ tracker
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

### Layer 1: Server-side User Agent (tin cậy nhất)
Known bots: GPTBot, ClaudeBot, Claude-Web, Google-Extended, PerplexityBot, ByteSpider, FacebookBot, Applebot, Amazonbot, DuckAssistant, YouBot

### Layer 2: Behavioral (client-side)
- Không có mousemove trong 5 giây đầu
- Không có scroll events
- Request timing quá đều đặn
- Không có focus/blur events

### Layer 3: Request Patterns (server-side)
- Không có Referer header
- Accept header bất thường
- Không load assets phụ (img, css, fonts)
- Burst requests từ cùng IP

---

## API Endpoints

### Ingest (public, rate-limited)
```
POST /collect                  # Nhận event từ tracker
```

### Analytics (authenticated)
```
GET /analytics/overview        # Tổng quan: total, agent%, unique agents
GET /analytics/agents          # Breakdown theo agent name
GET /analytics/pages           # Top pages by agent traffic
GET /analytics/actions         # Top actions
GET /analytics/timeline        # Time series data
```

### Sites (authenticated)
```
GET    /sites                  # List sites
POST   /sites                  # Tạo site mới
GET    /sites/:id/snippet      # Lấy embed snippet
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
| Starter    | $29/tháng  | 100K         | 5         |
| Pro        | $99/tháng  | 1M           | Unlimited |
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
- Custom event tracking (chỉ auto-track)
- Historical data import
- Team collaboration features
- White-label
