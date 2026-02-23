# Product Spec v2 — AgentPulse

> **"Google Analytics for the AI Shopping era"**
>
> See how AI agents shop your store. Track, attribute, and optimize
> every AI-driven transaction — from ChatGPT Shopping to Google AI Mode.

---

## 1. Problem Statement

### The Attribution Black Hole

Google Analytics was built for humans: cookies, sessions, pageviews, click paths.
AI shopping agents don't browse. They make API calls, query MCP servers, and execute
purchases — all invisible to traditional analytics.

**What merchants see today:**

```
Traditional funnel (GA):
  Ad click → Landing page → Browse → Add to cart → Checkout → Purchase
  ✓ Full visibility at every step

Agent commerce funnel:
  User asks ChatGPT "best running shoes under $100"
  → Agent queries 20 stores via MCP/ACP/UCP
  → Agent compares products
  → Agent recommends 3 options
  → User picks one
  → Agent completes checkout

  Merchant sees: ??? → Purchase
  Everything before checkout is invisible.
```

**The result:**
- Merchants get revenue but zero behavioral intelligence
- Can't optimize what they can't measure
- Don't know WHY an agent chose (or skipped) their products
- Agent commerce converts 86% worse than affiliate traffic — but no one knows why
- Attribution models break: no last-click, no UTM, no referrer
- McKinsey estimates 18-24 months before measurement frameworks mature

### Who feels this pain?

Every e-commerce store that receives traffic from AI shopping agents:
- Shopify stores (4.6M+)
- WooCommerce stores (6.5M+)
- BigCommerce, Magento, custom stores
- DTC brands spending on ads but can't track AI-driven conversions
- Agencies managing multiple stores

---

## 2. Solution: AgentPulse

The analytics platform purpose-built for AI agent commerce.

### One-liner

> Track how AI shopping agents discover, evaluate, and buy from your store.

### North Star Metric

**Agent-Attributed Revenue (AAR)** — total revenue that merchants can confidently
attribute to AI agent interactions through AgentPulse.

### What makes AgentPulse different from GA / Shopify Analytics?

| Dimension | Google Analytics | Shopify Analytics | AgentPulse |
|-----------|-----------------|-------------------|------------|
| Tracks humans | Yes | Yes | Yes |
| Tracks AI agents | No | Basic (source only) | Full funnel |
| Agent identification | No | Partial | 20+ agents |
| Server-side tracking | Limited | No | Native |
| Product-level agent data | No | No | Yes |
| Agent attribution | No | Basic | Multi-touch |
| Competitive intel | No | No | Yes |
| Optimization suggestions | No | No | AI-powered |

---

## 3. Core Features

### 3.1 Agent Traffic Dashboard

The command center for understanding AI agent activity on your store.

```
┌─────────────────────────────────────────────────────────────┐
│  AgentPulse Dashboard                            Last 7d ▼  │
├─────────────┬─────────────┬──────────────┬─────────────────┤
│ Total Visits│ Agent Visits│ Agent Revenue│ Agent Conv Rate  │
│   12,450    │    3,210    │   $8,420     │     2.1%        │
│             │   25.8% ▲   │   18.5% ▲   │    +0.4% ▲      │
├─────────────┴─────────────┴──────────────┴─────────────────┤
│                                                             │
│  Agent Traffic by Source                                    │
│  ┌──────────────────┬───────┬──────────┬─────────────────┐ │
│  │ Agent            │ Visits│ Revenue  │ Conv Rate       │ │
│  ├──────────────────┼───────┼──────────┼─────────────────┤ │
│  │ ChatGPT Shopping │ 1,420 │ $4,210   │ 2.9%            │ │
│  │ Google AI Mode   │   890 │ $2,180   │ 2.4%            │ │
│  │ Perplexity Buy   │   540 │ $1,230   │ 2.2%            │ │
│  │ Microsoft Copilot│   210 │   $520   │ 1.8%            │ │
│  │ Amazon Buy For Me│   150 │   $280   │ 1.2%            │ │
│  └──────────────────┴───────┴──────────┴─────────────────┘ │
│                                                             │
│  Agent vs Human Traffic (7 days)                            │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│  25.8% Agent                    74.2% Human                 │
│                                                             │
│  Timeline ─────────────────────────────────────────         │
│      ╱╲    ╱╲                                               │
│  ───╱──╲──╱──╲───╱╲────────────────────────────────         │
│           ╲╱    ╱  ╲                                        │
│                ╱    ╲───                                    │
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun                          │
└─────────────────────────────────────────────────────────────┘
```

