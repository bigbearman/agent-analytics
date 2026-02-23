# AgentPulse — Project Context

> Pivoted from "Agent Access Analytics" (generic bot tracking) to "AgentPulse"
> (AI commerce analytics) based on market research — Feb 2026.

## Overview

**AgentPulse** is the analytics platform for AI agent commerce. E-commerce store owners
install our Shopify app / WooCommerce plugin to track how AI shopping agents (ChatGPT Shopping,
Google AI Mode, Perplexity Buy...) discover, evaluate, and purchase from their stores — something
Google Analytics can't do.

**Vision:** Google Analytics for the AI Shopping era.

> Product spec: [docs/SPEC-v2.md](docs/SPEC-v2.md)
> Business model: [docs/BUSINESS-MODEL.md](docs/BUSINESS-MODEL.md)
> Previous spec (v1 — archived): [docs/SPEC.md](docs/SPEC.md)

## Problem
- AI shopping agents (ChatGPT, Google AI Mode, Perplexity) drive growing e-commerce traffic
- Google Analytics is blind to AI agents — no cookies, no sessions, no JS
- Merchants get orders from AI agents but have zero visibility into the funnel
- Attribution models break: no last-click, no UTM, no referrer
- Can't optimize what you can't measure — agent commerce converts 86% worse than affiliate
- McKinsey estimates $3-5 trillion in agent-mediated commerce by 2030

## Solution
- Server-side + client-side tracking for AI shopping agent detection
- Full agent commerce funnel visualization (discovery → view → cart → purchase)
- Product readiness scoring (how well can AI agents understand your products)
- Agent attribution engine (revenue by agent source)
- Competitive intelligence (monitor how agents see your competitors)
- AI-powered optimization suggestions
- Shopify app + WooCommerce plugin + generic middleware

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
POST /collect                  # Receive event (extended with commerce fields)
```

### Analytics (authenticated)
```
GET /analytics/agent-overview  # Agent traffic overview + revenue
GET /analytics/agent-funnel    # Commerce funnel per agent source
GET /analytics/agent-attribution # Revenue attribution by agent
GET /analytics/agent-products  # Per-product agent analytics
GET /analytics/timeline        # Time series data
```

### Readiness (authenticated)
```
POST /readiness/scan           # Trigger product catalog scan
GET  /readiness/score          # Store + per-product readiness scores
POST /readiness/fix            # Apply auto-fixes
```

### Competitive Intelligence (authenticated)
```
POST /competitors/track        # Set up category + competitor tracking
GET  /competitors/report       # Competitive positioning report
```

### Stores (authenticated)
```
GET    /stores                 # List stores
POST   /stores                 # Create new store
GET    /stores/:id/snippet     # Get tracking snippet
POST   /stores/:id/rotate-key  # Rotate API key
```

---

## Business Model

| Plan | Price | Stores | Products | Key Features |
|------|-------|--------|----------|--------------|
| Free | $0 | 1 | 100 | Agent dashboard, basic readiness, 7d retention |
| Growth | $49/mo | 3 | 1,000 | Full funnel, attribution, optimizer, 90d retention |
| Pro | $149/mo | 10 | 10,000 | Competitive intel, auto-fix, API, 1yr retention |
| Agency | $399/mo | 50 | Unlimited | White-label, client reports, team seats |
| Enterprise | Custom | Unlimited | Unlimited | Custom integrations, SLA, dedicated CSM |

> Full business model: [docs/BUSINESS-MODEL.md](docs/BUSINESS-MODEL.md)

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

# Shopify
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

# App
APP_URL=https://agentpulse.io
TRACKER_URL=https://cdn.agentpulse.io/tracker.js
NODE_ENV=development
```

---

