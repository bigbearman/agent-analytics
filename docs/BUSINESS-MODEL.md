# Business Model — AgentPulse

> Comprehensive business model for AgentPulse:
> "Google Analytics for the AI Shopping era"

---

## 1. Market Overview

### Total Addressable Market (TAM)

```
Global e-commerce stores:              ~26M active stores
├── Shopify:                           4.6M stores
├── WooCommerce:                       6.5M stores
├── Magento:                           ~250K stores
├── BigCommerce:                       ~60K stores
├── Wix Commerce:                      ~700K stores
└── Others (custom, regional):         ~14M stores

E-commerce analytics market (2026):    $8.4B
AI-specific commerce analytics:        Nascent (<$100M)
```

### Serviceable Addressable Market (SAM)

Stores that actively receive AI agent traffic AND would pay for analytics:

```
English-speaking Shopify + WooCommerce stores
with >$10K/month revenue AND measurable AI traffic:

  Shopify:        ~600K stores
  WooCommerce:    ~400K stores
  Others:         ~200K stores
  ─────────────────────────
  Total SAM:      ~1.2M stores
```

### Serviceable Obtainable Market (SOM) — Year 1

```
Realistic Year 1 target:
  5,000 free installs × 8% conversion = 400 paid stores
  400 paid × $79 avg MRR = $31,600 MRR = ~$380K ARR
```

---

## 2. Value Proposition

### For Store Owners (SMB, $0-10M revenue)

```
Before AgentPulse:
  "I got 3 orders from somewhere labeled 'chatgpt.com'.
   I don't know why, I can't see the funnel, and I can't
   optimize for it."

After AgentPulse:
  "ChatGPT Shopping drove $8,420 this month. My Nike products
   convert 3x better than Adidas because of richer descriptions.
   I fixed schema on 50 products and agent visits went up 23%."
```

**Core value:** Turn invisible AI commerce into a measurable, optimizable channel.

### For DTC Brands ($10M-100M revenue)

```
Before AgentPulse:
  "We spend $500K/month on ads. We know AI agents are sending
   some traffic but we can't attribute it. Our ROAS numbers
   are wrong."

After AgentPulse:
  "15% of our revenue is agent-attributed. ChatGPT Shopping
   has 2.9% conversion — better than paid search. We're
   shifting $50K/month budget to agent optimization."
```

**Core value:** Fix attribution blindspot. Discover a new high-ROI channel.

### For Agencies

```
Before AgentPulse:
  "Client asks 'how are we doing on AI shopping?'
   We have no data to show them."

After AgentPulse:
  "Here's your monthly AI commerce report: agent traffic +34%,
   agent revenue +22%, readiness score improved from 54 to 78.
   Your competitor dropped from #2 to #4 on ChatGPT Shopping."
```

**Core value:** New service offering with white-label reports.

---

## 3. Revenue Model

### 3.1 SaaS Subscription (Primary — 80% of revenue)

| Plan | Price | Stores | Products | Key Features |
|------|-------|--------|----------|--------------|
| **Free** | $0 | 1 | 100 | Agent dashboard, basic readiness score, 7-day retention |
| **Growth** | $49/mo | 3 | 1,000 | Full funnel, attribution, readiness optimizer, 90-day retention |
| **Pro** | $149/mo | 10 | 10,000 | Competitive intel, auto-fix, API access, 1-year retention |
| **Agency** | $399/mo | 50 | Unlimited | White-label, client reports, team seats, priority support |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom integrations, SLA, dedicated CSM |

**Annual discount:** 20% off (2 months free)

### Revenue projection (conservative):

```
Month 3:    200 free  ·  30 Growth  ·  5 Pro   = $2,215 MRR
Month 6:    800 free  ·  100 Growth · 20 Pro   = $7,880 MRR
Month 9:   2000 free  ·  250 Growth · 50 Pro   · 5 Agency  = $21,600 MRR
Month 12:  5000 free  ·  500 Growth · 120 Pro  · 15 Agency = $48,330 MRR
Month 18: 12000 free  · 1200 Growth · 300 Pro  · 40 Agency = $119,400 MRR
Month 24: 25000 free  · 2500 Growth · 600 Pro  · 80 Agency · 5 Enterprise
          = $283K+ MRR = $3.4M+ ARR
```

