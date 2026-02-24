# AgentPulse — Product Specification v3

> **Version:** 3.0
> **Date:** 2026-02-24
> **Status:** Active
> **Previous:** SPEC-v2.md (e-commerce pivot — deprecated), SPEC.md (publisher focus — archived)

---

## Why v3?

| Version | Direction | Problem |
|---------|-----------|---------|
| v1 | Publisher content protection | Market too small, publishers won't pay for tracking |
| v2 | E-commerce AI commerce analytics | 0% built, needs Shopify expertise team doesn't have, market unvalidated |
| **v3** | **AI Traffic Intelligence for developers & SMBs** | **70% built, market validated by Cloudflare/Profound/Known Agents, team fit** |

v3 is grounded in what exists in code, what the market has validated, and what the team can ship fast.

---

## 1. Problem Statement

### The AI Traffic Blindspot

Every website has AI traffic. Google Analytics doesn't show it. Site owners are blind to:

- **Which AI bots** visit their site and how often
- **Which content** AI finds most valuable (crawl frequency by page)
- **How much traffic** AI sends back via citations (AI referrals)
- **Whether their content** is optimized for AI consumption (AI readiness)
- **Trends** — is AI traffic growing or declining, and why?

### Who Cares?

| Persona | Pain | Willingness to Pay |
|---------|------|--------------------|
| **Developer/Blogger** | "Is AI crawling my docs? Am I getting cited?" | Low ($0-19/mo) |
| **Content site / Publisher** | "AI is scraping my content — how much? Can I prove it?" | Medium ($19-49/mo) |
| **SEO/Marketing team** | "How do I optimize for AI search? What content performs?" | High ($49-149/mo) |
| **Agency managing multiple sites** | "I need AI traffic reports for all my clients" | High ($149+/mo) |

### Market Validation

The market is real — proven by:
- **Profound** raised $58.5M to solve this for enterprise
- **Cloudflare** added free AI Crawl Control for all users (proves demand at scale)
- **Known Agents** has thousands of WordPress installs
- **Vercel** built BotID into their platform

But: Profound = enterprise-only. Cloudflare = detection only (no analytics). Known Agents = WordPress only, basic tracking.

**Gap: No one provides AI traffic ANALYTICS for developers & SMBs across any hosting platform.**

---

## 2. Solution: "Google Analytics for AI Traffic"

### Positioning

```
Cloudflare AI Crawl Control  =  "Security camera"  (sees who's at the door)
AgentPulse                   =  "Business analyst"  (understands what they want)
```

We don't compete on detection. We compete on **intelligence**.

### Core Value Proposition

> "AgentPulse tells you what AI thinks about your content — which pages AI crawls most,
> which AI engines cite you, how your AI visibility is trending, and what to optimize."

---

## 3. Core Features — Phased

### Phase 1: AI Traffic Dashboard (Month 1-2)

**Goal:** Ship free tier, get 500 installs, validate demand.

**Status: ~70% built.** Needs analytics depth + AI referral tracking.

#### 3.1 AI Traffic Overview

