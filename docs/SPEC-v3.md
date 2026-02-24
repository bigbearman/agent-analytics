# AgentPulse — Product Specification

> **Date:** 2026-02-24
> **Status:** Active

---

## 1. Product Vision

**AgentPulse** is an AI traffic intelligence platform. It answers the question every website owner will soon ask:

> "What is AI doing with my content?"

**One-liner:** Google Analytics for AI traffic.

Google Analytics tracks humans. AgentPulse tracks AI — which bots crawl your site, which content they find valuable, which AI engines cite you, and how to optimize for AI visibility.

---

## 2. Problem

### The AI Traffic Blindspot

~5-9% of website traffic comes from AI bots (Cloudflare Radar 2025). This traffic is **invisible** in Google Analytics, Adobe Analytics, and Matomo because:

- AI crawlers don't execute JavaScript (no GA tag fires)
- AI bots don't use cookies or sessions
- No UTM parameters, no referrer headers for training bots
- GA lumps AI referrals (chatgpt.com, perplexity.ai) into generic "Referral" bucket

Website owners can't answer:
1. **Which AI bots** visit their site and how often?
2. **Which content** does AI find most valuable?
3. **How much traffic** does AI send back via citations?
4. **Is their content** optimized for AI consumption?
5. **Are trends** going up or down, and why?

### Who Has This Problem?

| Persona | Pain | Budget |
|---------|------|--------|
| **Developer / Blogger** | "Is AI crawling my docs? Am I getting cited?" | $0-19/mo |
| **Content Site / Publisher** | "AI scrapes my content — how much? Can I prove it?" | $19-49/mo |
| **SEO / Marketing Team** | "How do I optimize for AI search? What content performs?" | $49-149/mo |
| **Agency (multi-site)** | "I need AI traffic reports for all my clients" | $149+/mo |

### Market Validation

This isn't a theoretical market. Real companies are investing:

| Company | What they do | Signal |
|---------|-------------|--------|
| **Profound** | AI traffic intelligence for enterprise | $58.5M raised (Sequoia, Kleiner Perkins). Serves Ramp, MongoDB, DocuSign. |
| **Cloudflare** | Free AI Crawl Control for all users | Proves mass demand. But detection-only, no analytics. |
| **Known Agents** | WordPress plugin for bot tracking | Thousands of installs. Free tier. Basic tracking only. |
| **Vercel** | BotID built into platform | Platform-native, but Vercel-only. |
| **Otterly/Peec AI** | AI visibility monitoring ($29-499/mo) | Track brand mentions in AI. Different angle but adjacent. |

**The gap:** Profound serves Fortune 500. Cloudflare only detects. Known Agents only tracks on WordPress. Nobody provides AI traffic **analytics** for developers and SMBs across any hosting platform.

---

## 3. Solution

### Positioning vs. Competitors

```
                       DETECT       ANALYZE        OPTIMIZE
                       (who visits?) (what do they  (how to
                                     care about?)   improve?)
──────────────────────────────────────────────────────────────
Cloudflare AI Crawl     ✅           ❌             ❌
Known Agents            ✅           ❌             ❌
Profound                ✅           ✅             ✅
AgentPulse              ✅           ✅             ✅
──────────────────────────────────────────────────────────────
                        FREE         $$$$$          $$$$$
                        (commodity)  Enterprise     SMB/Dev
                                     only           ($0-149)
```

AgentPulse doesn't compete on detection (Cloudflare does that free). AgentPulse competes on **intelligence** — at a price tier nobody else serves.

### Core Value Proposition

Cloudflare tells you: *"GPTBot visited 452 times. Block? Y/N"*

AgentPulse tells you: *"GPTBot crawls your /blog/ 3x more than /docs/. ChatGPT cited your auth guide 47 times this week, driving 89 referral clicks. Your AI Score went up 12%. Here's what to optimize next."*

The difference between a **metric** and an **insight**.

---

## 4. Features — 3 Phases

### Phase 1: AI Traffic Dashboard (Month 1-2)

**Goal:** Ship free tier, get 500 installs, validate demand.

#### 4.1 AI Traffic Overview

```
┌─────────────────────────────────────────────────┐
│  AI Traffic Overview              Last 7 days ▾ │
│                                                  │
│  Total Visits    Agent Visits    AI Ratio        │
│  12,450          1,203           9.7%            │
│  +8% vs prev     +23% vs prev   ↑ trending      │
│                                                  │
│  Top AI Agents                                   │
│  GPTBot          452   ████████████  37.6%       │
│  ClaudeBot       289   ████████      24.0%       │
│  PerplexityBot   198   ██████        16.5%       │
│  Google-Extended 156   █████         13.0%       │
│  Others          108   ███            8.9%       │
│                                                  │
│  Agent Types                                     │
│  Training (GPTBot, ClaudeBot...)      67%        │
│  Search (PerplexityBot, OAI-Search)   24%        │
│  On-demand (ChatGPT-User...)           9%        │
└─────────────────────────────────────────────────┘
```