### 3.2 Shopify App Revenue Share

Shopify takes 0% on first $1M revenue, then 15% after.

```
Year 1: Likely under $1M → 0% cut
Year 2: If above $1M → 15% on overage
```

This is a great deal for distribution access to 4.6M stores.

### 3.3 Optimization Services Add-on (10% of revenue)

```
Product Data Optimization:
  - AI-powered product description rewriting
  - Auto-generate structured data
  - Schema validation and injection

Pricing: Credits-based
  - Growth plan: 100 credits/month included (1 credit = 1 product optimization)
  - Pro plan: 500 credits/month included
  - Additional credits: $0.10/credit
```

### 3.4 Competitive Intelligence Add-on (10% of revenue)

```
Tracked queries and competitor monitoring:
  - Growth plan: 10 tracked queries, 5 competitors
  - Pro plan: 50 tracked queries, 20 competitors
  - Additional: $2/query/month, $1/competitor/month
```

---

## 4. Unit Economics

### Customer Acquisition Cost (CAC)

```
Primary channels (organic/PLG):
  Shopify App Store:    $0 CAC (organic discovery)
  Free tool viral:      $0 CAC (word of mouth)
  Content marketing:    ~$15 CAC (SEO blog → signup)

Secondary channels (paid):
  Shopify App ads:      ~$30 CAC
  Google Ads:           ~$50 CAC

Blended CAC target:     $25
```

### Lifetime Value (LTV)

```
Average plan:           $79/month (weighted average)
Gross margin:           85% (infra costs ~15%)
Monthly churn:          5% (analytics tools typically 3-7%)
Average lifetime:       20 months (1 / churn rate)

LTV = $79 × 85% × 20 = $1,343

LTV:CAC ratio = $1,343 / $25 = 53:1
  (healthy is >3:1, this is exceptional due to PLG + App Store)
```

### Cost Structure

```
Per-store monthly cost (at scale):

  Infrastructure:
    Event ingestion:     $0.50  (avg 50K events/store/month)
    PostgreSQL storage:  $0.30  (partitioned, compressed)
    Redis cache:         $0.10
    BullMQ processing:   $0.20
    CDN (tracker JS):    $0.05
  ─────────────────────────────
  Infra per store:       $1.15/month

  AI Services:
    Readiness scoring:   $0.50  (crawl + analyze)
    Optimization gen:    $0.30  (LLM calls for suggestions)
    Competitive intel:   $1.00  (periodic AI platform queries)
  ─────────────────────────────
  AI per store:          $1.80/month

  Total COGS per store:  $2.95/month

  Revenue per paid store: $79/month (average)
  Gross margin:           96.3%
```

### Break-even Analysis

```
Fixed costs (monthly):
  Team (3 people):        $25,000
  Infrastructure base:    $2,000
  Tools & services:       $500
  ─────────────────────────────
  Total fixed:            $27,500/month

Break-even:
  $27,500 / ($79 - $2.95) = 362 paid customers

  At 8% free→paid conversion: need 4,525 free users
  Timeline: ~Month 8-10 (conservative)
```

---

## 5. Go-to-Market Strategy

### Phase 1: PLG Foundation (Month 1-3)

**Free Acquisition Tool: agentpulse.com/scan**

```
Input:  your-store.com
Output: Free instant report:
  - Agent traffic detected: 3 AI agents found
  - Top agents: ChatGPT Shopping (1,200 visits), Perplexity (340)
  - Readiness score: 54/100
  - Top 3 issues to fix
  → "Install AgentPulse for full analytics (free)"
```

This tool is the #1 acquisition engine:
- Store owners scan their own site
- Share results on Twitter/Reddit ("OMG ChatGPT visited my store 1,200 times")
- Viral loop: every share = new scans

