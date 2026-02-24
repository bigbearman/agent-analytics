# AgentPulse — Business Model

> **Date:** 2026-02-24
> **Status:** Active
> **Companion:** SPEC-v3.md

---

## 1. What Is AgentPulse?

**AI traffic intelligence platform for developers and SMBs.**

Website owners install a JS snippet or server SDK to understand how AI bots interact with their content — which pages AI crawls most, which AI engines cite them, and how to optimize for AI visibility.

**One-liner:** Google Analytics for AI traffic.

---

## 2. Market Analysis

### 2.1 Market Size

| Level | Scope | Size |
|-------|-------|------|
| **TAM** | All websites with professional analytics tracking (~5M sites × $50/yr avg) | $250M/year |
| **SAM** | English-speaking sites where owner knows about AI traffic (~3.5M) | $140M/year |
| **SOM Year 1** | Realistic first-year capture (60-150 paid at $35 ARPU) | $25K-$63K ARR |

This is a **new category**. The AI agent market is $7.6B (2025) → projected $50B+ by 2030 (MarketsandMarkets), but "AI traffic analytics" is a niche within that. We don't claim the whole market — we claim the analytics tooling layer.

### 2.2 Competitive Landscape

#### Direct Competitors

| Competitor | Description | Pricing | Strength | Weakness |
|-----------|-------------|---------|----------|----------|
| **Profound** | Full AI traffic intelligence. $58.5M raised (Sequoia). Serves Fortune 500 (Ramp, MongoDB, DocuSign). | Enterprise-only. Must "apply for access." | Best data: proprietary CDN partnerships (Cloudflare, Vercel, Fastly, Akamai). 3 datasets: prompts to 10 AI engines daily, CDN logs (billions), 130M conversations. | No SMB/dev tier. No self-serve. No public pricing. Excludes 99% of market. |
| **Known Agents (Dark Visitors)** | WordPress plugin + bot database. Tracks AI crawlers, manages robots.txt. | Free (most users). Paid tiers available. | Largest bot database (industry "gold standard"). WordPress plugin with thousands of installs. Strong community. | WordPress-only. Basic tracking — no analytics, no scores, no referral tracking. No developer SDK. |
| **aibottracker.com** | Simple free tool. 2,000+ sites using it. | Free | Easy setup. Low barrier. | Very basic. No analytics depth. No paid tier. |

#### Platform Threats (Free Built-in Features)

| Platform | Feature | Coverage | Limitation |
|----------|---------|----------|------------|
| **Cloudflare AI Crawl Control** | Detect + block AI bots. Dashboard shows crawler activity. Free for all Cloudflare users. "Pay per crawl" in beta. | ~20% of all websites (massive reach) | Detection only. No page-level analysis. No AI scores. No referral tracking. No cross-platform. |
| **Vercel BotID** | Bot detection + analytics dashboard. Built into Vercel platform. | Vercel-hosted sites only | Platform-locked. No self-hosted support. Pro/Enterprise plans only. |

#### Adjacent Market (AI Visibility / GEO / AEO Tools)

These tools answer "What is AI saying about my brand?" — different from our question "What is AI doing on my website?"

| Tool | Pricing | Focus |
|------|---------|-------|
| **Otterly AI** | $29-$989/mo | Brand monitoring, GEO audit, prompt tracking |
| **Peec AI** | €89-€499/mo | Multi-engine share-of-voice, competitor tracking |
| **AthenaHQ** | ~$295/mo | Deep GEO analysis, action center |
| **Rankscale** | $20/mo | Daily basics, budget option |
| **SE Ranking** | Suite-based | AI Visibility as add-on to SEO suite |

These are potential **partners** (integrate AI traffic data into their tools), not direct competitors.

#### Internal AI Agent Observability (Different Market)

Langfuse, LangSmith, Arize, Datadog LLM, AgentOps — these track agents you BUILD, not agents visiting your WEBSITE. Different market entirely.

### 2.3 Where We Fit

