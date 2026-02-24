# AgentPulse — Project Context & Roadmap

> **Updated:** 2026-02-24

---

## Overview

**AgentPulse** is an AI traffic intelligence platform. Website owners install a JS snippet or server SDK to understand how AI bots interact with their content — which pages AI crawls most, which AI engines cite them, and how to optimize for AI visibility.

**Positioning:** "Google Analytics for AI traffic"

**Target:** Developers, content sites, SMBs, SEO/marketing agencies

> **Product spec:** [docs/SPEC-v3.md](docs/SPEC-v3.md)
> **Business model:** [docs/BUSINESS-MODEL-v2.md](docs/BUSINESS-MODEL-v2.md)

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
apps/
├── api/                         NestJS backend
│   └── src/
│       ├── auth/                JWT auth, user management
│       ├── ingest/              POST /collect → BullMQ → PostgreSQL
│       ├── analytics/           Query endpoints + Redis cache
│       ├── sites/               Site CRUD, API keys, plan limits
│       ├── agent-detection/     3-layer bot detection
│       ├── health/              Health check
│       ├── prisma/              Database service
│       └── redis/               Cache service
├── dashboard/                   React + Vite frontend
│   └── src/
│       ├── pages/               overview, agents, pages-stats, timeline, sites
│       ├── components/          layout, ui (stat-card, range-selector)
│       └── hooks/               use-auth, use-analytics, use-sites
└── tracker/                     JS embed snippet
    └── src/
        ├── detect.ts            Client-side agent detection
        ├── collect.ts           sendBeacon/fetch event sending
        └── index.ts             Auto-init, SPA tracking

packages/
├── types/                       @agent-analytics/types
│   └── src/
│       ├── agents.ts            16 known agents + confidence thresholds
│       ├── event.ts             AgentEvent, EnrichedEvent
│       ├── analytics.ts         AnalyticsOverview, PageStats, TimelinePoint
│       └── site.ts              PlanType, PLAN_LIMITS
└── server-sdk/                  Server-side middleware (UNCOMMITTED)
    └── src/
        ├── adapters/            express.ts, fastify.ts, next.ts
        └── core/                detector, filter, buffer, transport, config
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| API | Railway | https://api-production-feb6.up.railway.app |
| Dashboard | Vercel | https://dashboard-five-lemon-91.vercel.app |
| Tracker CDN | Cloudflare R2 | https://pub-734a26198d39470eb9a7702060cae3a1.r2.dev |

---

## Database Schema

### Current Tables

```sql
users              (id, email, password, name, created_at)
sites              (id, user_id, domain, api_key, plan, created_at)
events             (id, site_id, url, action, is_agent, agent_name,
                    confidence, source, timestamp, meta)
daily_aggregates   (id, site_id, date, total_events, agent_events,
                    unique_agents, top_agents)
monthly_usage      (id, site_id, month, event_count)
```

### Needed Schema Changes

```sql
-- New columns on events
agent_type         VARCHAR(20)   -- training | search | on_demand | unknown
referrer_domain    VARCHAR(255)  -- parsed referrer hostname
referrer_type      VARCHAR(20)   -- ai_referral | organic | direct | other

-- New tables
page_ai_scores     (id, site_id, url, date, ai_score, crawl_score,
                    citation_score, readiness_score, crawl_count,
                    referral_count, agent_count, top_agent)

ai_referrals       (id, site_id, referrer_domain, landing_url,
                    timestamp, meta)
```

---

## What's Built vs. What's Needed

### Built (reuse 100%)

| Component | Notes |
|-----------|-------|
| Turborepo monorepo | pnpm workspaces, turbo.json |
| Docker Compose | PostgreSQL (5437) + Redis (6381) |
| NestJS API | Fastify adapter, modular structure |
| POST /collect ingest | DTO validation, throttle, 202 response |
| BullMQ queue + worker | 3 attempts, exponential backoff |
| Event processor | Validate site, plan limits, dedup, insert, aggregate |
| 3-layer agent detection | UA (95), behavioral (60), pattern (40) |
| JWT authentication | Register, login, guards |
| Site management | CRUD, API keys, plan limits |
| Analytics endpoints | overview, agents, pages, timeline |
| Redis cache | 5min TTL, invalidation on write |
| React dashboard | Overview, agents, pages-stats, timeline, sites |
| JS tracker | IIFE bundle, auto-init, SPA support |
| Server SDK | Express, Fastify, Next.js (UNCOMMITTED) |
| Production deploy | Railway + Vercel + Cloudflare R2 |

### Needs Building