**Shopify App Store Launch:**
- Category: Analytics
- Keywords: "AI analytics", "agent traffic", "ChatGPT shopping analytics"
- Free plan → install friction near zero
- Shopify App Store is #1 distribution channel for e-commerce tools

### Phase 2: Content & Community (Month 2-6)

**Data-driven blog posts:**

| Title | Hook | CTA |
|-------|------|-----|
| "How much AI agent traffic does your Shopify store get?" | Curiosity | Scan tool |
| "ChatGPT Shopping vs Google AI Mode: Which converts better?" | Comparison, data | Dashboard |
| "We analyzed 10,000 stores: here's what AI agents look for" | Data story | Readiness score |
| "Your product descriptions are invisible to AI agents" | Fear + fix | Optimizer |
| "The $3 trillion channel you're ignoring" | Opportunity | Full platform |

**Community presence:**
- r/shopify (286K members)
- r/ecommerce (157K members)
- Shopify Community forums
- Twitter/X e-commerce community
- YouTube: short tutorials "Fix your store for AI agents in 5 minutes"

### Phase 3: Product Hunt + HN (Month 3-4)

```
Product Hunt:
  "AgentPulse — Google Analytics for AI Shopping Agents"
  Target: #1 Product of the Day in Analytics/E-commerce

Hacker News:
  "Show HN: We built analytics for AI shopping agents
   (ChatGPT Shopping drives 25% of some stores' traffic)"
```

### Phase 4: Outreach & Partnerships (Month 4-8)

**Cold outreach with data:**
```
Subject: ChatGPT Shopping sent 1,200 visits to your store last month

Hi {name},

We scanned {store-url} and found:
- 3 AI shopping agents actively visiting your store
- ChatGPT Shopping: ~1,200 visits/month
- But your product data readiness score is only 54/100

Your competitor {competitor} scores 82/100 and gets 3x more
agent-driven purchases.

Free to scan: agentpulse.com/scan?store={store-url}

{name}
```

**Partnerships:**
- Shopify Plus agencies (they need tools for clients)
- E-commerce SEO agencies (new service offering)
- Shopify theme developers (bundle readiness features)
- E-commerce podcasts and newsletters

### Phase 5: Paid Acquisition (Month 8+)

Only after organic channels plateau:
- Shopify App Store ads (highest intent)
- Google Ads: "AI shopping analytics", "ChatGPT commerce tracking"
- Retargeting: scan tool users who didn't install

---

## 6. Customer Segments & Personas

### Persona 1: Indie Store Owner (Free → Growth)

```
Name:           Sarah
Store:          Handmade jewelry on Shopify, $15K/month revenue
Pain:           "I see some orders from ChatGPT but I don't understand it"
Behavior:       Installs free apps, upgrades if sees clear value
Conversion:     Free scan → Install free → See agent data → Upgrade to Growth
Timeline:       Free for 2 weeks, upgrades within Month 1
Revenue:        $49/month
```

### Persona 2: DTC Brand Manager (Growth → Pro)

```
Name:           Alex
Store:          DTC skincare brand, $500K/month revenue
Pain:           "Our ROAS calculations are off because we can't track AI traffic"
Behavior:       Evaluates tools for 2 weeks, needs ROI justification
Conversion:     Blog/referral → Free trial → Attribution report → Upgrade to Pro
Timeline:       Free trial 14 days, upgrades within Month 1
Revenue:        $149/month
```

### Persona 3: E-commerce Agency (Pro → Agency)

```
Name:           Marcus
Agency:         Manages 20 Shopify stores for clients
Pain:           "Clients ask about AI shopping and I have nothing to show"
Behavior:       Needs multi-store management, white-label reports
Conversion:     Podcast/conference → Demo → Agency plan
Timeline:       1-2 month evaluation, annual contract
Revenue:        $399/month ($4,788/year)
```

---

## 7. Competitive Positioning

### Direct Competitors (None doing exactly this)