**Key metrics:**
- Total agent visits vs human visits
- Agent visits by source (ChatGPT, Google AI Mode, Perplexity, Copilot, etc.)
- Agent revenue and conversion rate
- Trend over time (daily, weekly, monthly)
- Agent traffic growth rate

### 3.2 Agent Commerce Funnel

Visualize the full agent shopping journey — the part that's invisible today.

```
Agent Commerce Funnel (ChatGPT Shopping, Last 30d)

  Product Discovery     ████████████████████████████  1,420 queries
         │ 62% ▼
  Product View          █████████████████             880 products viewed
         │ 34% ▼
  Add to Cart           ██████                        298 added
         │ 48% ▼
  Checkout Initiated    ███                           142 checkouts
         │ 72% ▼
  Purchase Complete     ██                            102 purchases

  Drop-off insights:
  ⚠ 38% of discovered products are never viewed → missing schema/attributes
  ⚠ 66% view-to-cart drop → price or availability issues
  ⚠ 28% checkout abandonment → payment/shipping friction
```

**Funnel analysis per agent:**
- Each AI shopping agent has different behavior patterns
- ChatGPT Shopping may add more to cart, Perplexity may browse more
- Identify where YOUR store loses agent-driven customers

### 3.3 Product Agent-Readiness Score

Per-product scoring: how well can AI agents understand and recommend each product?

```
Product Agent-Readiness Report

  Overall Store Score: 64/100
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Top Issues:
  🔴 142 products missing price in structured data
  🔴 89 products have descriptions under 50 words
  🟡 234 products missing size/color attributes
  🟡 67 products have no review data in schema
  🟢 All products have valid JSON-LD

  Per-Product Detail:
  ┌────────────────────────┬───────┬────────────────────────┐
  │ Product                │ Score │ Issues                 │
  ├────────────────────────┼───────┼────────────────────────┤
  │ Nike Air Max 90        │ 92    │ ✓ All checks passed    │
  │ Adidas Ultraboost      │ 71    │ Missing: size schema   │
  │ Custom Running Shoes   │ 34    │ No schema, short desc  │
  └────────────────────────┴───────┴────────────────────────┘

  Fix Suggestions:
  → "Add Product schema with price, availability, and size for 142 products"
  → "Expand descriptions to 100+ words with use-case language for 89 products"
  → "Add aggregateRating to schema for 67 products with reviews"
```

**Scoring factors (25 checks):**
- Structured data completeness (JSON-LD, Schema.org)
- Product title quality (descriptive, keyword-rich)
- Description length and quality (use-case language, not marketing fluff)
- Price and availability in schema
- Product attributes (size, color, material, etc.)
- Image alt text quality
- Review/rating data in schema
- MCP/API accessibility
- Page load performance
- robots.txt / llms.txt configuration

### 3.4 Agent Attribution Engine

Server-side attribution that works without cookies or JavaScript.

```
Attribution Model:

  Agent Request Identification:
  ├─ User-Agent header matching (known agent UAs)
  ├─ MCP server request tracking
  ├─ ACP/UCP protocol request tracking
  ├─ Referrer analysis (chatgpt.com, perplexity.ai, etc.)
  ├─ IP fingerprinting (known agent IP ranges)
  └─ Request pattern analysis (API-like behavior)

  Attribution Chain:
  Agent Discovery → Product Query → Cart Action → Checkout → Purchase
       │                │               │            │          │
       └────────────────┴───────────────┴────────────┴──────────┘
                     Server-side event stitching
                     (no cookies needed)
```

**Attribution reports:**
- Revenue by agent source
- Revenue by product × agent source
- First-touch vs last-touch agent attribution
- Agent-assisted conversions (agent discovered, human purchased)
- ROAS for agent commerce channel

### 3.5 Competitive Intelligence

Monitor how AI agents see your competitors.