Shows: total vs AI traffic, agent breakdown, agent type classification (training/search/on-demand), trends vs previous period.

#### 4.2 Page-Level AI Analysis — Key Differentiator

```
┌─────────────────────────────────────────────────────────────┐
│  Content AI Interest                          Last 7 days ▾ │
│                                                              │
│  Page                          AI Visits  Agents  Trend     │
│  /blog/nestjs-auth-guide       340        4       ↑ +45%    │
│  /docs/api-reference           210        3       → stable  │
│  /blog/prisma-vs-typeorm       178        4       ↑ +12%    │
│  /pricing                       67        2       ↓ -8%     │
│  /blog/docker-tutorial          54        3       ↑ NEW     │
│                                                              │
│  Most crawled by:                                            │
│  GPTBot → /blog/* (68%)    ClaudeBot → /docs/* (54%)        │
└─────────────────────────────────────────────────────────────┘
```

Shows: which pages AI crawls most, per-page agent breakdown, crawl frequency trends. **No competitor offers this at SMB/dev tier.**

#### 4.3 AI Referral Tracking

```
┌─────────────────────────────────────────────────────────────┐
│  AI Referral Traffic                          Last 7 days ▾ │
│                                                              │
│  Source                   Visits  Pages    Top Landing       │
│  chatgpt.com             89      12       /blog/nestjs-auth  │
│  perplexity.ai           45       8       /docs/api-ref      │
│  you.com                 12       3       /blog/prisma        │
│  copilot.microsoft.com    8       2       /pricing            │
│                                                              │
│  Total AI referrals: 154 (+34% vs last week)                │
│  AI referral share of total traffic: 1.2%                    │
└─────────────────────────────────────────────────────────────┘
```

Shows: traffic arriving FROM AI platforms (chatgpt.com, perplexity.ai, etc.), landing pages, trends. Closes the loop: AI crawls → AI cites → AI sends traffic.

