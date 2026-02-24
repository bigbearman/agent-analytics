# AgentPulse — Project Context & Roadmap

> **Version:** v2 (aligned with SPEC-v3)
> **Updated:** 2026-02-24
> **Previous:** docs/PROJECT-v1.md (e-commerce pivot)

---

## Overview

**AgentPulse** is an AI traffic intelligence platform. Website owners install a JS snippet or server SDK to understand how AI bots interact with their content — which pages AI crawls most, which AI engines cite them, and how to optimize for AI visibility.

**Positioning:** "Google Analytics for AI traffic"

**Target users:** Developers, content sites, SMBs, SEO/marketing agencies

> **Full spec:** [docs/SPEC-v3.md](docs/SPEC-v3.md)
> **Business model:** [docs/BUSINESS-MODEL-v2.md](docs/BUSINESS-MODEL-v2.md)

---

## Why v2? What Changed?

| | PROJECT v1 (e-commerce) | PROJECT v2 (AI traffic intel) |
|---|---|---|
| Target | Shopify store owners | Developers, content sites, SMBs |
| Focus | Agent commerce funnel, product readiness | AI traffic analytics, content intelligence |
| Revenue | Shopify App $49-$399 | Direct SaaS $19-$149 |
| Code status | 0% of spec implemented | ~70% built, needs analytics depth |
| Reason for change | No Shopify expertise, market unvalidated, 0 code | Grounded in existing code + validated market |

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Backend | NestJS + Fastify | v10+ | High throughput ingest |
| Queue | BullMQ + Redis | v5+ / v7+ | Async event processing |
| Database | PostgreSQL | v16+ | Partitioned by timestamp |
| Cache | Redis | v7+ | Analytics cache, 5min TTL |
| Frontend | React + Vite | v18+ / v5+ | TailwindCSS, Recharts |
| Tracker | Vanilla TypeScript | - | IIFE bundle, sendBeacon |
| Server SDK | TypeScript | - | Express, Fastify, Next.js |
| ORM | Prisma | v5+ | Type-safe queries |
| Monorepo | Turborepo | v2+ | pnpm workspaces |

---

## Project Structure

```
agent-analytics/
├── apps/
│   ├── api/                         # NestJS backend
│   │   └── src/
│   │       ├── auth/                # JWT auth, user management
│   │       ├── ingest/              # POST /collect → BullMQ → PostgreSQL
│   │       ├── analytics/           # Query endpoints + Redis cache
│   │       ├── sites/               # Site CRUD, API keys, plan limits
│   │       ├── agent-detection/     # 3-layer bot detection
│   │       ├── health/              # Health check
│   │       ├── prisma/              # Database service
│   │       └── redis/               # Cache service
│   ├── dashboard/                   # React + Vite frontend
│   │   └── src/
│   │       ├── pages/               # overview, agents, pages-stats, timeline, sites
│   │       ├── components/          # layout, ui (stat-card, range-selector)
│   │       └── hooks/               # use-auth, use-analytics, use-sites
│   └── tracker/                     # JS embed snippet
│       └── src/
│           ├── detect.ts            # Client-side agent detection
│           ├── collect.ts           # sendBeacon/fetch event sending
│           └── index.ts             # Auto-init, SPA tracking
├── packages/
│   ├── types/                       # @agent-analytics/types
│   │   └── src/
│   │       ├── agents.ts            # KNOWN_AGENTS (16 bots) + confidence
│   │       ├── event.ts             # AgentEvent, EnrichedEvent
│   │       ├── analytics.ts         # AnalyticsOverview, PageStats, etc.
│   │       └── site.ts              # PlanType, PLAN_LIMITS
│   └── server-sdk/                  # Server-side middleware (UNCOMMITTED)
│       └── src/
│           ├── adapters/
│           │   ├── express.ts       # Express middleware
│           │   ├── fastify.ts       # Fastify plugin
│           │   └── next.ts          # Next.js middleware
│           └── core/
│               ├── detector.ts      # Server-side agent detection
│               ├── filter.ts        # Skip static files
│               ├── buffer.ts        # Event batching
│               ├── transport.ts     # Send to ingest API
│               └── config.ts        # Configuration
├── docs/                            # Specs and business docs
├── docker-compose.yml               # PostgreSQL (5437) + Redis (6381)
├── turbo.json                       # Turborepo pipeline
└── .env                             # Environment variables
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| API | Railway | https://api-production-feb6.up.railway.app |
| Dashboard | Vercel | https://dashboard-five-lemon-91.vercel.app |
| Tracker CDN | Cloudflare R2 | https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev |

---

## Database Schema (Current)

```sql
-- users
id          UUID PK
email       VARCHAR UNIQUE
password    VARCHAR (bcrypt, 12 rounds)
name        VARCHAR
created_at  TIMESTAMPTZ

-- sites
id          UUID PK
user_id     UUID FK → users
domain      VARCHAR
api_key     VARCHAR UNIQUE (aa_ + 48 hex chars)
plan        VARCHAR (free | starter | pro | enterprise)
created_at  TIMESTAMPTZ