```
                 Enterprise         Mid-Market          SMB/Dev
                 ($1000+/mo)       ($100-500/mo)       ($0-149/mo)
                ┌───────────────┬──────────────────┬─────────────────┐
CDN/Edge        │ Profound      │ Botify           │                 │
server logs     │               │ seoClarity       │  No solution    │
                ├───────────────┼──────────────────┼─────────────────┤
Platform        │ Cloudflare    │ Cloudflare       │ Cloudflare FREE │
built-in        │ Bot Mgmt      │ AI Crawl Control │ (detect only)   │
                │ Vercel BotID  │                  │                 │
                ├───────────────┼──────────────────┼─────────────────┤
Standalone      │               │                  │ Known Agents    │
tracking        │               │                  │ aibottracker    │
                ├───────────────┼──────────────────┼─────────────────┤
Analytics +     │ Profound      │                  │                 │
Intelligence    │               │  NO SOLUTION     │  NO SOLUTION    │
                │               │                  │  ← AgentPulse   │
                └───────────────┴──────────────────┴─────────────────┘
```

**Our position:** Analytics + intelligence layer for SMB/dev tier — the gap nobody fills.

### 2.4 Competitive Advantages

| Advantage | vs Profound | vs Cloudflare | vs Known Agents |
|-----------|-----------|---------------|-----------------|
| **Price** | $0-149 vs enterprise-only | Free tier matches; paid adds analytics | Similar free; paid adds intelligence |
| **Multi-platform** | Both multi-platform | Cloudflare-only | WordPress-only |
| **Page-level analysis** | Profound has this | Cloudflare doesn't | Known Agents doesn't |
| **AI referral tracking** | Profound has this | Cloudflare doesn't | Known Agents doesn't |
| **Content AI Score** | Profound has similar | Cloudflare doesn't | Known Agents doesn't |
| **Developer SDK** | Profound has CDN integrations | N/A | Known Agents doesn't |
| **Self-hosted support** | Profound: no | Cloudflare: no | Known Agents: WordPress only |
| **Data depth** | Profound has 3 proprietary datasets. We don't. | Cloudflare sees all traffic. We don't. | We have more depth. |

**Honest weakness:** Profound and Cloudflare have data advantages we can't match. We win on **accessibility** (price + multi-platform + developer UX), not on raw data power.

---

## 3. Revenue Model

### 3.1 Freemium SaaS Subscription

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   FREE            STARTER          PRO            BUSINESS  │
│   $0/mo           $19/mo           $49/mo         $149/mo   │
│                   ($190/yr)        ($490/yr)      ($1490/yr)│
│                                                              │
│   1 site          3 sites          10 sites       Unlimited │
│   10K events      100K events      500K events    5M events │
│   7 days data     30 days          90 days        1 year    │
│                                                              │
│   Basic overview  Full dashboard   + AI Scores    + White   │
│   Agent detect    Page analysis    + API access     label   │
│   Weekly email    AI referrals     + Exports      + Team    │
│                   Alerts           + Recommends   + Agency  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Pricing Rationale

| Factor | Price Impact | Source |
|--------|-------------|--------|
| Cloudflare AI Crawl Control = free | Can't charge for basic detection. Free tier must include detection. | Cloudflare gives it to ~20% of all sites |
| Known Agents free tier covers most needs | Free tier must be generous enough to compete | Thousands of WordPress installs on free |
| Profound = $1000s+/mo enterprise-only | Huge gap between free and enterprise = opportunity | Must "apply for access" |
| Dev tools (Plausible, Fathom) = $9-19/mo | $19 Starter aligns with developer tool pricing | Developer willingness to pay |
| Analytics tools (Mixpanel, Amplitude) = $0-99/mo | $49 Pro aligns with analytics tool tier | Marketing/SEO team budgets |
| SEO tools (Ahrefs, SEMrush) = $99-449/mo | $149 Business is affordable for agencies already paying $100s | Agency budget benchmark |

### 3.3 Annual Discount

20% off annual plans (pay 10, get 12):
- Starter: $190/year ($15.83/mo effective)
- Pro: $490/year ($40.83/mo effective)
- Business: $1,490/year ($124.17/mo effective)

### 3.4 Upgrade Triggers

| Transition | Trigger | Timeline |
|-----------|---------|----------|
| Free → Starter | Hit 10K event limit or need >7 days history | 2-4 weeks after install |
| Starter → Pro | Want Content AI Scores, API access, exports | 2-3 months after Starter |
| Pro → Business | Agency needs white-label + team for clients | Often direct signup |

---

## 4. Unit Economics

### 4.1 Cost Structure