| Player | What they do | Why we're different |
|--------|-------------|---------------------|
| Google Analytics | Human traffic analytics | Blind to AI agents (no cookies, no JS) |
| Shopify Analytics | Basic store analytics | Shows "chatgpt.com" as referrer, no funnel |
| Triple Whale | DTC analytics + attribution | Built for ads attribution, not agent commerce |
| Peel Insights | E-commerce analytics | No AI agent awareness |
| AgentReady (Shopify) | Readiness score only | No analytics, no attribution, no funnel |
| StoreMD (Shopify) | Markdown feed only | Content tool, not analytics |
| Known Agents | Bot tracking for publishers | Not e-commerce focused |
| MetaRouter | Server-side CDP | Enterprise-only ($50K+/year), not SMB |

### Positioning Statement

```
For e-commerce store owners
who need to understand and optimize AI-driven commerce,
AgentPulse is the analytics platform
that tracks how AI shopping agents discover, evaluate, and buy
from your store.

Unlike Google Analytics (blind to agents) or Shopify Analytics
(basic referrer only), AgentPulse provides full agent commerce
funnel visibility, product readiness scoring, and
AI-native attribution.
```

### Category Creation

We don't fit into existing categories. We create a new one:

```
Existing categories:
  - Web Analytics (GA, Plausible, Fathom)
  - E-commerce Analytics (Triple Whale, Peel)
  - Bot Management (Cloudflare, Vercel)
  - SEO Tools (Ahrefs, Semrush)

New category:
  → "AI Commerce Analytics"

  AgentPulse defines and owns this category.
```

---

## 8. Moat & Defensibility

### Data Network Effect (Primary Moat)

```
More stores → More agent behavior data → Better benchmarks & insights
  → More stores want to join → More data → ...

Specific advantages:
  - Cross-store agent behavior patterns
  - Category-level benchmarks ("avg agent conversion in footwear: 2.1%")
  - Agent algorithm change detection
  - Predictive models trained on aggregate data
```

### Integration Depth (Secondary Moat)

```
Once a store connects:
  - Historical data accumulates (can't replicate)
  - Attribution models improve over time
  - Readiness optimizations are tracked
  - Switching cost increases every month
```

### Domain Expertise (Tertiary Moat)

```
Deep knowledge of:
  - How each AI shopping agent works (ChatGPT vs Perplexity vs Google)
  - What product data each agent needs
  - How agent algorithms change over time
  - Commerce-specific detection techniques

This expertise compounds and is hard to replicate quickly.
```

---