```
Competitive Report: "running shoes" category

  When users ask ChatGPT "best running shoes under $100":

  ┌──────┬────────────────────┬────────────┬──────────┐
  │ Rank │ Brand              │ Times Cited│ Trend    │
  ├──────┼────────────────────┼────────────┼──────────┤
  │ 1    │ Nike               │ 847        │ ━━ Flat  │
  │ 2    │ Adidas             │ 612        │ ▲ +12%   │
  │ 3    │ New Balance        │ 398        │ ▲ +34%   │
  │ 4    │ → YOUR STORE       │ 156        │ ▲ +8%   │
  │ 5    │ Asics              │ 142        │ ▼ -5%   │
  └──────┴────────────────────┴────────────┴──────────┘

  Insights:
  ⚡ New Balance gaining fast — they added detailed fit guides
  ⚠ Your products appear 4th — missing sustainability attributes
  💡 Top-ranked products have 150+ word descriptions with use-cases
```

**Monitoring:**
- Track brand presence across ChatGPT, Perplexity, Google AI Mode
- Category-level competitive landscape
- Product-level head-to-head comparison
- Trend alerts: competitor gaining/losing agent visibility

### 3.6 Optimization Engine

AI-powered suggestions to improve agent discoverability and conversion.

```
Optimization Suggestions (This Week)

  HIGH IMPACT:
  ┌─────────────────────────────────────────────────────────┐
  │ 🔴 Add price schema to 142 products                    │
  │    Est. impact: +23% agent discoverability              │
  │    [Auto-fix] [Preview] [Dismiss]                       │
  ├─────────────────────────────────────────────────────────┤
  │ 🔴 Rewrite 89 product descriptions for AI readability   │
  │    Est. impact: +18% agent recommendation rate          │
  │    [Generate with AI] [Preview] [Dismiss]               │
  ├─────────────────────────────────────────────────────────┤
  │ 🟡 Add size/color attributes to structured data         │
  │    Est. impact: +12% cart addition rate                 │
  │    [Auto-fix] [Preview] [Dismiss]                       │
  └─────────────────────────────────────────────────────────┘

  RECENT WINS:
  ✅ Added review schema → agent visits +15% this week
  ✅ Expanded descriptions → Perplexity citations +22%
```

---

## 4. Technical Architecture

### 4.1 Data Collection (3 methods)

```
Method 1: Server-Side Tracker (Primary)
─────────────────────────────────────────
  Merchant installs middleware/plugin:

  Every request → AgentPulse middleware:
    1. Check User-Agent against known AI agents
    2. Check referrer (chatgpt.com, perplexity.ai, etc.)
    3. Analyze request pattern (API-like? headless?)
    4. If agent detected → POST /collect with full context
    5. Pass through to merchant's store (zero latency impact)

  Supported platforms:
  - Shopify (app)
  - WooCommerce (plugin)
  - Next.js / Nuxt (middleware)
  - Vercel / Cloudflare (edge function)
  - Generic (reverse proxy)

Method 2: MCP/Protocol Listener
─────────────────────────────────────────
  For stores with MCP/UCP/ACP endpoints:

  AgentPulse wraps the merchant's MCP server:
    Agent → AgentPulse Proxy → Merchant MCP Server
                │
                └→ Log: agent identity, query, products returned,
                        cart actions, checkout events

Method 3: Client-Side Tracker (Supplementary)
─────────────────────────────────────────
  For JS-capable agents + referral detection:

  <script src="agentpulse.js" data-store="xxx"></script>
  - Detect referrer from AI platforms
  - Track post-click behavior on store
  - Stitch with server-side data
  ← Reuse existing tracker code
```

### 4.2 System Architecture

