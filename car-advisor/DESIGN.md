# Design and implementation plan

This document covers the architecture, data strategy, legal constraints, and launch plan
for the used-car buying advisor. The working code in this directory implements the MVP
described in sections 1–6; sections 7–11 are the plan for getting it to launch.

---

## 1. Positioning: don't sell the AI

Your instinct here is right, and it should be a rule rather than a preference.

"AI Car Buying Assistant" describes the implementation. "Paste any car listing. Know if
it's a good deal in 10 seconds" describes the outcome, and it's stronger for three
separate reasons:

1. **It survives commoditization.** Every product will have AI in it within a year.
   "Knows if it's a good deal" is a claim about the result, and it stays differentiating.
2. **AI branding actively hurts trust in this category.** The user is about to spend
   $20,000. "AI-generated" reads as "possibly made up" to exactly the skeptical, careful
   buyer who is your best customer. Leading with data sources and showing your work
   ("here's how we got this number") converts better than leading with the model.
3. **It sets the right expectation.** People know what a deal is. Nobody knows what an
   AI car assistant does until they try it.

The name should be a verdict, not a technology. `Should I Buy This Car`, `CarVerdict`,
`Kicktires`, `Dealcheck` all work. The app in this directory uses **CarVerdict** as a
placeholder; the headline is the real brand asset.

**Where AI stays visible:** the follow-up chat, because there the intelligence *is* the
feature and users expect a conversation. Everywhere else, the model should be invisible
plumbing.

---

## 2. The core architectural decision

**The model never produces a number.**

This is the single most important design choice in the product, and everything else
follows from it.

A language model asked to "estimate the fair market value of a 2018 CR-V with 78,000
miles" will produce a confident, plausible, unfalsifiable number. It will be wrong in
ways nobody can audit, it will be inconsistent between runs, and when a user overpays by
$3,000 on the strength of it, there is no defensible answer to "where did that come
from?"

So the system splits cleanly:

| Layer | Responsibility | Implementation |
|---|---|---|
| **Extraction** | Turn messy listing prose into structured fields | Regex pass + model pass, merged (`lib/extract.ts`) |
| **Analysis** | Every dollar, score, and probability | Pure deterministic TypeScript (`lib/valuation.ts`, `ownership.ts`, `insurance.ts`, `maintenance.ts`, `redflags.ts`, `score.ts`) |
| **Narration** | Explain the computed analysis in plain English | Model, with the analysis as its only source of facts (`lib/narrative.ts`) |
| **Conversation** | Answer follow-ups | Model, with the full report cached in the system prompt (`app/api/chat/route.ts`) |

The narration and chat prompts both carry an explicit instruction that every figure must
come from the supplied analysis, and that missing data must be named rather than
estimated. The chat prompt deliberately still permits general automotive knowledge
(how a CVT fails, what to check on a test drive) — that's genuinely useful and carries no
fabrication risk. The restriction is narrowly on *numbers specific to this car*.

Practical benefits beyond correctness: the analysis is unit-testable (35 tests in
`test/engine.test.ts` run with no API key), it's fast and nearly free, it works when the
model is down, and every number can be traced to a line of code when a user challenges it.

---

## 3. User flow

```
Paste URL ──┬─► fetch public metadata ──► extract ──┐
            │                                        ├─► resolve vehicle ──► analyze ──► report
Paste text ─┴──────────────────────────► extract ──┘                                       │
                                                                                            ▼
                                                            optional buyer profile ──► lifestyle fit
                                                                                            │
                                                                                            ▼
                                                                                   follow-up chat
```

Design rules that came out of building it:

- **One input, zero required fields.** The box accepts a URL. Everything else is optional
  and progressively disclosed. An empty listing still produces a complete report with
  loudly-labeled assumptions rather than an error.
- **The paste path is a first-class citizen, not a fallback.** Several major sites cannot
  be read automatically (§5). The UI presents pasting as an equal option and auto-opens
  the paste box when a fetch is blocked, with the specific reason.
- **Degrade, never refuse.** Missing mileage assumes 12,000/year and says so in
  `dataNotes`. Unknown model uses segment averages and says so. Confidence drops to `low`
  and the value range widens.