What it shows:
- Total requests: human vs AI agent
- Agent breakdown: which bots, how many visits, trend vs previous period
- AI traffic ratio and trend (growing/declining)
- Unique agents count

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
└─────────────────────────────────────────────────┘
```

**Implementation:** Exists in `apps/api/src/analytics/`. Needs:
- `agentChange` percentage calculation (partially done)
- Agent type classification (training/search/on-demand)

#### 3.2 Page-Level AI Analysis (NEW — Key differentiator)

What it shows:
- Which pages AI crawls most
- Per-page agent breakdown
- Content categories AI prefers
- Crawl frequency trends per page

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

**Implementation:** New analytics query — `GROUP BY url, agentName` on existing events table. Server SDK already captures URL. Dashboard needs new page.

#### 3.3 AI Referral Tracking (NEW — Critical for value)

What it shows:
- Traffic arriving FROM AI platforms (chatgpt.com, perplexity.ai, etc.)
- Which AI engine sends most referral traffic
- Landing pages from AI referrals
- Referral trend over time

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

**Implementation:** Parse `document.referrer` in tracker for known AI domains. New referral domains list in `packages/types/`. New analytics endpoint.

Known AI referral domains:
```typescript
export const AI_REFERRAL_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com',
  'perplexity.ai',
  'you.com',
  'copilot.microsoft.com',
  'gemini.google.com',
  'claude.ai',
  'phind.com',
  'kagi.com',
] as const;
```

### Phase 2: AI Content Intelligence (Month 3-4)

**Goal:** Launch paid tiers, reach 50 paying customers, $2-3K MRR.

#### 3.4 Content AI Score

Per-page scoring (0-100) measuring how "AI-friendly" content is:

```
Score Components:
├── Crawl Signal (40 points)
│   ├── Crawl frequency (how often bots visit)           0-15
│   ├── Multi-agent interest (# different bots)          0-10
│   ├── Crawl trend (growing vs declining)               0-10
│   └── Crawl depth (do bots visit related pages?)       0-5
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
│  💡 Quick wins:                                           │
│  • Add FAQ schema to /pricing (+8 readiness points)      │
│  • Update /blog/prisma-vs-typeorm — crawl high but       │
│    citation low, content may be outdated                  │
└──────────────────────────────────────────────────────────┘
```

**Implementation:** Computed from existing crawl data + new referral data + page scan (readiness). Readiness scan = new service that checks structured data via headless browser or API call.

#### 3.5 AI Optimization Recommendations

Rule-based engine suggesting content improvements:

```typescript
// Recommendation rules
const RULES = [
  {
    condition: 'crawl_high AND citation_low',
    recommendation: 'Content is being read by AI but not cited. May be outdated or lacking unique insights.',
    impact: 'high',
  },
  {
    condition: 'no_structured_data',
    recommendation: 'Add JSON-LD structured data (Article, FAQ, HowTo schema).',
    impact: 'medium',
  },
  {
    condition: 'no_llms_txt',
    recommendation: 'Create llms.txt file to guide AI crawlers to your best content.',
    impact: 'medium',
  },
  {
    condition: 'crawl_declining',
    recommendation: 'AI crawl frequency is dropping. Content may need refresh.',
    impact: 'high',
  },
  {
    condition: 'single_agent_only',
    recommendation: 'Only one AI engine crawls this page. Improve discoverability across AI platforms.',
    impact: 'low',
  },
];
```

#### 3.6 Alerts & Reports

- Weekly AI traffic email digest (free tier)
- Real-time alerts: new bot detected, unusual crawl spike, citation drop (paid tiers)
- Exportable PDF/CSV reports (pro tier)

### Phase 3: Platform & Scale (Month 5-8)

**Goal:** Multi-platform SDKs, agency features, reach $10K MRR.

#### 3.7 Multi-Platform SDKs

Priority order based on team capability and market:

```
P0 (built):  Express middleware, Fastify plugin, Next.js middleware
P0 (built):  JS tracker snippet (client-side)
P1 (month 5): Laravel/PHP middleware (team has PHP expertise)
P1 (month 5): WordPress plugin (large market)
P2 (month 6): Nginx log parser (self-hosted servers)
P2 (month 6): Python/Django middleware
P3 (month 7): Cloudflare Workers integration
P3 (month 7): Vercel integration (edge middleware)
```

#### 3.8 Competitive AI Visibility (Paid feature)

Check how your content ranks across AI engines:

- Query AI engines with relevant prompts
- Track if your site/brand is mentioned
- Compare vs competitors
- Track trends over time

Note: This overlaps with Cluster B tools (Otterly, Peec AI). Implement as lightweight add-on, not core product. Consider partnership instead of build.

#### 3.9 Agency / Multi-Site Management

- Unified dashboard across all client sites
- Per-client reports with white-label option
- Team member access controls
- Bulk site management

---

## 4. Technical Architecture

### What Exists (reuse 100%)

```
apps/api/           NestJS + Fastify backend
├── auth/           JWT authentication
├── ingest/         POST /collect → BullMQ queue → PostgreSQL
├── analytics/      Overview, agents, pages, timeline queries
├── sites/          Multi-tenant site management
├── agent-detection/ 3-layer detection (UA + behavioral + pattern)
├── prisma/         Database service
└── redis/          Cache service

apps/dashboard/     React + Vite frontend
├── overview        Traffic overview page
├── agents          Agent breakdown page
├── pages-stats     Page statistics
├── timeline        Timeline visualization
└── sites           Site management

apps/tracker/       Vanilla TS embed snippet (IIFE bundle)
├── detect.ts       Client-side agent detection
├── collect.ts      sendBeacon/fetch event sending
└── index.ts        Auto-init, SPA tracking

packages/server-sdk/ Server-side middleware (NEW — uncommitted)
├── express.ts      Express middleware
├── fastify.ts      Fastify plugin
└── next.ts         Next.js middleware

packages/types/     Shared TypeScript types
├── agents.ts       Known agents + confidence scoring
├── event.ts        Event interfaces
├── analytics.ts    Analytics response types
└── site.ts         Plan limits
```

### What Needs to Change

#### 4.1 Database Schema Changes

```sql
-- Add AI referral tracking
ALTER TABLE events ADD COLUMN referrer_domain VARCHAR(255);
ALTER TABLE events ADD COLUMN referrer_type VARCHAR(20);
-- 'ai_referral' | 'organic' | 'direct' | 'social' | 'other'

-- Add agent type classification
ALTER TABLE events ADD COLUMN agent_type VARCHAR(20);
-- 'training' | 'search' | 'on_demand' | 'unknown'

-- New table: page-level AI scores (computed daily)
CREATE TABLE page_ai_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       UUID NOT NULL REFERENCES sites(id),
  url           VARCHAR(2048) NOT NULL,
  date          DATE NOT NULL,
  ai_score      INTEGER NOT NULL DEFAULT 0,
  crawl_score   INTEGER NOT NULL DEFAULT 0,
  citation_score INTEGER NOT NULL DEFAULT 0,
  readiness_score INTEGER NOT NULL DEFAULT 0,
  crawl_count   INTEGER NOT NULL DEFAULT 0,
  referral_count INTEGER NOT NULL DEFAULT 0,
  agent_count   INTEGER NOT NULL DEFAULT 0,
  top_agent     VARCHAR(100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, url, date)
);