## Non-goals (Current)
- Mobile SDK
- Agentic Commerce control/blocking (Cloudflare's territory)
- Content licensing/monetization (TollBit's territory)
- General SEO/AEO tools (Semrush's territory)
- Custom store builder (platform territory)

---

# Roadmap & Progress

## Existing Foundation (from v1 — reusable)

### Infrastructure ✅
- [x] Turborepo monorepo setup
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Deploy API to Railway
- [x] Deploy Dashboard to Vercel
- [x] Deploy Tracker to Cloudflare R2

### Ingest Pipeline ✅
- [x] POST /collect endpoint
- [x] ThrottlerGuard rate limiting
- [x] DTO validation with class-validator
- [x] Server-side UA detection (Layer 1)
- [x] BullMQ queue for async processing
- [x] Event processor worker
- [x] Site validation + plan limit checks
- [x] Redis deduplication (1s TTL)
- [x] PostgreSQL event insertion

### Auth & Sites ✅
- [x] JWT authentication
- [x] User registration and login
- [x] Site CRUD + API keys
- [x] Embed snippet display

### Dashboard Shell ✅
- [x] Login / Register pages
- [x] Sites list page
- [x] Overview dashboard (stats cards + chart)

### Agent Detection ✅ (partial)
- [x] Layer 1: Server UA match (95 confidence)
- [x] Layer 2: Behavioral signals (60 confidence)
- [x] KNOWN_AGENTS constant
- [ ] Layer 3: Request patterns (40 confidence)

---

## Phase 1: Pivot to AgentPulse (Month 1-3)

### 1.1 Extend Data Model for Commerce
- [ ] Add commerce fields to events table (event_type, product_id, product_price, order_id, order_value, agent_source)
- [ ] Create `agent_sessions` partitioned table
- [ ] Create `daily_agent_stats` aggregate table
- [ ] Create `product_readiness` table
- [ ] Run migrations with CONCURRENTLY indexes
- [ ] Update Prisma schema

### 1.2 Extend Agent Detection for Commerce
- [ ] Add Layer 4: Commerce signals (referrer from chatgpt.com, perplexity.ai, etc.)
- [ ] Add shopping agent UAs (ChatGPT-User shopping, Google AI Mode)
- [ ] Add agent_source classification (chatgpt_shopping, google_ai_mode, perplexity_buy, etc.)
- [ ] Update event DTO with commerce fields
- [ ] Server-side session stitching for agents

### 1.3 Agent Traffic Dashboard (extend existing)
- [ ] Agent overview endpoint (GET /analytics/agent-overview)
- [ ] Agent traffic by source (ChatGPT vs Google AI Mode vs Perplexity)
- [ ] Agent revenue tracking
- [ ] Agent vs Human traffic split
- [ ] Dashboard: agent source breakdown table
- [ ] Dashboard: agent traffic trend chart
- [ ] Dashboard: revenue by agent source cards
- [ ] Date range picker (1d / 7d / 30d)

### 1.4 Shopify App (Primary Distribution)
- [ ] Shopify app scaffold (OAuth, App Bridge)
- [ ] Product catalog sync via Products API
- [ ] Order webhook integration (attribution)
- [ ] Auto-inject server-side tracking
- [ ] Embedded dashboard in Shopify Admin
- [ ] Shopify App Store listing
- [ ] App Store SEO optimization

### 1.5 Free Scan Tool (Acquisition)
- [ ] Public endpoint: POST /scan?url=xxx
- [ ] Crawl store URL for structured data
- [ ] Detect AI agent traffic from public signals
- [ ] Generate instant readiness report
- [ ] Landing page: agentpulse.io/scan
- [ ] Share-friendly results page (OG tags)

---

## Phase 2: Full Analytics (Month 4-6)

### 2.1 Agent Commerce Funnel
- [ ] Funnel endpoint (GET /analytics/agent-funnel)
- [ ] Stage tracking: discovery → view → cart → checkout → purchase
- [ ] Per-agent-source funnel breakdown
- [ ] Drop-off analysis with insights
- [ ] Dashboard: funnel visualization component
- [ ] Dashboard: drop-off insights panel

### 2.2 Product Readiness Scoring
- [ ] Product catalog scanner (BullMQ job)
- [ ] 25-point scoring engine (schema, content, technical)
- [ ] Per-product score calculation
- [ ] Issue detection with severity levels
- [ ] Fix suggestions generator
- [ ] Readiness API endpoints
- [ ] Dashboard: store readiness overview
- [ ] Dashboard: per-product score table
- [ ] Dashboard: issue breakdown with fix actions

### 2.3 Agent Attribution Engine
- [ ] Server-side attribution logic
- [ ] Multi-touch attribution model
- [ ] Order ↔ agent session matching
- [ ] Revenue by agent source calculation
- [ ] Revenue by product × agent source
- [ ] Attribution API endpoints
- [ ] Dashboard: attribution report page
- [ ] Dashboard: revenue breakdown charts

### 2.4 Alerts & Notifications
- [ ] New agent detected alert
- [ ] Agent traffic spike alert (>200% baseline)
- [ ] Readiness score drop alert
- [ ] Email notification channel
- [ ] Webhook notification channel
- [ ] Weekly summary email

### 2.5 WooCommerce Plugin
- [ ] WordPress plugin scaffold
- [ ] Server-side middleware injection
- [ ] WooCommerce order hook integration
- [ ] Product sync via REST API
- [ ] Dashboard via iframe

---

## Phase 3: Intelligence (Month 7-10)

### 3.1 Competitive Intelligence
- [ ] Category + competitor tracking setup
- [ ] Periodic AI platform querying (ChatGPT, Perplexity, Google AI)
- [ ] Brand mention detection and ranking
- [ ] Competitor trend tracking
- [ ] Competitive report API endpoints
- [ ] Dashboard: competitive positioning page
- [ ] Dashboard: trend alerts

### 3.2 AI-Powered Optimization
- [ ] Product description rewrite suggestions (LLM-powered)
- [ ] Auto-generate missing JSON-LD structured data
- [ ] Schema validation and auto-fix
- [ ] Optimization impact estimation
- [ ] A/B insights from aggregate data
- [ ] Dashboard: optimization suggestions page
- [ ] Dashboard: auto-fix actions with preview

### 3.3 Advanced Analytics
- [ ] Agent behavior pattern analysis
- [ ] Category-level benchmarks (cross-store aggregates)
- [ ] Agent algorithm change detection
- [ ] Predictive analytics (which products agents will favor)
- [ ] Custom date range and segment filters

### 3.4 Billing & Monetization
- [ ] Stripe integration for Growth + Pro plans
- [ ] Shopify billing API integration
- [ ] Usage tracking per plan limits
- [ ] Upgrade prompts in dashboard
- [ ] Annual discount handling

---

## Phase 4: Scale (Month 11-14)

### 4.1 Platform Expansion
- [ ] BigCommerce integration
- [ ] Magento integration
- [ ] Next.js / Vercel middleware package
- [ ] Cloudflare Workers middleware
- [ ] Generic REST API for custom stores
- [ ] NPM package: @agentpulse/tracker

### 4.2 Agency & Enterprise
- [ ] Multi-store management dashboard
- [ ] White-label report generation
- [ ] Team seats with role-based access
- [ ] Custom branding options
- [ ] Enterprise SSO (SAML)
- [ ] Dedicated account management

### 4.3 Advanced Attribution
- [ ] Cross-device agent journey tracking
- [ ] Agent-assisted attribution (agent discovered, human purchased)
- [ ] Incrementality measurement
- [ ] Attribution model comparison tool
- [ ] Export to ad platforms (Meta, Google Ads)

---

## Backlog (Future)

- [ ] A/B testing framework for agent optimization
- [ ] Real-time agent activity feed
- [ ] Slack / Discord bot integration
- [ ] Zapier / Make webhook integrations
- [ ] GraphQL API option
- [ ] Public API for third-party integrations
- [ ] Mobile app for store owners
- [ ] AI agent chatbot for store analytics Q&A
- [ ] Content marketplace features (if market demands)
- [ ] Agent commerce benchmarks report (annual publication)