| Feature | Priority | Effort | Phase |
|---------|----------|--------|-------|
| Agent type classification | P0 | 1 day | 1 |
| AI referral detection in tracker | P0 | 2 days | 1 |
| Page-level AI analysis endpoint | P0 | 2 days | 1 |
| AI referral analytics endpoint | P0 | 2 days | 1 |
| Dashboard: Content Analysis page | P0 | 3 days | 1 |
| Dashboard: AI Referrals page | P0 | 2 days | 1 |
| Landing page (agentpulse.com) | P0 | 3 days | 1 |
| Stripe integration | P1 | 3 days | 1 |
| Content AI Score engine | P1 | 5 days | 2 |
| Recommendations engine | P1 | 3 days | 2 |
| Weekly email digest | P1 | 2 days | 2 |
| Alert system | P2 | 3 days | 2 |
| Laravel/PHP SDK | P2 | 5 days | 3 |
| WordPress plugin | P2 | 5 days | 3 |
| Agency/white-label features | P3 | 10 days | 3 |

### Not Building

| Feature | Reason |
|---------|--------|
| Bot blocking/control | Cloudflare does this free |
| robots.txt management | Known Agents does this well |
| E-commerce funnel / Shopify | No team expertise, market unvalidated |
| Autonomous agent tracking | Market doesn't exist yet |
| On-premise deployment | Too early |

---

## Roadmap

### Phase 1: Ship & Validate (Month 1-2)

**Goal:** 500 free installs, validate demand.

```
Sprint 1-2 (Week 1-2): Backend
├── [ ] Commit server-sdk package
├── [ ] Migration: add agent_type, referrer_domain, referrer_type to events
├── [ ] Migration: create page_ai_scores, ai_referrals tables
├── [ ] Implement agent type classification in event processor
├── [ ] Implement AI referral detection in tracker
├── [ ] New endpoint: GET /analytics/pages/ai-interest
├── [ ] New endpoint: GET /analytics/referrals
└── [ ] Align PLAN_LIMITS code with pricing

Sprint 3-4 (Week 3-4): Frontend + Launch Prep
├── [ ] Dashboard: Content Analysis page
├── [ ] Dashboard: AI Referrals page
├── [ ] Enhance Overview with AI ratio + agent type badges
├── [ ] Landing page (agentpulse.com)
├── [ ] Stripe integration (Starter $19 + Pro $49)
├── [ ] Onboarding flow for new users
└── [ ] Product Hunt / Hacker News launch prep

Sprint 5-6 (Week 5-6): Launch
├── [ ] Product Hunt launch
├── [ ] Hacker News "Show HN" post
├── [ ] Dev.to / Medium launch articles
├── [ ] Reddit posts (r/webdev, r/selfhosted, r/seo)
└── [ ] Twitter/X threads with AI traffic insights
```

**Success:** 500 free installs, 50 DAU, 10 user interviews

### Phase 2: Monetize (Month 3-4)

**Goal:** 50 paying customers, $2-3K MRR.

```
├── [ ] Content AI Score calculation engine (daily cron)
├── [ ] Recommendations engine (rule-based)
├── [ ] Weekly email digest (free tier)
├── [ ] Real-time alerts (paid tiers)
├── [ ] Export CSV/PDF (Pro tier)
├── [ ] Free tool: "AI Bot Traffic Scanner" (scan any URL)
└── [ ] Blog: weekly AI traffic insights
```

**Success:** 1,500 free users, 50 paid, $2-3K MRR, <8% churn

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

**Success:** 5,000 free users, 200 paid, $8-15K MRR

---

## Competitive Landscape

```
                    DETECT        ANALYZE       OPTIMIZE      PRICE
                   ──────────────────────────────────────────────────
Cloudflare          ✅             ❌            ❌          FREE
Known Agents        ✅             ❌            ❌          FREE/WP
Profound            ✅             ✅            ✅          $$$$
AgentPulse          ✅             ✅            ✅          $0-149
```

**Our fight:** Analytics depth + multi-platform SDKs + developer-first.
**Not our fight:** Detection (Cloudflare), blocking (Cloudflare), robots.txt (Known Agents).

---

## Pivot Signals

| Signal | When | Action |
|--------|------|--------|
| Free installs < 200 | Month 2 | Change marketing, not product |
| Paid conversion < 1.5% | Month 4 | Pivot to Content AI Score standalone |
| Monthly churn > 15% | Month 4+ | Investigate retention issues |
| MRR < $2K | Month 6 | Evaluate pivot to B2B API |
| Cloudflare adds analytics | Anytime | Differentiate on depth + cross-platform |

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
docker compose up -d                    # Start PostgreSQL + Redis
cd apps/api && npx prisma migrate dev   # Setup database
cd ../..
pnpm dev                                # Start all apps

# Dashboard: http://localhost:5173
# API: http://localhost:3002
```