-- New table: AI referral sources
CREATE TABLE ai_referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       UUID NOT NULL REFERENCES sites(id),
  referrer_domain VARCHAR(255) NOT NULL,
  landing_url   VARCHAR(2048) NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL,
  meta          JSONB
);

-- Index for fast queries
CREATE INDEX CONCURRENTLY idx_events_url_agent
  ON events(site_id, url, agent_name, timestamp);
CREATE INDEX CONCURRENTLY idx_ai_referrals_site_time
  ON ai_referrals(site_id, timestamp);
CREATE INDEX CONCURRENTLY idx_page_scores_site_date
  ON page_ai_scores(site_id, date);
```

#### 4.2 New API Endpoints

```typescript
// Phase 1 endpoints
GET /analytics/pages/ai-interest
// Page-level AI crawl breakdown
// Query: { siteId, range, limit, sortBy: 'crawl_count' | 'referral_count' | 'ai_score' }
// Response: { data: PageAIInterest[], meta: PaginationMeta }

GET /analytics/referrals
// AI referral traffic
// Query: { siteId, range }
// Response: { data: { sources: AIReferralSource[], total: number, trend: number } }

GET /analytics/referrals/pages
// Landing pages from AI referrals
// Query: { siteId, range, source?: string }
// Response: { data: AIReferralPage[] }

// Phase 2 endpoints
GET /analytics/content-score
// Content AI Score per page
// Query: { siteId, range, url?: string }
// Response: { data: ContentAIScore[] }

GET /analytics/recommendations
// AI optimization recommendations
// Query: { siteId, url?: string }
// Response: { data: Recommendation[] }

