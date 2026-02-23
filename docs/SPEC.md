# Product Spec — Agent Access Analytics

> From analytics tool to **AI Traffic Control Platform**.
> "Stripe for AI content access" — Publishers plug in, see who takes their content, control who's allowed, and get paid when needed.

---

## 1. Vision

Google Analytics tracks people. We track **AI agents**.

But tracking alone is a commodity — Cloudflare, Vercel, or GA can bolt on a "bot tab" tomorrow. The real moat is **control + monetization**: helping publishers understand, manage, and profit from AI agent access to their content.

### One-liner

> The control layer between websites and AI agents — track, control, monetize.

### North Star Metric

**Monthly Controlled Requests (MCR)** — number of AI agent requests that flow through our rules engine per month (not just tracked, but actively managed).

---

## 2. Product Phases

### Phase 1: Track (Current — MVP)

**Goal:** Acquire users through free analytics. Build the data flywheel.

| Feature | Status | Description |
|---------|--------|-------------|
| JS tracker snippet | Done | < 3KB, vanilla TS, fire-and-forget |
| Edge middleware | Done | Server-side detection for JS-skipping bots |
| 3-layer detection | Done | UA match (95) + Behavioral (60) + Pattern (40) |
| Ingest API | Done | POST /collect → BullMQ → PostgreSQL |
| Analytics dashboard | Done | Overview, top agents, timeline, pages |
| Site management | Done | Create sites, API keys, embed snippets |
| JWT auth | Done | User registration, login, per-site access |

**Key metrics:** Registered users, sites tracked, events ingested/day.

---

### Phase 2: Control (Next — Revenue Driver)

**Goal:** Convert free users to paid. This is where money lives.

#### 2.1 Rules Engine

A per-site rules engine that lets publishers define how each AI agent is handled.

```
Rule = {
  agent: "GPTBot" | "ClaudeBot" | "*" | custom regex,
  action: "allow" | "block" | "rate_limit" | "challenge" | "redirect",
  config: {
    rateLimit?: { requests: number, window: string },  // e.g. 100 req/hour
    redirectUrl?: string,                                // e.g. /ai-notice page
    challengeType?: "robots_txt" | "delay" | "captcha",
  },
  paths: string[],         // glob patterns: ["/blog/*", "/api/docs/*"]
  schedule?: string,       // cron expression for time-based rules
  priority: number,        // lower = higher priority
}
```

**Actions explained:**

| Action | What happens |
|--------|-------------|
| `allow` | Let the agent through, track normally |
| `block` | Return 403 with a configurable message |
| `rate_limit` | Allow N requests per window, 429 after |
| `challenge` | Serve delayed response or require verification |
| `redirect` | Send agent to a specific page (e.g. licensing info) |

#### 2.2 Smart robots.txt & ai.txt Generator

- Auto-generate `robots.txt` directives based on rules
- Support the emerging `ai.txt` standard (TDM Reservation Protocol)
- One-click deploy: update rules in dashboard → robots.txt updates automatically
- Preview mode: see what would change before applying

#### 2.3 Enforcement Layer

Two enforcement modes:

**Mode A: Edge Middleware (recommended)**
- Provide a copy-paste middleware (Vercel, Cloudflare Workers, Next.js, Nuxt)
- Middleware checks rules in real-time via our edge API
- Rules cached at edge with 60s TTL for performance

