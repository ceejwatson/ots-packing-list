# Paste any car listing. Know if it's a good deal in 10 seconds.

A used-car buying advisor. Paste a listing link or the listing text and get a complete
buying report: what the car is actually worth, what breaks on that exact year and model,
what five years of ownership costs, the warning signs in the seller's own wording, and
the number you should offer.

**[DESIGN.md](./DESIGN.md)** covers the architecture, data strategy, legal constraints
around listing sites, and the launch plan. Read that first if you're evaluating the
approach rather than running the code.

## The one design rule

**The language model never produces a number.**

It reads messy listing prose into structured fields, and it explains the finished
analysis in plain English. Every dollar figure, score, and probability comes from
deterministic TypeScript you can read, test, and argue with. A model asked to "estimate
fair market value" returns a confident, unfalsifiable number that nobody can audit when a
buyer overpays on the strength of it.

That split is why the whole analysis layer is unit-tested and runs with no API key.

## Running it

```bash
npm install
cp .env.example .env.local     # add ANTHROPIC_API_KEY
npm run dev                    # http://localhost:3000
```

**Without an API key it still runs.** Listings are read with pattern matching instead of
the model, the summary is computed rather than written, and follow-up chat is hidden.
Scoring, valuation, and cost analysis are fully deterministic and unaffected.

```bash
npm test         # 35 tests, no API key needed
npm run typecheck
npm run build
```

## What the report covers

| Section | What it does |
|---|---|
| **Buy Score** | 0–100 from five weighted, individually-shown components |
| **What it's worth** | Fair value range with every adjustment listed — depreciation, mileage, title, disclosed condition, dealer vs. private |
| **Watch out for** | Deterministic detection of branded titles, scam patterns, emissions deletes, odometer inconsistency, dealer fee games, rust-belt exposure, flood-state title washing |
| **Reliability** | Brand and model priors with **model-year-scoped** known failures — a 2015 Altima gets the CVT warning, a 2022 doesn't |
| **Five-year cost** | Fuel, insurance, maintenance, repairs, tires, registration, depreciation |
| **Insurance** | Rating-factor estimate by driver age, state, vehicle value, and record |
| **Maintenance forecast** | Year-by-year services and probability-weighted likely repairs |
| **What to offer** | Opening offer, target, walk-away price, leverage points, questions for the seller |
| **Lifestyle fit** | Only shown if you answer the optional questions — no fabricated match score |
| **Alternatives** | Same-segment vehicles that are meaningfully more reliable at a similar price |
| **Ask about this car** | Follow-up chat grounded in this report only |

## Accuracy, stated honestly

The valuation model is **not yet calibrated against real transaction data**. Spot checks
suggest it reads conservative — biased low — on late-model mainstream vehicles, by roughly
10–20% on cars under six years old, and is closer on older ones. Displayed ranges are
widened accordingly, and confidence is shown on every estimate.

Calibrating against a licensed comps feed is the top pre-launch task. The plan is in
[DESIGN.md §7](./DESIGN.md#7-known-limitations-honestly-stated).

## On reading listings automatically

Facebook Marketplace and Craigslist prohibit automated collection and have litigated it
successfully. This app does not scrape them. It reads only public Open Graph and
schema.org metadata — the same surface every link-preview unfurler reads — requests a page
once with an honest user agent, and never retries through a block.

Pasting the listing text works everywhere, produces *better* extraction than metadata
(the seller's description is where the red flags are), and is treated as a first-class
input rather than a fallback. [DESIGN.md §5](./DESIGN.md#5-getting-listing-data-the-legal-constraints-are-the-hard-part)
covers the compliant paths at scale.

## Disclaimer

Estimates are modeled from public data and published cost studies. They are not quotes,
appraisals, or a substitute for a pre-purchase inspection by a mechanic you chose.
