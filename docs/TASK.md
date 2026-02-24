# AgentPulse — Sprint 1-2 Task Board

> **Updated:** 2026-02-25
> **Phase:** 1 — AI Traffic Dashboard (Month 1-2)
> **Goal:** Complete backend foundation + dashboard features for launch

---

## Status Legend

- [ ] Pending
- [~] In Progress
- [x] Completed

---

## Dependency Graph

```
Sprint 1-2: Backend Foundation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#1  Migration: agent_type + referrer columns ─────┐
#7  Align PLAN_LIMITS with spec (independent)     │
                                                   ▼
#2  Migration: page_ai_scores + ai_referrals    (← #1)
#3  Agent type classification in processor      (← #1)
#4  AI referral detection in tracker            (← #1)
                                                   │
                                                   ▼
Sprint 3-4: Endpoints + Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#5  GET /analytics/pages/ai-interest            (← #1, #3)
#6  GET /analytics/referrals                    (← #1, #4)
                                                   │
                                                   ▼
#8  Dashboard: Content Analysis page            (← #5)
#9  Dashboard: AI Referrals page                (← #6)
#10 Enhance Overview + agent type badges        (← #3)

Independent:
━━━━━━━━━━━━
#11 Update project docs
```

---

## Tasks

### #1 — Migration: add agent_type, referrer_domain, referrer_type to events

- **Status:** [x] Completed
- **Blocked by:** None (START HERE)
- **Blocks:** #2, #3, #4, #5, #6

Add 3 new columns to `events` table:

```sql
agent_type      VARCHAR(20)   -- training | search | on_demand | unknown
referrer_domain VARCHAR(255)  -- parsed referrer hostname
referrer_type   VARCHAR(20)   -- ai_referral | organic | direct | other
```

**Steps:**
1. Update `apps/api/prisma/schema.prisma` — add columns to Event model
2. Run `npx prisma migrate dev --name add_agent_type_referrer_columns`
3. Run `npx prisma generate`
4. Deploy migration to Railway: `npx prisma migrate deploy`

**Reference:** SPEC-v3.md Section 5 Database Schema

---

### #2 — Migration: create page_ai_scores and ai_referrals tables

- **Status:** [x] Completed
- **Blocked by:** #1
- **Blocks:** None (used in Phase 2 Content AI Score)

Create 2 new tables:

```sql
page_ai_scores (
  id              UUID PRIMARY KEY,
  site_id         UUID REFERENCES sites(id),
  url             TEXT,
  date            DATE,
  ai_score        INT,
  crawl_score     INT,
  citation_score  INT,
  readiness_score INT,
  crawl_count     INT,
  referral_count  INT,
  agent_count     INT,
  top_agent       VARCHAR(50),
  UNIQUE(site_id, url, date)
)

ai_referrals (
  id              UUID PRIMARY KEY,
  site_id         UUID REFERENCES sites(id),
  referrer_domain VARCHAR(255),
  landing_url     TEXT,
  timestamp       TIMESTAMPTZ,
  meta            JSONB
)
```

**Steps:**
1. Update Prisma schema with new models
2. Run `npx prisma migrate dev --name create_page_ai_scores_ai_referrals`
3. Deploy to Railway

**Reference:** SPEC-v3.md Section 5 Database Schema

---

### #3 — Implement agent type classification in event processor

- **Status:** [x] Completed
- **Blocked by:** #1
- **Blocks:** #5, #10

Classify each detected agent into training/search/on_demand type.

**Agent Type Map:**

| Type | Agents |
|------|--------|
| training | GPTBot, ClaudeBot, Google-Extended, ByteSpider, Meta-ExternalAgent, Amazonbot, Applebot |
| search | OAI-SearchBot, PerplexityBot, YouBot, DuckAssistant, GoogleVertexBot, GeminiBot, Gemini-Deep-Research |
| on_demand | ChatGPT-User, Claude-User, Perplexity-User |

**Steps:**
1. Add `AGENT_TYPE_MAP` and `AgentType` to `packages/types/src/agents.ts`
2. Export `getAgentType(agentName: string): AgentType` function
3. Update `apps/api/src/ingest/ingest.service.ts` — classify agent type
4. Update `apps/api/src/ingest/event.processor.ts` — store `agent_type` in DB
5. Update `CollectEventDto` if agent type is sent from client

