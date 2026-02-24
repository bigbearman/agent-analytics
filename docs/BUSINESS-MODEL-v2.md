# AgentPulse — Business Model v2

> **Version:** 2.0
> **Date:** 2026-02-24
> **Status:** Active
> **Previous:** BUSINESS-MODEL.md (e-commerce focused — deprecated)
> **Companion:** SPEC-v3.md

---

## What Changed from v1?

| | Business Model v1 | Business Model v2 |
|---|---|---|
| **Target** | E-commerce stores (Shopify) | Developers, content sites, SMBs |
| **Revenue** | Shopify App subscription | Direct SaaS subscription |
| **Pricing** | $49-$399/mo | $19-$149/mo |
| **Y1 MRR projection** | $48K (fantasy) | $8-12K (realistic) |
| **Break-even** | Month 8 (unlikely) | Month 10-14 (realistic) |
| **Team required** | Need Shopify expertise | Current team sufficient |
| **Code readiness** | 0% built | 70% built |
| **GTM** | Shopify App Store | Dev communities + content marketing |

---

## 1. Market Sizing — Honest Numbers

### TAM (Total Addressable Market)

Every website with meaningful traffic could use AI traffic analytics.

```
~200M active websites globally
~20M with >1000 visits/month (relevant traffic)
~5M run by professionals who track analytics
```

TAM = 5M websites × $50/year average = **$250M/year**

But this is a new category. Realistic ceiling is much lower.

### SAM (Serviceable Addressable Market)

Websites where owner:
1. Knows AI traffic exists (growing awareness)
2. Can install a tracking snippet or SDK
3. Reads English (initial market)

```
~500K developer blogs/docs sites
~2M content/media sites
~1M marketing/SEO-aware businesses
= ~3.5M potential sites
```

SAM = 3.5M × $40/year = **$140M/year**

### SOM (Serviceable Obtainable Market) — Year 1

Realistic first-year capture:

```
Free installs:         2,000-5,000 (from dev community + content marketing)
Free → Paid conversion: 2-4%
Paid customers:        60-150
ARPU:                  $35/month (mix of Starter + Pro)
```

SOM Year 1 = **$25K-$63K ARR** ($2-5K MRR)

---

## 2. Revenue Model: Freemium SaaS

### 2.1 Pricing Tiers

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

### Pricing Rationale

| Factor | Impact on Price |
|--------|----------------|
| Cloudflare AI Crawl Control is free | Can't charge for basic detection |
| Known Agents free tier covers most needs | Free tier must be generous |
| Profound enterprise = $1000s/mo | Big gap between free and enterprise |
| Dev tools typically $10-50/mo | $19 Starter is competitive |
| Analytics tools (Plausible, Fathom) = $9-19/mo | $49 Pro reasonable for more features |
| SEO tools (Ahrefs, SEMrush) = $99-449/mo | $149 Business for agencies is affordable |

### Annual Discount

20% off annual plans (pay 10 months, get 12):
- Starter: $190/year ($15.83/mo effective)
- Pro: $490/year ($40.83/mo effective)
- Business: $1,490/year ($124.17/mo effective)

---

## 3. Unit Economics

### Cost Per Customer

```
Infrastructure cost per free user:     ~$0.05/month
  - PostgreSQL storage: $0.02
  - Redis cache: $0.01
  - BullMQ processing: $0.01
  - Bandwidth: $0.01

Infrastructure cost per paid user:     ~$0.50/month (10x more events)
  - PostgreSQL storage: $0.20
  - Redis cache: $0.10
  - BullMQ processing: $0.10
  - Bandwidth: $0.10

Stripe fees per paid user:             ~3% = $1.05/month (at $35 ARPU)
```

### ARPU Projection

```
Customer mix assumption (steady state):
  60% Starter ($19)  → contributes $11.40
  30% Pro ($49)      → contributes $14.70
  10% Business ($149)→ contributes $14.90

Blended ARPU = ~$41/month

With annual discounts (30% annual):
  Effective ARPU = ~$37/month
```

### Unit Economics Summary