- **Show the work.** Every section carries its basis: the valuation lists its
  adjustments, the score shows its five weighted components, the cost table lists its
  assumptions. This is the trust mechanism that replaces "trust the AI."

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router, TypeScript | One deployable for UI and API; route handlers are enough backend for the MVP |
| Hosting | Vercel | Zero-config, edge CDN, matches the existing repo's setup |
| Model | Claude Opus 5 via `@anthropic-ai/sdk` | Structured outputs for extraction; prompt caching makes chat cheap |
| Styling | Tailwind, CSS custom properties | Light/dark handled by variables, no theme library |
| State | Client-side only | The report is passed straight to the browser; no database in the MVP |
| Tests | `node:test` via `tsx` | The analysis layer is pure functions, so tests need no server and no API key |

**Deliberate omissions for the MVP:** no database, no auth, no queue. The whole analysis
is a stateless function of the listing. Add persistence when you add shareable report
links (§8), which is also when you get the viral loop — not before.

**Cost per report** is one extraction call plus one short summary call, both small.
Prompt caching on the chat route means the report context is written to cache once and
read at ~10% cost on every follow-up turn, so a long conversation is dramatically
cheaper than it looks.

---

## 5. Getting listing data: the legal constraints are the hard part

This is where most versions of this product die, so it deserves the most detail.

### What you cannot do

| Site | Constraint |
|---|---|
| **Facebook Marketplace** | ToS explicitly prohibit automated collection. Meta litigates this aggressively and has won repeatedly (*Meta v. Bright Data* and related actions). Listing bodies also sit behind authentication. **Do not scrape.** |
| **Craigslist** | *Craigslist v. 3Taps* established both CFAA liability after an IP block plus revocation letter, and copyright in the listing compilation. They have won and collected. **Do not scrape.** |
| **AutoTrader / Cars.com / CarGurus** | ToS prohibit automated access. All three license data commercially — scraping while a licensing path exists is the worst posture in litigation. |
| **Dealer sites** | Highly variable. Many are franchise sites on shared platforms whose ToS mirror the aggregators'. |

The legal picture is genuinely nuanced — *hiQ v. LinkedIn* narrowed CFAA liability for
scraping *public* data, and *Van Buren* narrowed "exceeds authorized access." But CFAA is
not the only exposure: breach of contract (ToS), state computer-crime statutes,
copyright in listing text and photos, and trespass to chattels all remain live. For a
consumer product that wants partnerships and eventually acquisition, the reputational and
deal-blocking risk of a scraping posture exceeds the engineering convenience.

### What you can do

Four compliant paths, in the order I'd build them:

**1. User paste (ship this first — it's implemented).**
The user is accessing the listing themselves through their own authenticated session and
choosing to share the text with your service. No automated access, no ToS violation, no
authentication bypass. Works on every site including Facebook and Craigslist. Costs one
extra user action.

The reason this is viable rather than a compromise: extraction quality from pasted text is
*higher* than from metadata, because the user pastes the seller's full description — which
is exactly where the red flags live.

**2. Public metadata / link unfurling (implemented).**
Open Graph tags and schema.org JSON-LD are published by sites specifically so third
parties can read them; this is the same surface Slack, iMessage, and Twitter read. The
implementation in `lib/fetch-listing.ts` requests the URL once with an honest user agent,
reads only OG tags and JSON-LD, never retries through a block, never rotates identity,
and maintains an explicit blocklist for sites whose terms prohibit it. Many dealer
platforms publish full `schema.org/Vehicle` markup including VIN, price, and mileage.

**3. Licensed data APIs (the real answer at scale).**

| Provider | What it gives | Notes |
|---|---|---|
| **Marketcheck** | Live listing inventory, historical price data, market-day supply | The most direct fit; used by several comparison products |
| **Auto.dev** | Listings and VIN decode | Cheaper entry point, smaller coverage |
| **DataOne / VehicleDatabases** | VIN → full trim, options, original MSRP | Fixes the biggest accuracy gap in the current model (§7) |
| **NMVTIS approved providers** | Title brands, odometer records | The compliant route to title history; Carfax/AutoCheck need commercial agreements |

**4. Browser extension (best long-term UX).**
The user's own browser already has the page. An extension reads the DOM the user is
already viewing and sends structured data to your API. This is the user accessing their
own content — the same posture as paste, with none of the friction. It's also a moat:
"one click on any listing" is a materially better experience than any competitor doing
server-side scraping can legally offer.

### Free public data you should use immediately

These are government APIs, genuinely free, no ToS problem, and currently unused by the MVP:

| Source | Endpoint | Use |
|---|---|---|
| **NHTSA vPIC** | `vpic.nhtsa.dot.gov/api/` | VIN → year, make, model, trim, engine, body class. Removes almost all extraction ambiguity when a VIN is present. |
| **NHTSA Recalls** | `api.nhtsa.gov/recalls/recallsByVehicle` | Open recalls by year/make/model — a genuine red flag source |
| **NHTSA Complaints** | `api.nhtsa.gov/complaints/complaintsByVehicle` | Complaint volume by component. This is the data that should eventually *replace* the hand-curated issue catalog in `data/models.ts`. |
| **NHTSA Safety Ratings** | `api.nhtsa.gov/SafetyRatings` | NCAP crash ratings |
| **fueleconomy.gov** | `fueleconomy.gov/ws/rest/` | Official EPA city/highway/combined MPG by exact trim. Replaces the estimated MPG table. |

**Wiring VIN decode + complaints + fuel economy is the highest-value next task** and needs
no commercial agreement. It is a day of work and it upgrades three separate sections of
the report from "estimated" to "sourced."

---

## 6. How each number is computed

### Fair market value (`lib/valuation.ts`)

Original MSRP, run through four auditable adjustments:

```
value = MSRP(year, trim)
      × retention(age, brand, segment)     depreciation curve
      + mileageAdjustment(delta)           asymmetric, capped
      × titleMultiplier                    salvage 0.55, rebuilt 0.68, flood 0.50
      × accidentMultiplier                 −8% each, floor 0.78
      × disclosedConditionMultiplier       "mechanic special" 0.70, non-runner 0.45
      × channelMultiplier                  dealer retail +8% over private party
```

Two details that came out of testing against real cases:

- **The retention curve must flatten hard after year five.** Extending the early-years
  decay rate produced an 11-year-old sedan valued at scrap. Cars converge on *use value*
  — what a running car is worth to someone who needs transportation — not toward zero.
- **The mileage adjustment must be asymmetric.** High mileage is priced in aggressively;
  low mileage earns a bounded premium. A symmetric curve made an 8-year-old car with
  60,000 miles worth more than a 5-year-old car with the same 60,000, which is wrong and
  was caught by a monotonicity test.

The dealer/private-party distinction matters more than it looks: without it, every dealer
listing gets flagged as overpriced, because dealer retail legitimately sits above
private-party value.

### Buy Score (`lib/score.ts`)

Weighted sum of five components, always displayed with its breakdown:

| Component | Weight | Basis |
|---|---:|---|
| Price vs. market | 30 | −20% or better earns full marks, +25% earns zero |
| Reliability | 25 | Model-level score scaled to the weight |
| Red flags | 20 | Start at full, −8 serious, −2.5 caution, −0.5 info |
| Running costs | 15 | Cost per mile excluding depreciation vs. a $0.42 benchmark |
| Life remaining | 10 | Against a 200,000-mile / 18-year service life |

A score nobody can audit is a score nobody should trust, so the breakdown is not
collapsible and the test suite asserts the components sum to the total.

### Reliability (`lib/reliability.ts`, `data/models.ts`)

Brand prior → model override → powertrain modifiers (CVT −0.5, DCT −0.4, turbo −0.3,
Toyota/Honda hybrid +0.2, diesel −0.3) → age and mileage → known-issue penalties.

The catalog carries **model-year-scoped** failure modes, which is what makes this useful
rather than generic. A 2015 Altima gets the CVT warning; a 2022 Altima does not. Each
issue carries typical onset mileage and a repair cost range, and those feed the
maintenance forecast and the negotiation leverage directly.

### Five-year cost (`lib/ownership.ts`, `maintenance.ts`, `insurance.ts`)

The maintenance forecast walks the odometer and calendar forward mile by mile, firing
each service interval when crossed, then layers on the model's known failure modes
**probability-weighted** by severity — a $4,000 repair with a one-in-three chance shows as
~$1,300, because that's what's worth budgeting. An unscheduled-repair allowance scales
with age, mileage, brand cost multiplier, and the reliability score.

Insurance is a rating-factor model (driver age band × state × vehicle value × body style
× brand repair cost × record), not a quote, and says so.

### Red flags (`lib/redflags.ts`)

Deliberately deterministic — 14 text patterns plus structured checks on price delta,
mileage plausibility, rust-belt exposure, flood-state title washing, and missing VIN.
These are the patterns that cost people real money, and they must fire identically every
time rather than depending on what a model felt like mentioning.

---

## 7. Known limitations, honestly stated

**Valuation is not calibrated against real transaction data. This is the top pre-launch
risk.** The depreciation priors are reasoned estimates, not fitted parameters. Spot checks
during development suggest the model reads **conservative — biased low — on late-model
mainstream vehicles**, in the range of 10–20% on cars under six years old. It is closer on
older vehicles. Displayed ranges have been widened to ±10/14/20% by confidence level so
the point estimate isn't over-trusted, but that is mitigation, not a fix.

**The calibration plan:**

1. Pull 2,000–5,000 real listings across the top 50 models via a licensed feed
   (Marketcheck), spanning age, mileage, and region.
2. Fit `retention5yr`, the first-year drop, the post-year-five flattening constant, and
   the per-mile rate by minimizing median absolute percentage error against asking prices,
   adjusted for the typical ask-to-transaction spread.
3. Hold out 20% and report MdAPE by segment. Target ±8% median on mainstream vehicles.
4. Re-run quarterly — used-car depreciation curves shifted structurally after 2021 and
   have not fully reverted.

Until that's done, the honest framing in the UI is "estimated range," which is what it
currently says.

**Other known gaps:**

- **Trim handling is coarse.** A keyword-matched ±7%/+14% bump. VIN decode plus a real
  trim-level MSRP table fixes this properly and is the single biggest accuracy win
  available.
- **The model catalog covers ~60 vehicles.** Everything else falls back to segment
  averages, correctly labeled in `dataNotes`. NHTSA complaint data can generate this
  programmatically at full coverage.
- **No regional price variation.** Trucks cost more in Texas, convertibles more in
  Florida. The geo table exists and carries the hooks; the price factor isn't wired.
- **No photo analysis.** Listing photos contain enormous signal — panel gaps, overspray,
  tire wear, interior condition, salvage-auction backgrounds. This is a strong
  differentiator and the models are capable of it; it just wasn't in MVP scope.

---

## 8. Build sequence

**Phase 1 — MVP (this directory, complete)**
Paste-or-URL input, full deterministic analysis, written summary, follow-up chat,
responsive light/dark UI, 35 tests.

**Phase 2 — Accuracy (2–3 weeks)**
The credibility work, in priority order:
1. NHTSA vPIC VIN decode → exact trim/engine/body
2. fueleconomy.gov → real EPA MPG
3. NHTSA recalls + complaints → sourced reliability, replacing curated data
4. Licensed comps feed → calibrate the valuation model (§7)
5. Photo analysis of listing images

**Phase 3 — Shareability (1–2 weeks)**
This is the growth phase, and it needs the database the MVP skips.
- Persist reports, give each a short URL
- Generate an OG share image server-side: score dial, vehicle, one-line verdict. This is
  the artifact that gets posted to Reddit and shows up in group chats.
- "This Civic scored 94" is only a viral loop if the link renders as an image.

**Phase 4 — Monetization (§9)**

**Phase 5 — Extension and expansion**
Browser extension (§5.4). Then adjacent categories: motorcycles and RVs share the entire
model shape — depreciation curve, reliability priors, ownership cost, red flags — and need
only new data tables. Boats and heavy equipment need different cost models. Houses are a
different product; don't let the "AI purchase advisor for everything" vision pull focus
before the car product is calibrated and growing.

---

## 9. Revenue, and the regulatory strings attached

Agreed on avoiding a subscription at launch — it caps the top of the funnel exactly when
you need reach. But each revenue line has compliance requirements worth knowing before
you build it.

| Line | Reality check |
|---|---|
| **Insurance referrals** | The highest-value line, and the most regulated. Selling or soliciting insurance requires a producer license in most states. **Do not build direct carrier integrations.** Route through a licensed marketplace (EverQuote, MediaAlpha, Insurify) that carries the licensing and pays per lead. Disclose compensation. |
| **Financing prequalification** | Soft-pull prequal is fine with clear consent. The moment you display rates or route applications you're in TILA/Reg Z disclosure territory. Use a licensed partner network. |
| **Extended warranty** | High commissions and a well-earned reputation problem. Your product's entire value is honest advice; recommending a VSC on a car you scored 91/100 destroys that. If you do it at all, restrict to genuinely low-reliability vehicles and show the math. |
| **Accessories (affiliate)** | Cleanest line. FTC endorsement guides require clear and conspicuous disclosure. Amazon Associates is a natural fit and the existing repo already has the pattern. |
| **Premium report ($5–15)** | Works best as a *pre-purchase* upsell: VIN history, full trim decode, regional comps, negotiation script. Charge for the data that costs you money, not for a longer version of the free report. |

**The structural risk to name explicitly:** insurance and financing referrals pay you to
send users somewhere. Your product's value is being trusted. The moment a report's
recommendations bend toward the referral, the product is dead — slowly, and then all at
once. Concrete guardrails: never let referral partners influence the score, disclose
compensation inline rather than in a footer, and hold the referral prompt until *after*
the verdict is delivered.

---

## 10. Marketing

The share loop matters more than the ad spend:

- **The score is the shareable unit.** "This Tesla scored 41" is a post. A report is not.
  Ship the OG image (Phase 3) before spending on distribution.
- **The strongest content format is the reveal**: show the listing, let people guess, show
  the score and the reason. It works in 20 seconds on TikTok and Shorts and it advertises
  the product's actual function.
- **Reddit is the highest-intent channel and the most hostile to marketing.** r/whatcarshouldibuy,
  r/askcarsales, and model-specific subs will use a genuinely accurate free tool and will
  destroy an inaccurate one. Do not launch there until §7 calibration is done.
- **Dealer-side is a real risk.** A tool that tells people dealers are overcharging will
  attract dealer pushback. Being scrupulously fair — including the +8% dealer channel
  adjustment, which is honest about why dealer prices are legitimately higher — is both
  correct and defensible.

---

## 11. Repository layout

```
car-advisor/
├── app/
│   ├── api/analyze/route.ts    fetch → extract → analyze
│   ├── api/chat/route.ts       streaming chat, report cached in system prompt
│   ├── page.tsx                landing
│   └── layout.tsx, globals.css
├── components/
│   ├── Analyzer.tsx            input, loading, error handling
│   ├── ReportView.tsx          the report
│   ├── ProfileFields.tsx       optional buyer details
│   ├── ScoreDial.tsx           score gauge
│   └── Chat.tsx                follow-up questions
├── lib/
│   ├── types.ts                shared domain types
│   ├── extract.ts              regex + model extraction, merged
│   ├── fetch-listing.ts        public metadata only, with blocklist
│   ├── vehicle.ts              listing + catalog + segment → resolved vehicle
│   ├── valuation.ts            depreciation and market value
│   ├── reliability.ts          reliability scoring
│   ├── maintenance.ts          five-year service and repair forecast
│   ├── ownership.ts            total cost of ownership
│   ├── insurance.ts            rating-factor premium estimate
│   ├── redflags.ts             deterministic warning detection
│   ├── score.ts                weighted Buy Score
│   ├── negotiation.ts          offer targets, leverage, questions
│   ├── lifestyle.ts            buyer fit scoring
│   ├── alternatives.ts         same-segment suggestions
│   ├── narrative.ts            model-written summary
│   ├── report.ts               orchestration
│   └── anthropic.ts            model configuration
├── data/
│   ├── brands.ts               brand priors
│   ├── models.ts               ~60 vehicles with model-year-scoped issues
│   ├── segments.ts             body-style defaults
│   └── geo.ts                  ZIP → state, insurance/fuel/registration factors
└── test/engine.test.ts         35 tests, no API key required
```