**Reference:** SPEC-v3.md Section 5 Agent Type Classification

---

### #4 — Implement AI referral detection in tracker

- **Status:** [x] Completed
- **Blocked by:** #1
- **Blocks:** #6

Detect when a user arrives from an AI platform (ChatGPT, Perplexity, etc.).

**AI Referral Domains:**

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

**Steps:**
1. Add `AI_REFERRAL_DOMAINS` to `packages/types/src/agents.ts`
2. Update `apps/tracker/src/collect.ts` — parse `document.referrer`, detect AI referral
3. Send in event payload: `meta.aiReferral: boolean`, `meta.aiReferralSource: string`
4. Update `apps/api/src/ingest/event.processor.ts` — parse referrer_domain and referrer_type from meta, store in new columns
5. Rebuild tracker: `pnpm build --filter tracker`
6. Upload new tracker.js to Cloudflare R2

**Reference:** SPEC-v3.md Section 4.3 AI Referral Tracking

---

### #5 — New endpoint: GET /analytics/pages/ai-interest

- **Status:** [x] Completed
- **Blocked by:** #1, #3
- **Blocks:** #8

Page-level AI crawl breakdown endpoint.

**API:**

```
GET /analytics/pages/ai-interest?siteId=xxx&range=7d

Response:
{
  data: [{
    url: string,
    aiVisits: number,
    uniqueAgents: number,
    topAgents: [{ name: string, count: number }],
    trend: number,           // % change vs previous period
    agentTypes: {
      training: number,
      search: number,
      on_demand: number
    }
  }],
  meta: { total: number, limit: number }
}
```

**Plan-gated limits:**
- Free: top 10 pages
- Starter: top 50 pages
- Pro+: unlimited

**Steps:**
1. Add method to `apps/api/src/analytics/analytics.service.ts` — raw SQL query
2. Add route to `apps/api/src/analytics/analytics.controller.ts`
3. Add Redis cache (5min TTL), key: `pages-ai:${siteId}:${range}`
4. Add response DTO type to `packages/types/src/analytics.ts`

**Reference:** SPEC-v3.md Section 4.2 + Section 7

---

### #6 — New endpoint: GET /analytics/referrals

- **Status:** [x] Completed
- **Blocked by:** #1, #4
- **Blocks:** #9

AI referral traffic analytics endpoint.

**API:**

```
GET /analytics/referrals?siteId=xxx&range=7d

Response:
{
  data: [{
    source: string,          // e.g. "ChatGPT"
    referrerDomain: string,  // e.g. "chatgpt.com"
    visits: number,
    uniquePages: number,
    topLandingPage: string,
    trend: number
  }],
  meta: {
    totalReferrals: number,
    referralShare: number    // % of total traffic
  }
}
```

Also add: `GET /analytics/referrals/pages` for landing page breakdown.

**Steps:**
1. Add methods to `analytics.service.ts` — query events where referrer_type = 'ai_referral'
2. Add routes to `analytics.controller.ts`
3. Add Redis cache (5min TTL), key: `referrals:${siteId}:${range}`
4. Free tier: top 3 sources only, Paid: full breakdown

**Reference:** SPEC-v3.md Section 4.3 + Section 7

---

### #7 — Align PLAN_LIMITS code with SPEC-v3 pricing table