**Mode B: DNS Proxy (advanced)**
- Route traffic through our proxy (like Cloudflare's model)
- Full request interception without code changes
- Higher latency but zero integration effort

#### 2.4 Alerts & Notifications

- New agent detected on your site
- Agent traffic spike (>200% above baseline)
- Rate limit threshold hit
- Weekly summary email: agent traffic report

#### 2.5 Dashboard Additions (Phase 2)

- **Rules page:** Create/edit/delete rules with drag-and-drop priority
- **Agent profiles:** Per-agent detail page (pages visited, frequency, patterns, compliance with robots.txt)
- **Blocked requests log:** See what was blocked and why
- **robots.txt preview:** Live preview of generated robots.txt

---

### Phase 3: Monetize (Long Game)

**Goal:** Enable publishers to profit from AI agent access. Platform takes commission.

#### 3.1 Content Licensing Reports

- Monthly report: "ClaudeBot scraped 50,234 pages, GPTBot scraped 12,891 pages"
- Content value estimation based on traffic, uniqueness, and domain authority
- Export-ready PDF for licensing negotiations with AI companies
- Compare against industry benchmarks

#### 3.2 Metered Access (API Keys for AI)

- Publishers set a price per 1,000 pages crawled
- AI companies (or their agents) authenticate via API key
- Platform handles metering, billing, and payout
- Revenue split: publisher 80%, platform 20%

```
Flow:
  AI Agent → Request with API key →
  Platform verifies key + balance →
  Allow access → Meter usage →
  Monthly invoice to AI company →
  Payout to publisher
```

#### 3.3 Content Access Marketplace

- Directory where AI companies discover publisher content
- Publishers list their content with pricing tiers
- AI companies subscribe to content feeds
- Platform facilitates the contract and payment

#### 3.4 Compliance & Audit

- EU AI Act compliance reports (AI training data transparency)
- Copyright audit trail: who accessed what, when
- DMCA takedown assistance for unauthorized scraping
- Legal-ready documentation for licensing disputes

---

## 3. Data Model Changes

### Phase 2 Additions

```sql
-- Rules engine
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  agent_pattern VARCHAR(255) NOT NULL,     -- regex or agent name
  action VARCHAR(20) NOT NULL,             -- allow | block | rate_limit | challenge | redirect
  config JSONB DEFAULT '{}',               -- action-specific configuration
  paths TEXT[] DEFAULT '{}',               -- glob patterns for URL matching
  schedule VARCHAR(100),                   -- cron expression (nullable)
  priority INT NOT NULL DEFAULT 100,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rules_site_priority ON rules(site_id, priority ASC);

-- Blocked/actioned requests log
CREATE TABLE rule_actions_log (
  id BIGSERIAL,
  site_id UUID NOT NULL,
  rule_id UUID REFERENCES rules(id) ON DELETE SET NULL,
  agent_name VARCHAR(100),
  url TEXT,
  action_taken VARCHAR(20) NOT NULL,
  response_code INT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

CREATE INDEX idx_rule_actions_site ON rule_actions_log(site_id, timestamp DESC);

-- Alert configuration
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,               -- new_agent | traffic_spike | rate_limit_hit
  channel VARCHAR(20) NOT NULL,            -- email | webhook | slack
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3 Additions

```sql
-- Metered access keys (for AI companies)
CREATE TABLE access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  consumer_name VARCHAR(255) NOT NULL,     -- AI company name
  api_key VARCHAR(64) UNIQUE NOT NULL,
  rate_limit INT,                          -- requests per hour
  price_per_1k DECIMAL(10,4),             -- price per 1,000 page accesses
  balance DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage metering
CREATE TABLE access_usage (
  id BIGSERIAL,
  access_key_id UUID NOT NULL REFERENCES access_keys(id),
  site_id UUID NOT NULL,
  pages_accessed INT NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL
) PARTITION BY RANGE (period_start);

-- Licensing reports
CREATE TABLE licensing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_data JSONB NOT NULL,              -- agent breakdown, page counts, estimated value
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Contracts

### Phase 2 — Rules API

```
POST   /rules                      # Create rule
GET    /rules?siteId=xxx           # List rules for site
PUT    /rules/:id                  # Update rule
DELETE /rules/:id                  # Delete rule
PATCH  /rules/:id/toggle           # Enable/disable rule
POST   /rules/reorder              # Reorder priorities

GET    /rules/preview?siteId=xxx   # Preview generated robots.txt
POST   /rules/deploy?siteId=xxx    # Deploy robots.txt to site
```

### Phase 2 — Enforcement API (Edge)

```
GET    /enforce?siteId=xxx&ua=xxx&path=xxx   # Edge middleware calls this
  → Response: { action: "allow" | "block" | "rate_limit", config: {} }
  → Must respond < 50ms (cached at edge)
```

### Phase 2 — Alerts API

```
POST   /alerts                     # Create alert
GET    /alerts?siteId=xxx          # List alerts
PUT    /alerts/:id                 # Update alert
DELETE /alerts/:id                 # Delete alert
```

### Phase 2 — Dashboard API Additions

```
GET    /analytics/blocked?siteId=xxx&range=7d     # Blocked requests stats
GET    /analytics/agents/:name?siteId=xxx          # Agent profile details
GET    /analytics/rule-hits?siteId=xxx&range=7d    # Rule action breakdown
```

### Phase 3 — Metered Access API

```
POST   /access-keys                # Create access key for AI consumer
GET    /access-keys?siteId=xxx     # List access keys
PUT    /access-keys/:id            # Update access key
DELETE /access-keys/:id            # Revoke access key

GET    /usage?siteId=xxx&period=2026-02   # Usage breakdown
GET    /reports?siteId=xxx                 # List licensing reports
POST   /reports/generate?siteId=xxx       # Generate report for period
```

---

## 5. Pricing Model (Updated)

| Plan | Price | Events/mo | Rules | Enforcement | Metered Access |
|------|-------|-----------|-------|-------------|----------------|
| **Free** | $0 | 10K | 3 rules | No | No |
| **Starter** | $29/mo | 100K | 10 rules | Edge middleware | No |
| **Pro** | $99/mo | 1M | Unlimited | Edge + DNS proxy | Yes |
| **Enterprise** | Custom | Unlimited | Unlimited | Full + SLA | Yes + marketplace |

**Metered Access revenue share:** Publisher 80% / Platform 20%

---

## 6. Competitive Moat

| Layer | What we build | Why it's hard to copy |
|-------|--------------|----------------------|
| **Data network effect** | More sites → better detection → more sites want to join | Takes time to accumulate |
| **AI agent behavior DB** | Largest dataset of AI agent crawling patterns | No one else is collecting this at scale |
| **Publisher relationships** | Direct integrations with content sites | Enterprise sales + trust takes years |
| **Rules ecosystem** | Community-shared rule templates | Network effect on rules |
| **Billing infrastructure** | Metered access + payouts | Complex to build, regulated |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Cloudflare adds "AI bot" tab | Lose analytics-only users | Phase 2 (control) differentiates us — they sell generic security, we sell AI-specific control |
| AI agents stop sending User-Agent | Layer 1 detection breaks | Invest in Layer 2+3 (behavioral + pattern) — this is our R&D edge |
| Market too niche | Low revenue ceiling | Phase 3 (monetization) expands TAM — we become payment infrastructure, not just analytics |
| AI companies refuse to pay | Phase 3 doesn't work | EU AI Act + copyright pressure forces compliance; Phase 2 still generates SaaS revenue independently |
| Publisher fatigue ("another tool") | Low adoption | Keep embed dead simple (1 line of code); show value in free tier immediately |

---

## 8. Technical Architecture (Phase 2)

```
                         Publisher's Website
                                │
                   ┌────────────┼────────────┐
                   │            │            │
              Edge Middleware   JS Tracker   DNS Proxy
                   │            │            │
                   └────────────┼────────────┘
                                │
                         POST /collect  or  GET /enforce
                                │
                    ┌───────────▼───────────────┐
                    │     Edge API (< 50ms)      │
                    │  ┌──────────────────────┐  │
                    │  │   Rules Cache (Redis) │  │
                    │  │   TTL: 60 seconds     │  │
                    │  └──────────────────────┘  │
                    └───────────┬───────────────┘
                                │
                    ┌───────────▼───────────────┐
                    │     Core API (NestJS)      │
                    │                            │
                    │  Rules Engine              │
                    │  Alert Service             │
                    │  Analytics Service         │
                    │  Enforcement Service       │
                    │                            │
                    │  BullMQ Workers:           │
                    │  - Process events          │
                    │  - Evaluate rules          │
                    │  - Send alerts             │
                    │  - Generate reports        │
                    └───────────┬───────────────┘
                                │
                    ┌───────────▼───────────────┐
                    │  PostgreSQL    Redis       │
                    │  (events,     (cache,      │
                    │   rules,      queues,      │
                    │   logs)       rate limits)  │
                    └───────────────────────────┘
```

---

## 9. Success Criteria

### Phase 1 (Track) — Month 1-3
- [ ] 100 registered sites
- [ ] 1M events ingested/month
- [ ] < 200ms P95 ingest latency
- [ ] < 1s dashboard load time

### Phase 2 (Control) — Month 4-8
- [ ] 30% of tracked sites use at least 1 rule
- [ ] 10% Free → Starter conversion
- [ ] 5% Starter → Pro conversion
- [ ] < 50ms edge enforcement latency
- [ ] $5K MRR

### Phase 3 (Monetize) — Month 9-14
- [ ] 5 publishers with active metered access
- [ ] 2 AI companies paying for content access
- [ ] $50K MRR (SaaS + metered revenue combined)
- [ ] First licensing report used in a real negotiation