```
                    Merchant's Store
                         │
          ┌──────────────┼───────────────┐
          │              │               │
    Server-Side      MCP Proxy      JS Tracker
    Middleware        Listener       (existing)
          │              │               │
          └──────────────┼───────────────┘
                         │
                    POST /collect
                         │
          ┌──────────────▼───────────────────┐
          │       AgentPulse Ingest API       │
          │       (NestJS + Fastify)          │
          │                                   │
          │  ┌───────────────────────────┐    │
          │  │  Agent Detection Engine   │    │
          │  │  (3 layers + commerce)    │    │
          │  └───────────────────────────┘    │
          │              │                    │
          │       BullMQ Queue                │
          │              │                    │
          │  ┌───────────▼───────────────┐    │
          │  │  Event Processor Workers  │    │
          │  │  - Identify agent source  │    │
          │  │  - Classify event type    │    │
          │  │  - Stitch sessions        │    │
          │  │  - Calculate attribution  │    │
          │  │  - Update aggregates      │    │
          │  └───────────────────────────┘    │
          └──────────────┬───────────────────┘
                         │
          ┌──────────────▼───────────────────┐
          │         Data Layer               │
          │                                   │
          │  PostgreSQL          Redis         │
          │  ├─ events           ├─ cache      │
          │  ├─ agent_sessions   ├─ queues     │
          │  ├─ products         ├─ rate limits│
          │  ├─ attributions     └─ real-time  │
          │  ├─ readiness_scores               │
          │  └─ competitors                    │
          └──────────────┬───────────────────┘
                         │
          ┌──────────────▼───────────────────┐
          │      Dashboard (React + Vite)    │
          │                                   │
          │  Agent Traffic · Commerce Funnel  │
          │  Readiness Score · Attribution    │
          │  Competitive Intel · Optimizer    │
          └──────────────────────────────────┘
```

### 4.3 Agent Detection — Commerce Extended

Extend existing 3-layer detection with commerce-specific signals:

```
Layer 1: Server UA Match (confidence: 95)
  - GPTBot, ChatGPT-User (OpenAI shopping)
  - Googlebot (Google AI Mode)
  - PerplexityBot (Perplexity Buy)
  - Applebot (Apple Intelligence)
  - CopilotBot (Microsoft Copilot)
  → Extended with shopping-specific agent UAs

Layer 2: Behavioral Analysis (confidence: 60)
  - No JS execution
  - No mouse/scroll events
  - Rapid sequential product page loads
  - Direct API-pattern requests (no asset loading)

Layer 3: Request Pattern (confidence: 40)
  - MCP server queries
  - ACP/UCP protocol requests
  - Structured data endpoint access
  - Cart API calls without prior browsing

Layer 4: Commerce Signals (NEW, confidence: 70)
  - Referrer from chatgpt.com, perplexity.ai, google.com/ai
  - UTM parameters: utm_source=chatgpt, utm_medium=agent
  - Cart creation via API without session history
  - Checkout initiated via ACP/UCP protocol
  - Order source attribution from platform webhooks
```

### 4.4 Data Model