```
ARPU:                $37/month
COGS per customer:   $1.55/month (infra + Stripe)
Gross margin:        $35.45/month (95.8%)

CAC (blended):       $30
  - Organic/SEO:     $0 (content marketing)
  - Product Hunt:    $5 (one-time)
  - Dev community:   $10 (time investment)
  - Paid ads:        $80 (small experiments)
  - Blended:         ~$30

Customer lifetime:   14 months (churn 7%/month)
LTV:                 $37 × 14 = $518
LTV:CAC:             17:1 ✅

Payback period:      < 1 month (ARPU > CAC, organic-heavy)
```

### Why These Numbers Are Conservative

| v1 Assumption | v2 Assumption | Reason |
|---|---|---|
| CAC $25 | CAC $30 | Some paid experiments needed |
| ARPU $79 | ARPU $37 | Lower pricing, more Starter mix |
| Churn 5%/mo | Churn 7%/mo | Dev tools churn higher |
| LTV $960 | LTV $518 | Lower price × shorter lifetime |
| LTV:CAC 19:1 | LTV:CAC 17:1 | Still healthy |
| Conversion 4% | Conversion 3% | Free alternatives exist |

---

## 4. Fixed Costs & Break-Even

### Monthly Fixed Costs

```
Phase 1 (Month 1-4): Bootstrap
├── Infrastructure (Railway + Vercel + R2):  $50/month
├── Domain + email:                          $20/month
├── Tools (GitHub, analytics):               $30/month
└── TOTAL:                                   $100/month
    (Team works on equity/side-project, no salaries)

Phase 2 (Month 5-8): Early Revenue
├── Infrastructure:                          $200/month
├── Tools + services:                        $100/month
├── Part-time contractor (frontend):         $2,000/month
└── TOTAL:                                   $2,300/month

Phase 3 (Month 9-12): Growth
├── Infrastructure:                          $500/month
├── Tools + services:                        $200/month
├── 1 full-time dev:                         $4,000/month
├── Marketing budget:                        $500/month
└── TOTAL:                                   $5,200/month
```

### Break-Even Analysis

```
Phase 1 break-even: $100 / $35.45 margin = 3 paid customers
Phase 2 break-even: $2,300 / $35.45 = 65 paid customers
Phase 3 break-even: $5,200 / $35.45 = 147 paid customers
```

At Phase 2 (month 5-8), need ~65 paid customers to break even.
At 3% conversion of free users: need ~2,200 free users → achievable by month 8-10.

---

## 5. Financial Projection — 18 Months

### Conservative Scenario

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

### Optimistic Scenario (viral moment / strong Product Hunt)

```
         Free    Paid   MRR
Month 6: 3,000    90    $3,330
Month12: 12,000  380   $14,060
Month18: 25,000  800   $29,600
```

### Pessimistic Scenario (slow growth, high churn)

```
         Free    Paid   MRR
Month 6:   500    12    $444
Month12: 2,000    48    $1,776
Month18: 4,000    80    $2,960
```

---

## 6. Go-to-Market Strategy

### Phase 1: Developer-First Launch (Month 1-3)

**Channel: Dev communities**

```
Week 1-2: Ship MVP + landing page
Week 3:   "Show HN" post on Hacker News
Week 4:   Product Hunt launch
Week 5-6: Dev.to + Medium articles:
          "I built an open-source alternative to Cloudflare AI Crawl Control"
          "How to track AI bot traffic on your website"
          "What I learned analyzing AI crawler behavior on my blog"
Week 7-8: Reddit (r/webdev, r/selfhosted, r/seo)
          Twitter/X threads about AI traffic data
```

**Why dev-first:**
- Developers install snippets/SDKs themselves
- Developers share tools with each other
- Developer blog posts = free marketing
- Low CAC ($0-10 organic)

### Phase 2: Content Marketing + SEO (Month 3-6)

**Channel: Search traffic**

Target keywords (low competition, growing search volume):
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

Content:
- Weekly blog post with real AI traffic data/insights
- Free tools: "AI Bot Traffic Scanner" (scan any URL)
- Monthly "State of AI Traffic" report (builds authority)

### Phase 3: SEO/Agency Partnerships (Month 6-12)

**Channel: Partnerships**

