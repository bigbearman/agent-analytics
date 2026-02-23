# Agent Access Analytics — Project Context

## Overview
Specialized analytics platform for AI agent traffic. Website owners embed a JS snippet to track and analyze AI agent behavior (ChatGPT, Claude, Perplexity, Gemini...) on their websites — something Google Analytics can't do.

**Vision:** The control layer between websites and AI agents — track, control, monetize.

> Full product spec: [docs/SPEC.md](docs/SPEC.md)

## Problem
- Google Analytics measures people, not agents
- AI agent traffic is growing rapidly but no one can track it
- No visibility into which agents are using a site, their frequency, actions, or errors
- Publishers have no way to control or monetize AI access to their content
- First-mover opportunity — no competitor focused on this segment yet

## Solution
- JS embed snippet (< 3KB, vanilla TS, no dependencies)
- Server-side + behavioral + pattern detection (3 layers)
- Real-time dashboard: agent vs human, top pages, top actions, timeline
- Rules engine: allow, block, rate-limit, redirect AI agents
- Metered access: publishers charge AI companies for content access
- SaaS subscription + revenue share model

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
│   │       ├── rules/              # Rules engine (Phase 2)
│   │       ├── alerts/             # Alert service (Phase 2)
│   │       ├── enforce/            # Enforcement API (Phase 2)
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
│           ├── site.ts
│           └── rules.ts            # Rule types (Phase 2)
├── docs/
│   └── SPEC.md                     # Full product spec
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
GET /analytics/blocked         # Blocked requests stats (Phase 2)
GET /analytics/agents/:name    # Agent profile details (Phase 2)
GET /analytics/rule-hits       # Rule action breakdown (Phase 2)
```

### Sites (authenticated)
```
GET    /sites                  # List sites
POST   /sites                  # Create new site
GET    /sites/:id/snippet      # Get embed snippet
POST   /sites/:id/rotate-key   # Rotate API key
```

### Rules (authenticated, Phase 2)
```
POST   /rules                  # Create rule
GET    /rules?siteId=xxx       # List rules for site
PUT    /rules/:id              # Update rule
DELETE /rules/:id              # Delete rule
PATCH  /rules/:id/toggle       # Enable/disable rule
POST   /rules/reorder          # Reorder priorities
GET    /rules/preview          # Preview generated robots.txt
POST   /rules/deploy           # Deploy robots.txt to site
```

### Enforcement (edge, Phase 2)
```
GET    /enforce                # Edge middleware decision endpoint (< 50ms)
```

### Alerts (authenticated, Phase 2)
```
POST   /alerts                 # Create alert
GET    /alerts?siteId=xxx      # List alerts
PUT    /alerts/:id             # Update alert
DELETE /alerts/:id             # Delete alert
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

| Plan       | Price      | Events/month | Sites     | Rules | Enforcement | Metered Access |
|------------|------------|--------------|-----------|-------|-------------|----------------|
| Free       | $0         | 10K          | 1         | 3     | No          | No             |
| Starter    | $29/month  | 100K         | 5         | 10    | Edge        | No             |
| Pro        | $99/month  | 1M           | Unlimited | Unlimited | Edge + DNS | Yes         |
| Enterprise | Custom     | Unlimited    | Custom    | Unlimited | Full + SLA | Yes + marketplace |

**Metered Access revenue share:** Publisher 80% / Platform 20%

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

## Non-goals (Current)
- Mobile SDK
- Custom event tracking (auto-track only)
- Historical data import
- White-label

---

# Roadmap & Progress

## Phase 1: Track (MVP) — Analytics Foundation

### 1.1 Infrastructure
- [x] Turborepo monorepo setup
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Deploy API to Railway
- [x] Deploy Dashboard to Vercel
- [x] Deploy Tracker to Cloudflare R2

### 1.2 Tracker (apps/tracker)
- [x] Vanilla TS embed snippet (< 3KB)
- [x] Client-side agent detection (Layer 2: behavioral)
- [x] Fire-and-forget POST /collect
- [x] data-site and data-endpoint attributes
- [x] Edge Middleware option (Vercel)

### 1.3 Ingest API (apps/api)
- [x] POST /collect endpoint
- [x] ThrottlerGuard rate limiting by siteId
- [x] DTO validation with class-validator
- [x] Server-side UA detection (Layer 1)
- [x] BullMQ queue for async processing
- [x] Event processor worker
- [x] Site validation + plan limit checks
- [x] Redis deduplication (1s TTL)
- [x] PostgreSQL event insertion
- [ ] Daily aggregate table updates
- [ ] Request pattern detection (Layer 3)

### 1.4 Analytics API (apps/api)
- [x] GET /analytics/overview
- [x] GET /analytics/timeline
- [ ] GET /analytics/agents (breakdown by agent)
- [ ] GET /analytics/pages (top pages)
- [ ] GET /analytics/actions (top actions)
- [ ] Redis cache wrapper (TTL 5min)
- [ ] Previous period comparison (agentChange %)

### 1.5 Auth & Sites (apps/api)
- [x] JWT authentication
- [x] User registration and login
- [x] Site CRUD
- [x] API key generation
- [x] Embed snippet display
- [x] API key rotation
- [ ] Email verification
- [ ] Password reset