## 9. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Shopify builds this natively | Medium | High | Stay 2 steps ahead: competitive intel + optimization are harder to build. Shopify is platform, we're tool layer. |
| AI agents stop identifying themselves | Low | High | Invest in behavioral detection (Layer 2+3+4). Commerce signals (orders, referrers) always visible. |
| Market too early, merchants don't care yet | Medium | Medium | Free tier costs near-zero to serve. Stay alive until market matures. Data compounds. |
| Triple Whale / GA adds AI features | Medium | Medium | They optimize for ads attribution. Agent commerce is fundamentally different (server-side, no cookies). Pivot advantage. |
| Low conversion free → paid | Medium | Medium | Keep free tier useful enough for WOM. Optimize upgrade triggers (show value they're missing). |
| Attribution accuracy concerns | Medium | Medium | Transparent methodology. Show confidence scores. Server-side + webhook triangulation. |

---

## 10. Team & Hiring Plan

### Phase 1 (Month 1-6): Founding Team

```
Needed:
  1. Full-stack engineer (you — NestJS + React)
  2. Growth/marketing person (content + community)
  → Total: 2 people, ~$8K/month burn (lean)
```

### Phase 2 (Month 7-12): First Hires

```
After $10K+ MRR:
  3. Backend engineer (data pipeline, scale)
  4. Shopify app specialist (app store optimization)
  → Total: 4 people, ~$20K/month burn
```

### Phase 3 (Month 13-18): Growth Team

```
After $50K+ MRR:
  5. Data scientist (attribution models, competitive intel)
  6. Customer success
  7. Sales (agency/enterprise)
  → Total: 7 people, ~$45K/month burn
```

---

## 11. Fundraising Outlook

### Bootstrap First (Month 1-12)

```
Strategy: Bootstrap to $30K+ MRR before raising
Reason:
  - Proves market demand
  - Better valuation (revenue-based, not idea-based)
  - Maintains control
  - E-commerce SaaS can bootstrap profitably

Examples:
  - Triple Whale: bootstrapped to $100M+ ARR
  - Plausible Analytics: bootstrapped to $1M+ ARR
  - Fathom Analytics: bootstrapped to $1M+ ARR
```

### Optional Seed Round (Month 12-18)

```
If choosing to raise:
  Target:     $1-2M seed
  Valuation:  $10-15M (at $300K+ ARR, standard 30-50x for high-growth SaaS)
  Use of funds:
    - Hire 5 people (engineering + growth)
    - Scale infrastructure
    - Paid acquisition experiments
    - WooCommerce + additional platform integrations

  Target investors:
    - Shopify Ventures (strategic)
    - SaaStr Fund (SaaS focus)
    - Point Nine Capital (SaaS, e-commerce)
    - Y Combinator (if applying)
```

---

## 12. Key Metrics to Track

### North Star

**Agent-Attributed Revenue (AAR):** Total revenue tracked through AgentPulse across all stores.

### Growth Metrics

| Metric | Target M3 | Target M6 | Target M12 |
|--------|-----------|-----------|------------|
| Free installs | 200 | 800 | 5,000 |
| Paid customers | 30 | 120 | 635 |
| MRR | $2.2K | $7.9K | $48.3K |
| Free→Paid conversion | 6% | 8% | 10% |
| Monthly churn | <8% | <6% | <5% |

### Product Metrics

| Metric | Target |
|--------|--------|
| Time to first insight | < 5 minutes after install |
| Scan tool completion rate | > 60% |
| Scan → Install conversion | > 15% |
| Weekly active stores | > 40% of installs |
| Feature adoption (funnel) | > 30% of paid |
| Feature adoption (readiness) | > 50% of paid |
| NPS | > 40 |

### Unit Economics Metrics

| Metric | Target |
|--------|--------|
| Blended CAC | < $30 |
| LTV | > $1,000 |
| LTV:CAC | > 30:1 |
| Gross margin | > 85% |
| Payback period | < 2 months |

---

## 13. 18-Month Financial Projection

```
                M1    M3     M6     M9     M12    M15    M18
─────────────────────────────────────────────────────────────
Free users      50    200    800   2,000   5,000  8,000  12,000
Paid users       5     35    120     305     635   1,050  1,600
  Growth ($49)   5     30    100     250     500    850   1,200
  Pro ($149)     0      5     20      50     120    180    300
  Agency ($399)  0      0      0       5      15     20     40
  Enterprise     0      0      0       0       0      0      5

MRR           $245  $2.2K  $7.9K  $21.6K  $48.3K  $82K  $133K
ARR          $2.9K  $26K   $95K   $259K   $580K   $984K  $1.6M
─────────────────────────────────────────────────────────────
Monthly costs $3K   $5K    $10K   $20K    $27K    $35K   $45K
Net          -$2.8K -$2.8K -$2.1K +$1.6K +$21.3K +$47K +$88K
─────────────────────────────────────────────────────────────
Profitable at:  Month ~8-9 (break-even)
```

---

## 14. Exit Scenarios (Long-term)

| Scenario | Timeline | Valuation Range | Likely Acquirer |
|----------|----------|----------------|-----------------|
| Acquisition by e-commerce platform | Year 2-3 | $10-30M | Shopify, BigCommerce |
| Acquisition by analytics company | Year 3-4 | $20-50M | Triple Whale, Amplitude |
| Acquisition by AI company | Year 2-3 | $15-40M | OpenAI, Google |
| Independent growth to $10M+ ARR | Year 4-5 | $100M+ | IPO or late-stage |
| Bootstrap lifestyle business | Ongoing | N/A | $3-5M ARR, profitable |

Most likely path: Build to $3-5M ARR → acquisition by Shopify or analytics platform
at 10-15x revenue ($30-75M).