- Partner with SEO agencies — they need AI traffic reports for clients
- Integrate with existing SEO tools (Ahrefs, SEMrush via API)
- White-label option drives Business tier adoption
- Conference talks about AI traffic trends

### Phase 4: Paid Acquisition (Month 9+, only if unit economics proven)

**Channel: Ads**

- Google Ads for high-intent keywords
- Sponsorships on SEO/marketing newsletters
- Only after LTV:CAC validated at >5:1

---

## 7. Customer Journey

### Free User → Starter ($19/mo)

```
Trigger:  User hits 10K event limit OR wants more than 7 days history
Timeline: Usually within 2-4 weeks of install
Path:     Free → sees "Upgrade for 30-day history" → Starter
```

### Starter → Pro ($49/mo)

```
Trigger:  User wants Content AI Scores, API access, or exports
Timeline: Usually 2-3 months after Starter
Path:     Starter → sees score previews → wants full scores → Pro
```

### Pro → Business ($149/mo)

```
Trigger:  Agency managing multiple client sites
Timeline: Usually agencies sign up directly at Pro/Business
Path:     Agency trial on Pro → needs white-label + team → Business
```

---

## 8. Key Metrics & North Star

### North Star Metric

**Active Sites with AI Traffic Detected**

Why: Measures real value delivery. A site actively detecting AI traffic = engaged user.

### Growth Metrics

| Metric | Target M3 | Target M6 | Target M12 |
|--------|-----------|-----------|------------|
| Free installs (cumulative) | 300 | 1,300 | 4,800 |
| Active sites (weekly) | 100 | 400 | 1,500 |
| Paid customers | 9 | 42 | 148 |
| MRR | $333 | $1,554 | $5,476 |
| Free → Paid conversion | 3% | 3.2% | 3.1% |

### Health Metrics

| Metric | Target |
|--------|--------|
| Monthly churn | <7% |
| NPS | >40 |
| Time to value (first AI detection) | <5 minutes |
| Support tickets/customer/month | <0.5 |
| Uptime | 99.5% |

### Unit Economics Metrics

| Metric | Target |
|--------|--------|
| ARPU | $35-40/month |
| CAC (blended) | <$30 |
| LTV | >$400 |
| LTV:CAC | >10:1 |
| Gross margin | >90% |
| Payback period | <2 months |

---

## 9. Competitive Moat — What's Defensible?

### Short-term moats (6-12 months)

1. **Data network effect:** More sites → more AI traffic data → better benchmarks → attracts more sites
2. **Analytics depth:** Cloudflare/Known Agents focus on detect+block. We focus on analyze+optimize. Different product.
3. **Multi-platform SDK:** Works on any hosting. Not locked to one platform.
4. **Speed to market:** 70% built. Can ship in weeks while competitors would need months.

### Medium-term moats (1-2 years)

1. **AI traffic benchmark database:** "What's normal AI traffic for a tech blog? E-commerce site? News site?" — only possible with aggregated data from thousands of sites.
2. **Content AI Score credibility:** If widely adopted, becomes the standard for "how AI-friendly is my content."
3. **Developer ecosystem:** SDKs for every platform + open-source components.
4. **Distribution via agencies:** Once agencies adopt for client reporting, sticky relationship.

### Moats we DON'T have