-- events (partitioned by timestamp)
id          UUID PK
site_id     UUID FK → sites
url         TEXT
action      VARCHAR (pageview | click | fetch | error)
is_agent    BOOLEAN
agent_name  VARCHAR
confidence  SMALLINT (0-100)
source      VARCHAR (tracker | server)  ← recently added
timestamp   TIMESTAMPTZ
meta        JSONB

-- daily_aggregates
id          UUID PK
site_id     UUID FK → sites
date        DATE
total_events    INT
agent_events    INT
unique_agents   INT
top_agents      JSONB

-- monthly_usage
id          UUID PK
site_id     UUID FK → sites
month       DATE
event_count INT
```

### Schema Changes Needed (v3)

```sql
-- Add to events table
ALTER TABLE events ADD COLUMN agent_type VARCHAR(20);      -- training | search | on_demand
ALTER TABLE events ADD COLUMN referrer_domain VARCHAR(255);
ALTER TABLE events ADD COLUMN referrer_type VARCHAR(20);    -- ai_referral | organic | direct

-- New: page-level AI scores (computed daily by cron)
CREATE TABLE page_ai_scores (
  id              UUID PK,
  site_id         UUID FK → sites,
  url             VARCHAR(2048),
  date            DATE,
  ai_score        INT (0-100),
  crawl_score     INT (0-40),
  citation_score  INT (0-35),
  readiness_score INT (0-25),
  crawl_count     INT,
  referral_count  INT,
  agent_count     INT,
  top_agent       VARCHAR(100),
  UNIQUE(site_id, url, date)
);

-- New: AI referral tracking
CREATE TABLE ai_referrals (
  id              UUID PK,
  site_id         UUID FK → sites,
  referrer_domain VARCHAR(255),
  landing_url     VARCHAR(2048),
  timestamp       TIMESTAMPTZ,
  meta            JSONB
);
```

---

## What's Built vs. What's Needed

### ✅ BUILT — Reuse 100%

| Component | Status | Notes |
|-----------|--------|-------|
| Turborepo monorepo | ✅ Done | pnpm workspaces, turbo.json |
| Docker Compose | ✅ Done | PostgreSQL (5437) + Redis (6381) |
| NestJS API scaffold | ✅ Done | Fastify adapter, modular structure |
| POST /collect ingest | ✅ Done | DTO validation, throttle, 202 response |
| BullMQ queue + worker | ✅ Done | 3 attempts, exponential backoff |
| Event processor | ✅ Done | Validate site, plan limits, dedup, insert, aggregate |
| 3-layer agent detection | ✅ Done | UA (95), behavioral (60), pattern (40) |
| JWT authentication | ✅ Done | Register, login, guards |
| Site management | ✅ Done | CRUD, API keys, plan limits |
| Analytics endpoints | ✅ Done | overview, agents, pages, timeline |
| Redis cache | ✅ Done | 5min TTL, invalidation on write |
| React dashboard | ✅ Done | Overview, agents, pages-stats, timeline, sites |
| JS tracker | ✅ Done | IIFE bundle, auto-init, SPA support |
| Server SDK | ✅ Done | Express, Fastify, Next.js (UNCOMMITTED!) |
| Deployed | ✅ Done | Railway + Vercel + Cloudflare R2 |

### 🔨 NEEDS BUILDING — v3 Features

| Feature | Priority | Effort | Phase |
|---------|----------|--------|-------|
| Agent type classification (training/search/on_demand) | P0 | 1 day | Phase 1 |
| AI referral detection in tracker | P0 | 2 days | Phase 1 |
| Page-level AI analysis endpoint | P0 | 2 days | Phase 1 |
| AI referral analytics endpoint | P0 | 2 days | Phase 1 |
| Dashboard: Content Analysis page | P0 | 3 days | Phase 1 |
| Dashboard: AI Referrals page | P0 | 2 days | Phase 1 |
| Landing page (agentpulse.com) | P0 | 3 days | Phase 1 |
| Stripe integration | P1 | 3 days | Phase 1 |
| Content AI Score engine | P1 | 5 days | Phase 2 |
| Recommendations engine | P1 | 3 days | Phase 2 |
| Weekly email digest | P1 | 2 days | Phase 2 |
| Alert system | P2 | 3 days | Phase 2 |
| Laravel/PHP SDK | P2 | 5 days | Phase 3 |
| WordPress plugin | P2 | 5 days | Phase 3 |
| Agency/white-label features | P3 | 10 days | Phase 3 |

### ❌ DEPRECATED — Do NOT Build

| Feature | Reason |
|---------|--------|
| Shopify App / integration | SPEC-v2 deprecated, no team expertise |
| WooCommerce plugin | SPEC-v2 deprecated |
| E-commerce funnel tracking | SPEC-v2 deprecated |
| Product readiness scoring (e-commerce) | SPEC-v2 deprecated |
| Agent-attributed revenue (AAR) | SPEC-v2 deprecated |
| robots.txt management | Known Agents does this well |
| Bot blocking/control | Cloudflare does this free |
| On-premise deployment | Too early |
| Autonomous agent tracking | Market doesn't exist yet |

---

## Roadmap

### Phase 1: Ship & Validate (Month 1-2)

**Goal:** 500 free installs, validate demand.

```
Sprint 1-2 (Week 1-2): Backend
├── [ ] Commit server-sdk package
├── [ ] Migration: add agent_type, referrer_domain, referrer_type to events
├── [ ] Migration: create page_ai_scores table
├── [ ] Migration: create ai_referrals table
├── [ ] Add agent type classification in event processor
├── [ ] Add AI referral detection in tracker
├── [ ] New endpoint: GET /analytics/pages/ai-interest
├── [ ] New endpoint: GET /analytics/referrals
└── [ ] Update PLAN_LIMITS to match v3 pricing