- **Status:** [x] Completed
- **Blocked by:** None (can do in parallel with #1)
- **Blocks:** None

Fix mismatches between `packages/types/src/site.ts` and SPEC-v3 pricing.

**Current code vs SPEC-v3:**

| Field | Plan | Code (wrong) | Spec (correct) |
|-------|------|-------------|----------------|
| PlanType | tier 4 | `enterprise` | `business` |
| retentionDays | free | 30 | 7 |
| retentionDays | starter | 90 | 30 |
| retentionDays | pro | 365 | 90 |
| sites | starter | 5 | 3 |
| sites | pro | Infinity | 10 |
| eventsPerMonth | pro | 1,000,000 | 500,000 |
| eventsPerMonth | business | N/A | 5,000,000 |
| retentionDays | business | N/A | 365 |

**Steps:**
1. Update `PlanType` — rename `enterprise` to `business`
2. Update all `PLAN_LIMITS` values to match spec
3. Search codebase for `'enterprise'` references and update
4. Update Prisma schema enum if plan is stored as enum
5. Create migration if DB stores plan as enum type

**Reference:** SPEC-v3.md Section 6 Plan & Pricing

---

### #8 — Dashboard: Content Analysis page

- **Status:** [x] Completed
- **Blocked by:** #5
- **Blocks:** None

New dashboard page at `/content-analysis`.

**UI Elements:**
- Range selector (1d, 7d, 30d)
- Table: Page URL | AI Visits | Unique Agents | Trend | Agent Types
- Expandable rows: per-page agent breakdown
- Summary: "Most crawled by: GPTBot -> /blog/* (68%)"
- Plan gate: show upgrade prompt when hitting page limit

**Steps:**
1. Create `apps/dashboard/src/pages/content-analysis.tsx`
2. Add API hook in `apps/dashboard/src/hooks/use-analytics.ts`
3. Add route + sidebar nav item
4. Use existing components: stat-card, range-selector
5. Add Recharts bar chart for agent type distribution

**Reference:** SPEC-v3.md Section 4.2 mockup

---

### #9 — Dashboard: AI Referrals page

- **Status:** [x] Completed
- **Blocked by:** #6
- **Blocks:** None

New dashboard page at `/referrals`.

**UI Elements:**
- Summary cards: Total AI Referrals | AI Referral Share | Trend
- Table: Source | Visits | Unique Pages | Top Landing Page
- Landing page breakdown section
- Range selector (1d, 7d, 30d)

**Steps:**
1. Create `apps/dashboard/src/pages/referrals.tsx`
2. Add API hook in `apps/dashboard/src/hooks/use-analytics.ts`
3. Add route + sidebar nav item
4. Use existing stat-card + table components

**Reference:** SPEC-v3.md Section 4.3 mockup

---

### #10 — Enhance Overview with AI ratio and agent type badges

- **Status:** [x] Completed
- **Blocked by:** #3
- **Blocks:** None

Update existing Overview dashboard page.

**Changes:**
1. Add "AI Ratio" stat card (e.g. "9.7% AI traffic") with trend arrow
2. Add agent type breakdown section with colored badges:
   - Training bots: 67% (blue badge)
   - Search bots: 24% (green badge)
   - On-demand bots: 9% (orange badge)
3. Add agent type color coding to existing top agents list
4. Update overview API call to include agent_type data

**Reference:** SPEC-v3.md Section 4.1 mockup

---

### #11 — Update project docs to match current codebase

- **Status:** [x] Completed
- **Blocked by:** None (can do anytime)
- **Blocks:** None

Fix outdated/incorrect documentation:

**PROJECT.md:**
- NestJS v10 -> v11
- server-sdk: remove "UNCOMMITTED" label
- Update "What's Built" checklist

**README.md:**
- Wrong function names: `agentAnalytics` -> `agentPulse`
- Wrong plugin name: `agentAnalyticsPlugin` -> `agentPulsePlugin`
- Wrong middleware name: `agentAnalyticsMiddleware` -> `createMiddleware`

**CLAUDE.md:**
- NestJS v10+ -> v11+
- Update KNOWN_AGENTS list (16 agents)
- Add `source` field to API contracts
- Update plan limits after #7

**SPEC-v3.md:**
- Mark server-sdk as done in roadmap checklist

---

## Execution Order

```
Week 1:
  #1  Migration: agent_type + referrer columns     ← START
  #7  Align PLAN_LIMITS with spec                  ← START (parallel)
  #11 Update project docs                          ← START (parallel)

Week 1-2:
  #2  Migration: page_ai_scores + ai_referrals     ← after #1
  #3  Agent type classification                    ← after #1
  #4  AI referral detection in tracker             ← after #1

Week 2:
  #5  GET /analytics/pages/ai-interest             ← after #1, #3
  #6  GET /analytics/referrals                     ← after #1, #4

Week 3:
  #8  Dashboard: Content Analysis page             ← after #5
  #9  Dashboard: AI Referrals page                 ← after #6
  #10 Enhance Overview + agent type badges         ← after #3
```