```sql
-- Extend existing events table with commerce fields
-- events table (partitioned by timestamp) — EXISTING, extended
ALTER TABLE events ADD COLUMN event_type VARCHAR(30);
  -- 'discovery' | 'product_view' | 'add_to_cart' | 'checkout' | 'purchase'
ALTER TABLE events ADD COLUMN product_id VARCHAR(100);
ALTER TABLE events ADD COLUMN product_name VARCHAR(255);
ALTER TABLE events ADD COLUMN product_price DECIMAL(10,2);
ALTER TABLE events ADD COLUMN order_id VARCHAR(100);
ALTER TABLE events ADD COLUMN order_value DECIMAL(10,2);
ALTER TABLE events ADD COLUMN agent_source VARCHAR(50);
  -- 'chatgpt_shopping' | 'google_ai_mode' | 'perplexity_buy' | etc.

-- Agent sessions (stitch events into sessions)
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  agent_source VARCHAR(50) NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  products_queried INT DEFAULT 0,
  products_viewed INT DEFAULT 0,
  products_carted INT DEFAULT 0,
  checkout_initiated BOOLEAN DEFAULT false,
  purchase_completed BOOLEAN DEFAULT false,
  order_value DECIMAL(10,2),
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (session_start);

CREATE INDEX idx_agent_sessions_store
  ON agent_sessions(store_id, session_start DESC);

-- Product readiness scores
CREATE TABLE product_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  product_url TEXT,
  overall_score SMALLINT NOT NULL,       -- 0-100
  schema_score SMALLINT NOT NULL,        -- 0-100
  content_score SMALLINT NOT NULL,       -- 0-100
  technical_score SMALLINT NOT NULL,     -- 0-100
  issues JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  last_scanned_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

CREATE INDEX idx_readiness_store_score
  ON product_readiness(store_id, overall_score ASC);

-- Agent attributions (revenue tracking)
CREATE TABLE agent_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id UUID REFERENCES agent_sessions(id),
  agent_source VARCHAR(50) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  order_value DECIMAL(10,2) NOT NULL,
  products JSONB NOT NULL,               -- [{id, name, price, qty}]
  attribution_model VARCHAR(20) NOT NULL, -- 'first_touch' | 'last_touch' | 'agent_assisted'
  attributed_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (attributed_at);

CREATE INDEX idx_attributions_store
  ON agent_attributions(store_id, attributed_at DESC);

-- Competitor tracking
CREATE TABLE competitor_mentions (
  id BIGSERIAL,
  store_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  query_prompt TEXT NOT NULL,
  agent_platform VARCHAR(50) NOT NULL,   -- 'chatgpt' | 'perplexity' | 'google_ai'
  mentioned_brands JSONB NOT NULL,       -- [{brand, rank, cited}]
  own_brand_rank INT,                    -- null if not mentioned
  scanned_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (scanned_at);

-- Daily aggregates for fast dashboard queries
CREATE TABLE daily_agent_stats (
  id BIGSERIAL,
  store_id UUID NOT NULL,
  date DATE NOT NULL,
  agent_source VARCHAR(50) NOT NULL,
  visits INT DEFAULT 0,
  product_views INT DEFAULT 0,
  cart_additions INT DEFAULT 0,
  checkouts INT DEFAULT 0,
  purchases INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  UNIQUE(store_id, date, agent_source)
);

CREATE INDEX idx_daily_stats_store
  ON daily_agent_stats(store_id, date DESC);
```

---

## 5. API Contracts

### 5.1 Ingest API (extends existing)

```
POST /collect
{
  storeId: string,
  url: string,
  eventType: 'discovery' | 'product_view' | 'add_to_cart' | 'checkout' | 'purchase',
  agent: {
    isAgent: boolean,
    agentName: string,
    agentSource: string,      // 'chatgpt_shopping' | 'google_ai_mode' | etc.
    confidence: number
  },
  product?: {
    id: string,
    name: string,
    price: number,
    currency: string
  },
  order?: {
    id: string,
    value: number,
    items: Array<{id: string, name: string, price: number, qty: number}>
  },
  timestamp: number,
  meta?: Record<string, unknown>
}

Response: 202 { ok: true }
```

### 5.2 Analytics API

```
GET /analytics/agent-overview?storeId=xxx&range=7d
{
  data: {
    totalVisits: number,
    agentVisits: number,
    humanVisits: number,
    agentRatio: number,
    agentRevenue: number,
    agentConversionRate: number,
    agentRevenueChange: number,       // % vs previous period
    bySource: Array<{
      source: string,
      visits: number,
      revenue: number,
      conversionRate: number,
      trend: number                   // % change
    }>
  }
}

GET /analytics/agent-funnel?storeId=xxx&range=30d&source=chatgpt_shopping
{
  data: {
    stages: [
      { name: 'discovery', count: number, dropOff: number },
      { name: 'product_view', count: number, dropOff: number },
      { name: 'add_to_cart', count: number, dropOff: number },
      { name: 'checkout', count: number, dropOff: number },
      { name: 'purchase', count: number, dropOff: number }
    ],
    insights: Array<{ severity: string, message: string }>
  }
}

GET /analytics/agent-attribution?storeId=xxx&range=30d
{
  data: {
    totalAgentRevenue: number,
    bySource: Array<{
      source: string,
      revenue: number,
      orders: number,
      avgOrderValue: number
    }>,
    byProduct: Array<{
      productId: string,
      productName: string,
      agentRevenue: number,
      topSource: string
    }>
  }
}

GET /analytics/agent-products?storeId=xxx&range=7d
{
  data: Array<{
    productId: string,
    productName: string,
    agentViews: number,
    agentCarts: number,
    agentPurchases: number,
    agentRevenue: number,
    readinessScore: number,
    topAgent: string
  }>
}
```

### 5.3 Readiness API