POST /scan/readiness
// On-demand page readiness scan
// Body: { url: string }
// Response: { data: ReadinessReport }
```

#### 4.3 New Types (packages/types)

```typescript
// Agent type classification
export type AgentType = 'training' | 'search' | 'on_demand' | 'unknown';

export const AGENT_TYPE_MAP: Record<string, AgentType> = {
  'GPTBot': 'training',
  'ClaudeBot': 'training',
  'Google-Extended': 'training',
  'ByteSpider': 'training',
  'Amazonbot': 'training',
  'Applebot': 'training',
  'Meta-ExternalAgent': 'training',
  'OAI-SearchBot': 'search',
  'PerplexityBot': 'search',
  'YouBot': 'search',
  'DuckAssistant': 'search',
  'GoogleVertexBot': 'search',
  'GeminiBot': 'search',
  'Gemini-Deep-Research': 'search',
  'ChatGPT-User': 'on_demand',
  'Claude-User': 'on_demand',
  'Perplexity-User': 'on_demand',
};

// AI referral domains
export const AI_REFERRAL_DOMAINS: Record<string, string> = {
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

// Page AI interest
export interface PageAIInterest {
  url: string;
  totalCrawls: number;
  agents: Array<{ name: string; count: number; type: AgentType }>;
  uniqueAgents: number;
  trend: number; // % change vs previous period
  referralCount: number;
}

// Content AI Score
export interface ContentAIScore {
  url: string;
  aiScore: number;       // 0-100
  crawlScore: number;    // 0-40
  citationScore: number; // 0-35
  readinessScore: number; // 0-25
  topAgent: string;
  recommendations: string[];
}

// AI Referral
export interface AIReferralSource {
  domain: string;
  engineName: string;
  visits: number;
  uniquePages: number;
  topLandingPage: string;
  trend: number;
}
```

#### 4.4 Tracker Changes

```typescript
// Add to tracker: AI referral detection
function detectAIReferral(): { isAIReferral: boolean; source: string } | null {
  const referrer = document.referrer;
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    const domain = url.hostname.replace('www.', '');

    for (const [aiDomain, engineName] of Object.entries(AI_REFERRAL_DOMAINS)) {
      if (domain === aiDomain || domain.endsWith(`.${aiDomain}`)) {
        return { isAIReferral: true, source: engineName };
      }
    }
  } catch {
    // Invalid referrer URL
  }
  return null;
}