```
Per free user:           ~$0.05/month
  PostgreSQL storage:    $0.02
  Redis cache:           $0.01
  BullMQ processing:     $0.01
  Bandwidth:             $0.01

Per paid user:           ~$0.50/month (10x more events)
  PostgreSQL storage:    $0.20
  Redis cache:           $0.10
  BullMQ processing:     $0.10
  Bandwidth:             $0.10

Stripe fees:             ~3% of payment
```

### 4.2 ARPU

```
Customer mix (steady state):
  60% Starter ($19)   → contributes $11.40
  30% Pro ($49)       → contributes $14.70
  10% Business ($149) → contributes $14.90

Blended ARPU = ~$41/month
With annual discounts (30% on annual): ~$37/month effective
```

### 4.3 Key Metrics

```
ARPU:                $37/month
COGS per customer:   $1.55/month (infra + Stripe)
Gross margin:        95.8%

CAC (blended):       $30
  Organic/SEO:       $0
  Product Hunt:      $5
  Dev community:     $10
  Paid ads:          $80
  Blended average:   ~$30

Customer lifetime:   14 months (at 7% monthly churn)
LTV:                 $37 × 14 = $518
LTV:CAC:             17:1

Payback period:      < 1 month
```

### 4.4 Benchmarks vs. Industry

| Metric | AgentPulse | Healthy SaaS | Notes |
|--------|-----------|-------------|-------|
| Gross margin | 95.8% | >70% | Excellent — low infra cost |
| LTV:CAC | 17:1 | >3:1 | Strong — organic-heavy acquisition |
| Monthly churn | 7% (est.) | <5% ideal | Higher than ideal — dev tools churn more |
| Payback period | <1 month | <12 months | Excellent — organic acquisition |

---

## 5. Financial Projections

### 5.1 Fixed Costs by Phase

```
Phase 1 (Month 1-4): Bootstrap
├── Infrastructure (Railway + Vercel + R2):  $50/month
├── Domain + email:                          $20/month
├── Tools (GitHub, analytics):               $30/month
└── TOTAL: $100/month (team works on equity, no salaries)

Phase 2 (Month 5-8): Early Revenue
├── Infrastructure:                          $200/month
├── Tools + services:                        $100/month
├── Part-time contractor (frontend):         $2,000/month
└── TOTAL: $2,300/month

Phase 3 (Month 9-12): Growth
├── Infrastructure:                          $500/month
├── Tools + services:                        $200/month
├── 1 full-time developer:                   $4,000/month
├── Marketing budget:                        $500/month
└── TOTAL: $5,200/month
```

### 5.2 Break-Even Analysis

```
Phase 1: $100 / $35.45 margin  =   3 paid customers
Phase 2: $2,300 / $35.45       =  65 paid customers
Phase 3: $5,200 / $35.45       = 147 paid customers
```

### 5.3 Revenue Projections — 3 Scenarios

**Conservative (base case):**

```
         Free    Paid   MRR      Costs    Profit   Cum.Profit
Month 1:   50      2    $74      $100     -$26     -$26
Month 2:  120      4    $148     $100     +$48     +$22
Month 3:  300      9    $333     $100     +$233    +$255
Month 4:  600     18    $666     $100     +$566    +$821
Month 5:  900     27    $999     $2,300   -$1,301  -$480
Month 6: 1,300    42    $1,554   $2,300   -$746    -$1,226
Month 7: 1,800    58    $2,146   $2,300   -$154    -$1,380
Month 8: 2,300    72    $2,664   $2,300   +$364    -$1,016
Month 9: 2,800    87    $3,219   $5,200   -$1,981  -$2,997
Month10: 3,400   105    $3,885   $5,200   -$1,315  -$4,312
Month11: 4,000   125    $4,625   $5,200   -$575    -$4,887
Month12: 4,800   148    $5,476   $5,200   +$276    -$4,611
Month15: 7,000   220    $8,140   $5,200   +$2,940  -$1,451
Month18:10,000   320   $11,840   $5,200   +$6,640  +$8,769
```

**Optimistic (viral moment / strong Product Hunt):**

```
         Free    Paid   MRR
Month 6: 3,000    90    $3,330
Month12: 12,000  380   $14,060
Month18: 25,000  800   $29,600
```