Sprint 3-4 (Week 3-4): Frontend + Launch Prep
├── [ ] Dashboard: Content Analysis page (page-level AI interest)
├── [ ] Dashboard: AI Referrals page
├── [ ] Enhance Overview with AI ratio highlight + agent type badges
├── [ ] Landing page for agentpulse.com
├── [ ] Stripe integration (Starter $19 + Pro $49)
├── [ ] Onboarding flow for new users
└── [ ] Product Hunt / Hacker News launch prep

Sprint 5-6 (Week 5-6): Launch
├── [ ] Product Hunt launch
├── [ ] Hacker News "Show HN" post
├── [ ] Dev.to / Medium launch articles
├── [ ] Reddit posts (r/webdev, r/selfhosted, r/seo)
└── [ ] Twitter/X threads with AI traffic data/insights
```

**Success criteria:** 500 free installs, 50 DAU, 10 user interviews

### Phase 2: Monetize (Month 3-4)

**Goal:** 50 paying customers, $2-3K MRR.

```
├── [ ] Content AI Score calculation engine (daily cron)
├── [ ] Recommendations engine (rule-based)
├── [ ] Weekly email digest (free tier)
├── [ ] Real-time alerts (paid tiers)
├── [ ] Export CSV/PDF (Pro tier)
├── [ ] Blog: weekly AI traffic insights posts
└── [ ] Free tool: "AI Bot Traffic Scanner" (scan any URL)
```

**Success criteria:** 1,500 free users, 50 paid, $2-3K MRR, <8% churn

### Phase 3: Scale (Month 5-8)

**Goal:** Multi-platform SDKs, agency features, $10K MRR.

```
├── [ ] Laravel/PHP SDK
├── [ ] WordPress plugin
├── [ ] Nginx log parser
├── [ ] Python/Django middleware
├── [ ] Agency multi-site management
├── [ ] White-label reports (Business tier)
├── [ ] Team member access controls
├── [ ] API documentation + public API
└── [ ] Competitive AI visibility (lightweight add-on)
```

**Success criteria:** 5,000 free users, 200 paid, $8-15K MRR

---

## Key Metrics

| Metric | North Star |
|--------|-----------|
| **Primary** | Active sites with AI traffic detected |
| Growth | Free installs, paid conversions, MRR |
| Engagement | Dashboard DAU, time on dashboard |
| Revenue | MRR, ARPU, churn rate |
| Unit economics | CAC, LTV, LTV:CAC ratio |

---

## Competitive Landscape

```
                    DETECT        ANALYZE       OPTIMIZE
                   ─────────────────────────────────────────────
Cloudflare          ✅             ❌            ❌        FREE
Known Agents        ✅             ❌            ❌        FREE/WP
Profound            ✅             ✅            ✅        $$$$ Enterprise
AgentPulse          ✅             ✅            ✅        $0-149 SMB/Dev
```

**Our moat:** Analytics depth + multi-platform SDKs + developer-first distribution.

**Not our fight:** Detection (Cloudflare free), blocking (Cloudflare free), robots.txt (Known Agents).

---

## Pivot Signals — When to Change Direction

| Signal | Observed at | Action |
|--------|------------|--------|
| Free installs < 200 by Month 2 | Month 2 | Pivot marketing, not product |
| Paid conversion < 1.5% by Month 4 | Month 4 | Pivot to Content AI Score standalone |
| Churn > 15% monthly | Month 4+ | Product doesn't retain — investigate |
| Cloudflare adds analytics | Any time | Differentiate on cross-platform + depth |
| Revenue < $2K MRR by Month 6 | Month 6 | Evaluate pivot to B2B API or AEO tool |

---

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5437/agent_analytics
REDIS_URL=redis://localhost:6381
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
APP_URL=http://localhost:3000
TRACKER_CDN_URL=http://localhost:3002/tracker.js
NODE_ENV=development
```

---

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker

# 1. Start infrastructure
docker compose up -d

# 2. Setup database
cd apps/api && npx prisma migrate dev && cd ../..

# 3. Start all apps
pnpm dev

# Dashboard: http://localhost:5173
# API: http://localhost:3002
# Tracker: served by API at /tracker.js
```