AI referral domains tracked:
```typescript
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

#### Phase 1 Dashboard

```
Sidebar:
├── Overview          AI traffic overview with ratio + trends
├── AI Agents         Agent breakdown with type badges
├── Content Analysis  Page-level AI interest (NEW)
├── AI Referrals      Referral tracking from AI platforms (NEW)
├── Timeline          Time series with per-agent-type filter
└── Sites             Site management
```

---

### Phase 2: AI Content Intelligence (Month 3-4)

**Goal:** Launch paid tiers, 50 paying customers, $2-3K MRR.

#### 4.4 Content AI Score (0-100)

Per-page scoring measuring how "AI-friendly" content is:

```
Score Components:
├── Crawl Signal (40 points)
│   ├── Crawl frequency (how often bots visit)           0-15
│   ├── Multi-agent interest (# different bots)          0-10
│   ├── Crawl trend (growing vs declining)               0-10
│   └── Crawl depth (bots visit related pages?)          0-5
│
├── Citation Signal (35 points)
│   ├── AI referral volume                               0-15
│   ├── Referral diversity (# AI sources citing)         0-10
│   └── Citation trend                                   0-10
│
└── Readiness Signal (25 points)
    ├── Structured data present (JSON-LD, Schema.org)    0-10
    ├── Content quality signals (length, headers, etc.)  0-8
    ├── robots.txt/llms.txt configured                   0-4
    └── Page speed (affects crawl budget)                0-3
```

```
┌──────────────────────────────────────────────────────────┐
│  Content AI Scores                                        │
│                                                           │
│  Page                          Score  Crawl  Cite  Ready │
│  /blog/nestjs-auth-guide       87     38/40  32/35 17/25 │
│  /docs/api-reference           72     30/40  22/35 20/25 │
│  /blog/prisma-vs-typeorm       65     28/40  18/35 19/25 │
│  /pricing                      31     12/40   8/35 11/25 │
│                                                           │
│  Quick wins:                                              │
│  - Add FAQ schema to /pricing (+8 readiness points)      │
│  - Update /blog/prisma-vs-typeorm — crawl high but       │
│    citation low, content may be outdated                  │
└──────────────────────────────────────────────────────────┘
```

#### 4.5 AI Optimization Recommendations

Rule-based engine suggesting improvements:

```typescript
const RULES = [
  { condition: 'crawl_high AND citation_low',
    recommendation: 'AI reads this but doesn\'t cite it. Content may be outdated or lack unique insights.',
    impact: 'high' },
  { condition: 'no_structured_data',
    recommendation: 'Add JSON-LD structured data (Article, FAQ, HowTo schema).',
    impact: 'medium' },
  { condition: 'no_llms_txt',
    recommendation: 'Create llms.txt file to guide AI crawlers to best content.',
    impact: 'medium' },
  { condition: 'crawl_declining',
    recommendation: 'AI crawl frequency dropping. Content may need refresh.',
    impact: 'high' },
  { condition: 'single_agent_only',
    recommendation: 'Only one AI engine crawls this. Improve cross-platform discoverability.',
    impact: 'low' },
];
```

#### 4.6 Alerts & Reports

- **Free:** Weekly AI traffic email digest
- **Starter:** Email alerts (new bot detected, crawl spike)
- **Pro:** Real-time alerts, exportable PDF/CSV reports
- **Business:** White-label reports, scheduled delivery

---

### Phase 3: Platform & Scale (Month 5-8)

**Goal:** Multi-platform SDKs, agency features, $10K MRR.

#### 4.7 Multi-Platform SDKs

```
P0 (done):   JS tracker snippet (client-side, any website)
P0 (done):   Express middleware, Fastify plugin, Next.js middleware
P1 (month 5): Laravel/PHP middleware
P1 (month 5): WordPress plugin
P2 (month 6): Nginx log parser (self-hosted servers)
P2 (month 6): Python/Django middleware
P3 (month 7): Cloudflare Workers integration
P3 (month 7): Vercel edge middleware
```

Why this matters vs competitors:
- **Cloudflare AI Crawl Control** — only works on Cloudflare
- **Known Agents** — only works on WordPress
- **Vercel BotID** — only works on Vercel
- **AgentPulse** — works on **anything**: self-hosted VPS, AWS, DigitalOcean, shared hosting, any framework

#### 4.8 Competitive AI Visibility (Lightweight)

Check how your content ranks across AI engines. Lightweight implementation:
- Query AI engines with relevant prompts
- Track if your site/brand is mentioned
- Compare vs competitors over time

Note: Overlaps with Otterly/Peec AI. Implement as add-on feature, not core product.

#### 4.9 Agency / Multi-Site Management

- Unified dashboard across client sites
- Per-client white-label reports
- Team member access controls
- Bulk site management

---

## 5. Technical Architecture

### System Overview

```
                    ┌──────────────┐
                    │   Website    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐    ┌──────────▼──────────┐
     │   JS Tracker    │    │    Server SDK        │
     │  (client-side)  │    │ (Express/Fastify/    │
     │  AI referrals   │    │  Next.js middleware)  │
     │  Behavioral     │    │  UA detection         │
     └────────┬────────┘    └──────────┬──────────┘
              │                         │
              └────────────┬────────────┘
                           │
                  POST /collect (202)
                           │
              ┌────────────▼────────────┐
              │     NestJS API          │
              │  ThrottlerGuard         │
              │  DTO validation         │
              │  Agent type classify    │
              │  AI referral detect     │
              └────────────┬────────────┘
                           │
                    BullMQ Queue
                           │
              ┌────────────▼────────────┐
              │     Event Processor     │
              │  Validate site + plan   │
              │  Dedup (Redis 1s TTL)   │
              │  Insert PostgreSQL      │
              │  Update aggregates      │
              │  Invalidate cache       │
              └─────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     Analytics API       │
              │  Redis cache (5min)     │
              │  SQL aggregation        │
              │  Paginated responses    │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │     React Dashboard     │
              │  Overview, Agents,      │
              │  Content, Referrals,    │
              │  Timeline, Sites        │
              └─────────────────────────┘
```

### Codebase Structure

```
apps/
├── api/                    NestJS + Fastify backend
│   └── src/
│       ├── auth/           JWT authentication (register, login, guards)
│       ├── ingest/         POST /collect → queue (DTO, controller, processor)
│       ├── analytics/      Query endpoints + Redis cache
│       ├── sites/          Site CRUD, API keys, plan enforcement
│       ├── agent-detection/ 3-layer detection service
│       ├── prisma/         Database service wrapper
│       ├── redis/          Cache service
│       └── health/         Health check
├── dashboard/              React + Vite frontend
│   └── src/
│       ├── pages/          overview, agents, pages-stats, timeline, sites
│       ├── components/     layout, ui (stat-card, range-selector)
│       └── hooks/          use-auth, use-analytics, use-sites
└── tracker/                Vanilla TS embed snippet (IIFE bundle)
    └── src/
        ├── detect.ts       Client-side agent detection
        ├── collect.ts      sendBeacon/fetch event sending
        └── index.ts        Auto-init, SPA tracking

packages/
├── types/                  @agent-analytics/types
│   └── src/
│       ├── agents.ts       16 known agents + confidence thresholds
│       ├── event.ts        AgentEvent, EnrichedEvent, EventAction
│       ├── analytics.ts    AnalyticsOverview, PageStats, TimelinePoint
│       └── site.ts         PlanType, PLAN_LIMITS
└── server-sdk/             Server-side middleware
    └── src/
        ├── adapters/       express.ts, fastify.ts, next.ts
        └── core/           detector, filter, buffer, transport, config
```

### Database Schema

```sql
-- Core tables (existing)
users              (id, email, password, name, created_at)
sites              (id, user_id, domain, api_key, plan, created_at)
events             (id, site_id, url, action, is_agent, agent_name,
                    confidence, source, timestamp, meta)
daily_aggregates   (id, site_id, date, total_events, agent_events,
                    unique_agents, top_agents)
monthly_usage      (id, site_id, month, event_count)

-- New columns on events
agent_type         VARCHAR(20)   -- training | search | on_demand | unknown
referrer_domain    VARCHAR(255)  -- parsed referrer hostname
referrer_type      VARCHAR(20)   -- ai_referral | organic | direct | other

-- New tables
page_ai_scores     (id, site_id, url, date, ai_score, crawl_score,
                    citation_score, readiness_score, crawl_count,
                    referral_count, agent_count, top_agent)
                    UNIQUE(site_id, url, date)

ai_referrals       (id, site_id, referrer_domain, landing_url,
                    timestamp, meta)
```

### Agent Detection — 3 Layers

```
Layer 1: Server UA Match     → confidence = 95 (most reliable)
  Match against 16 known bot user-agent patterns

Layer 2: Behavioral Signals  → confidence = 60
  No mouse movement, no scroll, no focus/blur within 5 seconds

Layer 3: Request Patterns    → confidence = 40
  Missing Referer (+15), non-HTML Accept header (+15),
  wildcard Accept (+10)

Combined: confidence = max(layers) + 5 per extra layer
Threshold: is_agent = true when confidence >= 50
```

### Agent Type Classification

```typescript
type AgentType = 'training' | 'search' | 'on_demand' | 'unknown';

// Training bots — crawl to build/retrain LLMs (~80% of AI traffic)
GPTBot, ClaudeBot, Google-Extended, ByteSpider,
Meta-ExternalAgent, Amazonbot, Applebot

// Search bots — build search index for AI search engines
OAI-SearchBot, PerplexityBot, YouBot, DuckAssistant,
GoogleVertexBot, GeminiBot, Gemini-Deep-Research

// On-demand bots — real-time fetch when user asks a question
ChatGPT-User, Claude-User, Perplexity-User
```

### API Endpoints

```
Existing:
POST /collect                      Public ingest (always 202)
GET  /analytics/overview           Traffic overview
GET  /analytics/agents             Agent breakdown
GET  /analytics/pages              Page statistics
GET  /analytics/timeline           Time series

New (Phase 1):
GET  /analytics/pages/ai-interest  Page-level AI crawl breakdown
GET  /analytics/referrals          AI referral traffic sources
GET  /analytics/referrals/pages    Landing pages from AI referrals

New (Phase 2):
GET  /analytics/content-score      Content AI Score per page
GET  /analytics/recommendations    Optimization recommendations
POST /scan/readiness               On-demand page readiness scan
```

---

## 6. Plan & Pricing

| Feature | Free | Starter $19 | Pro $49 | Business $149 |
|---------|------|-------------|---------|---------------|
| **Sites** | 1 | 3 | 10 | Unlimited |
| **Events/month** | 10K | 100K | 500K | 5M |
| **Data retention** | 7 days | 30 days | 90 days | 1 year |
| **Rate limit** | 100/min | 500/min | 2,000/min | 10,000/min |
| AI traffic overview | ✅ | ✅ | ✅ | ✅ |
| Agent breakdown + types | ✅ | ✅ | ✅ | ✅ |
| AI referral tracking | Basic | Full | Full | Full |
| Page-level AI analysis | Top 10 | Top 50 | Unlimited | Unlimited |
| Content AI Score | - | Top 20 | Unlimited | Unlimited |
| Recommendations | - | Basic | Advanced | Advanced |
| Alerts | - | Weekly email | Real-time | Real-time |
| Export (CSV/PDF) | - | - | ✅ | ✅ |
| API access | - | - | ✅ | ✅ |
| White-label reports | - | - | - | ✅ |
| Multi-user team | - | - | 3 users | Unlimited |

---

## 7. Roadmap — 8 Months

### Sprint 1-2 (Week 1-2): Foundation

```
[ ] Commit server-sdk package
[ ] Migration: add agent_type, referrer_domain, referrer_type to events
[ ] Migration: create page_ai_scores, ai_referrals tables
[ ] Implement agent type classification in event processor
[ ] Implement AI referral detection in tracker
[ ] New endpoint: GET /analytics/pages/ai-interest
[ ] New endpoint: GET /analytics/referrals
[ ] Align PLAN_LIMITS code with pricing table above
```

### Sprint 3-4 (Week 3-4): Dashboard + Launch Prep

```
[ ] Dashboard: Content Analysis page (page-level AI interest)
[ ] Dashboard: AI Referrals page
[ ] Enhance Overview with AI ratio, agent type badges
[ ] Add agent type filter to Timeline
[ ] Landing page (agentpulse.com)
[ ] Stripe integration (Starter + Pro)
[ ] Onboarding flow for new users
```

### Sprint 5-6 (Week 5-6): Launch

```
[ ] Product Hunt launch
[ ] Hacker News "Show HN" post
[ ] Dev.to / Medium launch articles
[ ] Reddit posts (r/webdev, r/selfhosted, r/seo)
[ ] Twitter/X threads with AI traffic insights
```

### Sprint 7-8 (Week 7-8): Intelligence Layer

```
[ ] Content AI Score calculation engine (daily cron)
[ ] Recommendations engine (rule-based)
[ ] Weekly email digest (free tier)
[ ] Real-time alert system (paid tiers)
[ ] Laravel/PHP SDK
```

### Month 3-4: Monetization

```
[ ] CSV/PDF export (Pro tier)
[ ] API access documentation + key management
[ ] Free tool: "AI Bot Traffic Scanner" (scan any URL)
[ ] Blog: weekly AI traffic insights
```

### Month 5-8: Platform Expansion

```
[ ] WordPress plugin
[ ] Nginx log parser
[ ] Python/Django middleware
[ ] Agency multi-site management
[ ] White-label reports
[ ] Team member access controls
```

---

## 8. Success Metrics

| Phase | Timeframe | Key Metric | Target |
|-------|-----------|-----------|--------|
| 1 | Month 1-2 | Free installs | 500 |
| 1 | Month 1-2 | Dashboard DAU | 50 |
| 1 | Month 1-2 | npm downloads (server-sdk) | 200 |
| 2 | Month 3-4 | Paid customers | 50 |
| 2 | Month 3-4 | MRR | $2,000-3,000 |
| 2 | Month 3-4 | Monthly churn | <8% |
| 3 | Month 5-8 | Total free users | 5,000 |
| 3 | Month 5-8 | Paid customers | 200 |
| 3 | Month 5-8 | MRR | $8,000-15,000 |

### Pivot Signals

| Signal | When | Action |
|--------|------|--------|
| Free installs < 200 | Month 2 | Change marketing, not product |
| Paid conversion < 1.5% | Month 4 | Pivot to Content AI Score standalone |
| Monthly churn > 15% | Month 4+ | Product isn't retaining — investigate |
| MRR < $2K | Month 6 | Evaluate pivot to B2B API or AEO tool |

---

## 9. What We're NOT Building

| Feature | Reason |
|---------|--------|
| Bot blocking/control | Cloudflare does this free. Not our market. |
| robots.txt management | Known Agents does this well. Not differentiated. |
| E-commerce funnel tracking | Requires Shopify expertise we don't have. Market unvalidated. |
| Autonomous agent tracking | Market doesn't exist yet. Too early to build. |
| On-premise deployment | Too early. Focus on hosted SaaS. |
| Content licensing marketplace | Complex, requires legal expertise. |

---

## 10. Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| NestJS + Fastify | Not Express | Ingest API needs high throughput |
| BullMQ queue | Not direct DB write | Don't block ingest response |
| PostgreSQL | Not TimescaleDB | Good enough at current scale, partitioning handles growth |
| Content AI Score computed daily | Cron, not real-time | Avoids computation overhead per event |
| AI referral detection client-side | Tracker | `document.referrer` available in browser |
| Agent type via lookup table | Static map | Fast, deterministic, easy to update |
| Prisma ORM | Not raw SQL everywhere | Type-safe by default, raw SQL only for analytics aggregation |