- No proprietary data source (unlike Profound's CDN partnerships)
- No enterprise relationships
- No brand recognition
- No patents

---

## 10. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Cloudflare adds analytics** to AI Crawl Control | 40% | HIGH | Differentiate on cross-platform + content intelligence. Cloudflare analytics would be basic. |
| **Known Agents adds analytics** dashboard | 30% | MEDIUM | They focus on WordPress/robots.txt. Our developer SDK approach is different. |
| **AI bots start hiding** (no UA, no IP verification) | 20% | HIGH | Invest in behavioral detection (Layer 2+3). Server-side detection handles stealth bots better. |
| **Market too small** — site owners don't care about AI traffic | 35% | HIGH | Pivot to "AI SEO optimization" (Content AI Score as core) if tracking alone doesn't resonate. |
| **Low conversion** — free tier too generous | 30% | MEDIUM | Adjust free limits. Gate page-level analysis or time-range. |
| **Team bandwidth** — side project, slow progress | 40% | MEDIUM | Focus ruthlessly on Phase 1. Ship small, iterate fast. |

### Biggest Risk: "Nice to have, not must-have"

The #1 risk is that AI traffic analytics is interesting but not urgent enough to pay for.

**Mitigation plan:**
- Phase 1 validates "do people install?"
- Phase 2 validates "do people pay?"
- If conversion <1.5% by Month 6 → pivot to Content AI Score as standalone product (more actionable, clearer ROI)

---

## 11. Team & Resource Plan

### Phase 1 (Month 1-4): Founders Only

```
Person 1 (Big): Backend + infrastructure + server SDK
Person 2 (Team): Frontend dashboard + tracker
Time commitment: Side project, 15-20 hours/week each
Cost: $0 salary, $100/mo infra
```

### Phase 2 (Month 5-8): First Hire

```
+ Part-time frontend contractor: Dashboard polish, landing page
Cost: $2,000-3,000/month
Trigger: >30 paid customers OR >$1K MRR
```

### Phase 3 (Month 9-12): Small Team

```
+ Full-time developer: SDKs, integrations, scale
+ Part-time content writer: Blog, SEO, docs
Cost: $5,000-6,000/month total
Trigger: >100 paid customers OR >$4K MRR
```

---

## 12. Potential Pivot Paths

If the current direction doesn't work, here are adjacent pivots using the same codebase:

### Pivot A: "Content AI Score" Standalone

If tracking doesn't convert but scores resonate:
- Drop tracking, focus on on-demand page scanning
- "Lighthouse for AI visibility" — scan any URL, get AI readiness score
- Pricing: per-scan ($0.10) or subscription for continuous monitoring
- Competitor: None at this price point

### Pivot B: "AI Traffic API" (B2B)

If individual sites don't pay but tools/platforms want data:
- Sell aggregated AI traffic benchmarks as API
- Customers: SEO tools, marketing platforms, agencies
- Pricing: API calls ($0.001/call) or enterprise license
- Requires: >1,000 sites for meaningful data

### Pivot C: "AI Referral Attribution" (Marketing Focus)

If AI referral tracking is the most valued feature:
- Position as "UTM for AI traffic"
- Deep integration with GA4, Mixpanel, Amplitude
- Pricing: Based on tracked referrals
- Competitor: Loosely competes with Profound's attribution

---

## 13. Exit Scenarios

### Most Likely (2-3 years)

**Acqui-hire or small acquisition by SEO/analytics company**
- Ahrefs, SEMrush, Moz, or similar
- $1-5M range depending on traction
- Triggered by: 500+ paid customers, strong brand in AI analytics niche

### Upside (3-5 years)

**Acquisition by larger platform**
- Cloudflare (to add analytics to AI Crawl Control)
- Vercel (developer-focused AI analytics)
- HubSpot (marketing analytics expansion)
- $5-20M range
- Triggered by: 2,000+ paid customers, $200K+ ARR, strong data moat

### Lifestyle Business Option

**Self-sustaining niche SaaS**
- $10-20K MRR = good income for small team
- No fundraising needed
- Requires: 250-500 paid customers at $40 ARPU
- Timeline: Month 12-18

---

## 14. Summary: Why This Business Can Work

```
✅ Market is real         → Profound's $58.5M funding validates demand
✅ Gap exists             → No analytics tool for SMB/dev (only detect+block)
✅ Code is 70% built      → Ship in weeks, not months
✅ Team has right skills   → JS/TS/NestJS/PHP matches the product
✅ Low burn rate          → Side project start, scale when validated
✅ Clear differentiation  → Analytics (us) ≠ Detection (Cloudflare/Known Agents)
✅ Multiple pivot paths   → If Plan A fails, B/C are viable

⚠️ Risks to watch:
   - "Nice to have" risk — validate willingness to pay early
   - Cloudflare adding analytics — differentiate on depth
   - Market may be smaller than estimated — have pivot paths ready
```

---

*This business model is designed to be realistic and testable.
Every assumption has a validation checkpoint.
No fantasy math. No $100K MRR projections without evidence.*