### 1.6 Dashboard (apps/dashboard)
- [x] Login / Register pages
- [x] Sites list page
- [x] Overview dashboard (stats cards + chart)
- [x] Embed snippet display
- [ ] Agent breakdown table
- [ ] Top pages table
- [ ] Date range picker (1d / 7d / 30d)
- [ ] Empty states and onboarding flow
- [ ] Responsive mobile layout

### 1.7 Shared Types (packages/types)
- [x] AgentEvent interface
- [x] AnalyticsOverview interface
- [x] KNOWN_AGENTS constant
- [ ] Rule types (for Phase 2)
- [ ] Alert types (for Phase 2)

---

## Phase 2: Control — Rules Engine & Enforcement

### 2.1 Database
- [ ] Create `rules` table + migration
- [ ] Create `rule_actions_log` partitioned table + migration
- [ ] Create `alerts` table + migration
- [ ] Add indexes with CONCURRENTLY

### 2.2 Rules Engine (apps/api — RulesModule)
- [ ] CRUD endpoints for rules
- [ ] Rule priority ordering
- [ ] Agent pattern matching (exact name, regex, wildcard)
- [ ] Path glob matching
- [ ] Schedule support (cron-based rules)
- [ ] Rule evaluation service (match request → return action)

### 2.3 Enforcement API (apps/api — EnforceModule)
- [ ] GET /enforce endpoint (< 50ms target)
- [ ] Redis cache for rules (TTL 60s)
- [ ] Rate limiting per agent per site (Redis sliding window)
- [ ] Block response (403 with configurable message)
- [ ] Redirect response
- [ ] Challenge/delay response
- [ ] Rule action logging to rule_actions_log

### 2.4 Edge Middleware SDK
- [ ] Vercel middleware template
- [ ] Cloudflare Workers template
- [ ] Next.js middleware template
- [ ] Nuxt middleware template
- [ ] NPM package: @agent-analytics/middleware

### 2.5 Smart robots.txt Generator
- [ ] Generate robots.txt from rules
- [ ] ai.txt support (TDM Reservation Protocol)
- [ ] Preview endpoint (GET /rules/preview)
- [ ] Deploy endpoint (POST /rules/deploy)
- [ ] Diff view: current vs proposed

### 2.6 Alerts Service (apps/api — AlertsModule)
- [ ] Alert CRUD endpoints
- [ ] New agent detection alert
- [ ] Traffic spike alert (>200% baseline)
- [ ] Rate limit threshold alert
- [ ] Email notification channel
- [ ] Webhook notification channel
- [ ] Weekly summary email (cron job)

### 2.7 Dashboard — Control Features
- [ ] Rules management page (create/edit/delete)
- [ ] Drag-and-drop rule priority
- [ ] Rule templates (quick presets)
- [ ] Agent profile page (per-agent details)
- [ ] Blocked requests log page
- [ ] robots.txt preview & deploy page
- [ ] Alerts configuration page
- [ ] Notification center

### 2.8 Billing Updates
- [ ] Plan-based rule limits (Free: 3, Starter: 10, Pro: unlimited)
- [ ] Enforcement feature gating per plan
- [ ] Stripe integration for Starter + Pro plans
- [ ] Usage-based overage billing

---

## Phase 3: Monetize — Content Licensing & Metered Access

### 3.1 Database
- [ ] Create `access_keys` table + migration
- [ ] Create `access_usage` partitioned table + migration
- [ ] Create `licensing_reports` table + migration

### 3.2 Metered Access (apps/api — AccessModule)
- [ ] Access key CRUD for AI consumers
- [ ] API key authentication for AI agents
- [ ] Request metering (count pages accessed per key)
- [ ] Usage aggregation (daily/monthly)
- [ ] Balance checking and enforcement
- [ ] Usage reporting endpoints

### 3.3 Licensing Reports
- [ ] Report generation service
- [ ] Per-agent scraping breakdown
- [ ] Content value estimation algorithm
- [ ] PDF export
- [ ] Scheduled monthly report generation

### 3.4 Billing — Revenue Share
- [ ] Stripe Connect for publisher payouts
- [ ] Monthly invoice generation for AI consumers
- [ ] Revenue split calculation (80/20)
- [ ] Payout dashboard for publishers

### 3.5 Dashboard — Monetize Features
- [ ] Access keys management page
- [ ] Usage analytics dashboard
- [ ] Revenue/payout overview
- [ ] Licensing report viewer + export
- [ ] Metered access setup wizard

### 3.6 Compliance & Audit
- [ ] EU AI Act compliance report template
- [ ] Copyright audit trail export
- [ ] DMCA takedown request helper
- [ ] Data retention policy enforcement per plan

---

## Backlog (Future)

- [ ] Content Access Marketplace (directory for AI companies)
- [ ] Community rule templates (shared presets)
- [ ] Team collaboration (multi-user per account)
- [ ] SSO / SAML for Enterprise
- [ ] Custom event tracking SDK
- [ ] Mobile SDK (iOS/Android)
- [ ] Historical data import
- [ ] White-label option
- [ ] Public status page
- [ ] GraphQL API option
- [ ] Webhook integrations (Zapier, Make)
- [ ] Slack / Discord bot integration