**Pessimistic (slow growth, high churn):**

```
         Free    Paid   MRR
Month 6:   500    12    $444
Month12: 2,000    48    $1,776
Month18: 4,000    80    $2,960
```

### 5.4 Key Milestones

| Milestone | Conservative | Optimistic |
|-----------|-------------|------------|
| First paid customer | Month 1 | Month 1 |
| $1K MRR | Month 5 | Month 3 |
| Phase 2 break-even (65 paid) | Month 8 | Month 5 |
| $5K MRR | Month 12 | Month 7 |
| Phase 3 break-even (147 paid) | Month 12 | Month 8 |
| $10K MRR | Month 16 | Month 10 |

---

## 6. Go-to-Market Strategy

### 6.1 Phase 1: Developer-First Launch (Month 1-3)

**Why developers first:**
- Install snippets/SDKs themselves (no sales team needed)
- Share tools organically (Twitter, blogs, GitHub stars)
- Low CAC ($0-10 for organic)
- Technical enough to see value immediately

**Channels:**

| Week | Action | Expected Impact |
|------|--------|----------------|
| 1-2 | Ship MVP + landing page (agentpulse.com) | Foundation |
| 3 | Hacker News "Show HN" post | 50-200 installs if front-page |
| 4 | Product Hunt launch | 100-500 installs if top 5 |
| 5-6 | Dev.to + Medium articles about AI traffic data | SEO seeds + community |
| 7-8 | Reddit (r/webdev, r/selfhosted, r/seo) + Twitter threads | Community reach |

**Content angles:**
- "I analyzed AI crawler behavior on 100 websites — here's what I found"
- "How to see which AI bots are crawling your site (and what they want)"
- "GPTBot vs ClaudeBot: which AI engine cares about your content more?"

### 6.2 Phase 2: Content Marketing + SEO (Month 3-6)

**Target keywords** (low competition, growing search volume):
```
"AI bot traffic analytics"
"track AI crawlers on website"
"AI traffic to my website"
"chatgpt bot tracking"
"how to see AI bot visits"
"AI referral traffic"
"optimize content for AI"
"llms.txt generator"
```

**Content strategy:**
- Weekly blog post with real AI traffic data/insights
- **Free tool: "AI Bot Traffic Scanner"** — scan any URL, get instant report. Lead gen machine.
- Monthly "State of AI Traffic" report — builds authority, gets press mentions
- Comparison pages: "AgentPulse vs Cloudflare AI Crawl Control", "AgentPulse vs Known Agents"

### 6.3 Phase 3: SEO/Agency Partnerships (Month 6-12)

- Partner with SEO agencies — they need AI traffic reports for clients
- White-label drives Business tier ($149/mo) adoption
- Integration partnerships with SEO tools (Ahrefs, SEMrush API integration)
- Conference talks/webinars about AI traffic trends

### 6.4 Phase 4: Paid Acquisition (Month 9+)

Only after unit economics validated at LTV:CAC > 5:1:
- Google Ads for high-intent keywords
- Newsletter sponsorships (TLDR, Bytes, SEO newsletters)
- Retargeting free users who didn't convert

---

## 7. Key Metrics & North Star

### North Star Metric

**Active Sites with AI Traffic Detected**

Measures real value delivery. A site actively detecting AI traffic = engaged user.

### Dashboard

| Category | Metric | Target M3 | Target M6 | Target M12 |
|----------|--------|-----------|-----------|------------|
| **Growth** | Free installs | 300 | 1,300 | 4,800 |
| **Growth** | Active sites (weekly) | 100 | 400 | 1,500 |
| **Revenue** | Paid customers | 9 | 42 | 148 |
| **Revenue** | MRR | $333 | $1,554 | $5,476 |
| **Conversion** | Free → Paid | 3% | 3.2% | 3.1% |
| **Health** | Monthly churn | <10% | <8% | <7% |
| **Health** | Time to value | <5 min | <5 min | <3 min |
| **Health** | NPS | >30 | >40 | >50 |
| **Economics** | ARPU | $37 | $37 | $37 |
| **Economics** | CAC | <$30 | <$30 | <$30 |
| **Economics** | LTV:CAC | >10:1 | >12:1 | >15:1 |

---

## 8. Competitive Moat Strategy

### Short-term (6-12 months)