```
POST /readiness/scan?storeId=xxx
  → Triggers async product catalog scan
  → Returns 202 { jobId: string }

GET /readiness/score?storeId=xxx
{
  data: {
    overallScore: number,
    totalProducts: number,
    scannedProducts: number,
    scoreBreakdown: {
      schema: number,
      content: number,
      technical: number
    },
    topIssues: Array<{
      severity: 'critical' | 'warning' | 'info',
      message: string,
      affectedProducts: number,
      fixType: 'auto' | 'manual'
    }>,
    products: Array<{
      productId: string,
      productName: string,
      score: number,
      issues: Array<string>
    }>
  }
}

POST /readiness/fix
{
  storeId: string,
  fixes: Array<{
    productId: string,
    fixType: 'schema' | 'description' | 'attributes',
    autoApply: boolean
  }>
}
```

### 5.4 Competitive Intelligence API

```
POST /competitors/track
{
  storeId: string,
  category: string,            // "running shoes"
  queries: string[],           // ["best running shoes under $100", ...]
  competitors: string[]        // ["nike.com", "adidas.com", ...]
}

GET /competitors/report?storeId=xxx&category=xxx
{
  data: {
    category: string,
    ownBrandAvgRank: number,
    competitors: Array<{
      brand: string,
      avgRank: number,
      mentionCount: number,
      trend: number
    }>,
    insights: Array<string>
  }
}
```

---

## 6. Platform Integrations

### 6.1 Shopify App (Primary)

```
Installation flow:
  1. Merchant installs from Shopify App Store
  2. OAuth → access store data (products, orders, themes)
  3. Auto-inject server-side tracking via ScriptTag / App Proxy
  4. Sync product catalog for readiness scoring
  5. Subscribe to order webhooks for attribution
  6. Dashboard accessible from Shopify Admin

Shopify APIs used:
  - Products API (catalog sync)
  - Orders API (attribution)
  - ScriptTag API (tracker injection)
  - Webhooks API (real-time order events)
  - Theme API (structured data injection for auto-fix)
  - App Bridge (embedded dashboard in Shopify Admin)
```

### 6.2 WooCommerce Plugin

```
Installation flow:
  1. Install plugin from WordPress directory
  2. Plugin auto-injects server-side middleware
  3. Sync products via WooCommerce REST API
  4. Hook into woocommerce_order_created for attribution
  5. Dashboard via iframe or standalone
```

### 6.3 Generic (API / Edge Middleware)

```
For custom stores:
  - NPM package: @agentpulse/tracker
  - Edge middleware templates (Vercel, Cloudflare, Next.js)
  - REST API for custom integrations
  - Webhook endpoint for order events
```

---

## 7. Integrations Roadmap

| Priority | Integration | Why |
|----------|-------------|-----|
| P0 | Shopify | 4.6M stores, largest app ecosystem |
| P1 | WooCommerce | 6.5M stores, WordPress ecosystem |
| P1 | Next.js / Vercel | Modern headless commerce stack |
| P2 | BigCommerce | Growing platform, ACP support |
| P2 | Magento | Enterprise e-commerce |
| P3 | Wix | Growing commerce platform |
| P3 | Custom API | Catch-all for custom stores |

---

## 8. Success Criteria

### Phase 1: Foundation (Month 1-3)
- [ ] Shopify app live in App Store
- [ ] 200 stores installed
- [ ] Agent traffic dashboard functional
- [ ] 3+ AI shopping agents identified accurately
- [ ] < 200ms ingest latency

### Phase 2: Analytics (Month 4-6)
- [ ] Commerce funnel visualization
- [ ] Product readiness scoring
- [ ] Agent attribution engine
- [ ] 1,000 stores installed
- [ ] $5K MRR

### Phase 3: Intelligence (Month 7-10)
- [ ] Competitive intelligence
- [ ] AI-powered optimization suggestions
- [ ] Auto-fix for schema issues
- [ ] WooCommerce plugin live
- [ ] 5,000 stores installed
- [ ] $30K MRR

### Phase 4: Scale (Month 11-14)
- [ ] Advanced attribution models
- [ ] A/B testing for agent optimization
- [ ] Agency/white-label tier
- [ ] 20,000 stores installed
- [ ] $100K MRR