// Include in pageview event
const aiReferral = detectAIReferral();
if (aiReferral) {
  event.meta = {
    ...event.meta,
    aiReferral: true,
    aiReferralSource: aiReferral.source,
  };
}
```

---

## 5. Dashboard Pages

### Phase 1 Dashboard

```
Sidebar:
├── Overview          (exists — enhance with AI ratio highlight)
├── AI Agents         (exists — add agent type badges)
├── Content Analysis  (NEW — page-level AI interest)
├── AI Referrals      (NEW — referral tracking)
├── Timeline          (exists — add per-agent-type filter)
└── Sites             (exists)
```

### Phase 2 Dashboard Additions

```
Sidebar additions:
├── Content Scores    (NEW — AI score per page)
├── Recommendations   (NEW — optimization suggestions)
├── Alerts            (NEW — notification center)
└── Reports           (NEW — export/email)
```

### Phase 3 Dashboard Additions

```
Sidebar additions:
├── Competitors       (NEW — AI visibility comparison)
└── Team/Agency       (NEW — multi-user management)
```

---

## 6. Plan Feature Matrix

| Feature | Free | Starter ($19) | Pro ($49) | Business ($149) |
|---------|------|---------------|-----------|-----------------|
| AI traffic overview | ✅ | ✅ | ✅ | ✅ |
| Agent breakdown | ✅ | ✅ | ✅ | ✅ |
| Agent type classification | ✅ | ✅ | ✅ | ✅ |
| AI referral tracking | Basic | ✅ | ✅ | ✅ |
| Page-level AI analysis | Top 10 | Top 50 | Unlimited | Unlimited |
| Content AI Score | ❌ | Top 20 pages | Unlimited | Unlimited |
| Recommendations | ❌ | Basic | Advanced | Advanced |
| Alerts | ❌ | Email weekly | Real-time | Real-time |
| Export (CSV/PDF) | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ | ✅ |
| White-label reports | ❌ | ❌ | ❌ | ✅ |
| Multi-user team | ❌ | ❌ | 3 users | Unlimited |
| Sites | 1 | 3 | 10 | Unlimited |
| Data retention | 7 days | 30 days | 90 days | 1 year |
| Events/month | 10K | 100K | 500K | 5M |

---

## 7. Success Criteria

### Phase 1 (Month 1-2): "Does anyone care?"

| Metric | Target |
|--------|--------|
| Free installs | 500 |
| Dashboard DAU | 50 |
| Hacker News/Product Hunt post | 1 launch |
| User feedback interviews | 10 |
| Server SDK npm downloads | 200 |

### Phase 2 (Month 3-4): "Will anyone pay?"

| Metric | Target |
|--------|--------|
| Total free users | 1,500 |
| Paid conversions | 50 |
| MRR | $2,000-3,000 |
| Free→Starter conversion | 3% |
| Churn (monthly) | <8% |

### Phase 3 (Month 5-8): "Can this be a business?"

| Metric | Target |
|--------|--------|
| Total free users | 5,000 |
| Paid customers | 200 |
| MRR | $8,000-15,000 |
| ARPU | $50 |
| LTV:CAC | >8:1 |

---

## 8. What We're NOT Building (Kill List)

- ❌ Shopify/WooCommerce app (pivot away from e-commerce focus)
- ❌ E-commerce funnel tracking (Agent-Attributed Revenue)
- ❌ Product readiness scoring for e-commerce
- ❌ On-premise deployment
- ❌ AI agent autonomous behavior tracking (market too early)
- ❌ Content licensing marketplace
- ❌ robots.txt management (Known Agents does this well)
- ❌ AI blocking/control features (Cloudflare does this free)

---

## 9. Sprint Plan — First 8 Weeks

### Sprint 1-2 (Week 1-2): Foundation

```
[ ] Commit server-sdk package
[ ] Add agent_type classification to events
[ ] Add referrer_domain to events schema
[ ] Implement AI referral detection in tracker
[ ] Create page_ai_scores table
[ ] Add page-level analytics query (GROUP BY url, agentName)
```

### Sprint 3-4 (Week 3-4): Dashboard

```
[ ] Build "Content Analysis" dashboard page
[ ] Build "AI Referrals" dashboard page
[ ] Enhance Overview with AI ratio highlight + agent type badges
[ ] Add agent type filter to timeline
[ ] Landing page for agentpulse.com
```

### Sprint 5-6 (Week 5-6): Launch

```
[ ] Product Hunt launch prep
[ ] Hacker News Show HN post
[ ] Dev.to / Medium launch article
[ ] Free tier polish and onboarding flow
[ ] Stripe integration (Starter + Pro tiers)
```

### Sprint 7-8 (Week 7-8): Intelligence

```
[ ] Content AI Score calculation engine
[ ] Recommendations engine (rule-based)
[ ] Weekly email digest (free tier)
[ ] Alert system (paid tiers)
[ ] Laravel/PHP SDK
```

---

## 10. Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Keep PostgreSQL (not TimescaleDB) | PostgreSQL | Good enough for current scale, partitioning handles growth |
| Keep BullMQ queue | BullMQ | Already built, handles burst load well |
| Content AI Score = computed daily | Cron job | Avoids real-time computation overhead |
| Readiness scan = on-demand API | Headless fetch | Don't need persistent crawling infrastructure |
| AI referral detection = client-side | Tracker | `document.referrer` available in browser, no server needed |
| Agent type = lookup table | Static map | Fast, deterministic, easy to update |

---

*This spec replaces SPEC-v2.md. The e-commerce pivot is deprecated.
Focus: AI Traffic Intelligence for developers & SMBs.*