1. **Speed to market** — Ship full analytics while competitors only offer detection
2. **Multi-platform SDK** — Works on any hosting (Cloudflare-only, WordPress-only can't match)
3. **Analytics depth** — Page-level analysis, AI scores, referral tracking = different product category
4. **Developer UX** — npm install, 3-line setup, instant value

### Medium-term (1-2 years)

1. **Data network effect** — More sites → better AI traffic benchmarks → attracts more sites
2. **Content AI Score standard** — If widely adopted, becomes THE metric for AI-friendliness
3. **Agency lock-in** — Once agencies white-label for clients, high switching cost
4. **SDK ecosystem** — SDKs for every platform = developer default choice

### What We DON'T Have (honest)

- No proprietary data source (Profound has CDN partnerships)
- No enterprise brand recognition
- No patents or deep technical moat
- Vulnerable to Cloudflare adding analytics features

---

## 9. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Cloudflare adds analytics** to AI Crawl Control | 40% | HIGH | Differentiate on cross-platform support + content intelligence depth. Cloudflare analytics will be basic. |
| **Known Agents adds analytics** dashboard | 30% | MEDIUM | They're WordPress-focused with robots.txt as core. Our SDK approach for developers is different. |
| **"Nice to have, not must-have"** — people don't pay | 35% | HIGH | Validate willingness to pay by Month 4. If conversion <1.5% → pivot to Content AI Score standalone. |
| **AI bots start hiding** (no UA strings) | 20% | HIGH | Invest in behavioral detection (Layer 2+3). Server-side SDK detects at middleware level. |
| **Low conversion** — free tier too generous | 30% | MEDIUM | Adjust free limits (gate page-level analysis, reduce retention to 3 days). |
| **Team bandwidth** — side project, slow | 40% | MEDIUM | Focus ruthlessly on Phase 1. Ship small, iterate fast. No feature creep. |
| **Profound moves down-market** | 20% | HIGH | Move fast on developer experience + multi-platform SDKs. Lock in developer community before they can react. |

---

## 10. Team & Resources

### Phase 1 (Month 1-4): Founders

```
Backend + infrastructure + server SDK:   Person 1
Frontend dashboard + tracker:            Person 2
Time: Side project, 15-20 hours/week each
Cost: $0 salary, $100/mo infrastructure
```

### Phase 2 (Month 5-8): First Hire

```
+ Part-time frontend contractor: Dashboard polish, landing page
Trigger: >30 paid customers OR >$1K MRR
Cost: $2,000-3,000/month
```

### Phase 3 (Month 9-12): Small Team

```
+ Full-time developer: SDKs, integrations, scale
+ Part-time content writer: Blog, SEO, documentation
Trigger: >100 paid customers OR >$4K MRR
Cost: $5,000-6,000/month
```

---

## 11. Pivot Paths

If primary direction doesn't gain traction:

### Pivot A: "Content AI Score" Standalone

- Drop tracking → focus on on-demand page scanning
- "Lighthouse for AI visibility" — scan any URL, get AI readiness score
- Pricing: per-scan ($0.10) or subscription for monitoring
- **When:** Tracking installs OK but nobody pays for analytics

### Pivot B: "AI Traffic API" (B2B)

- Sell aggregated AI traffic benchmarks as API
- Customers: SEO tools, marketing platforms, agencies
- Pricing: API calls or enterprise license
- **When:** 1,000+ sites installed but individual willingness to pay is low

### Pivot C: "AI Referral Attribution"

- Position as "UTM for AI traffic"
- Deep GA4/Mixpanel/Amplitude integration
- Pricing: based on tracked referrals
- **When:** Referral tracking is the most loved feature, other features underused

---

## 12. Exit Scenarios

| Scenario | Timeline | Trigger | Range |
|----------|----------|---------|-------|
| **Acqui-hire by SEO company** (Ahrefs, SEMrush, Moz) | 2-3 years | 500+ paid, strong niche brand | $1-5M |
| **Acquisition by platform** (Cloudflare, Vercel, HubSpot) | 3-5 years | 2,000+ paid, $200K+ ARR, data moat | $5-20M |
| **Lifestyle SaaS** | 12-18 months | 250-500 paid at $40 ARPU = $10-20K MRR | Sustainable income, no fundraising needed |
