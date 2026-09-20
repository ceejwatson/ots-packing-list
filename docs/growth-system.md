# Growth foundation — 20 September 2026

## Audit and priorities

Repository: ceejwatson/ots-packing-list. Public site: https://otspackinglist.com.
Architecture: Next.js 15 App Router, React 19, Tailwind, a TypeScript catalog and versioned browser-local progress. Preserve these foundations.

1. Trust and measurement: conspicuous disclosure, accurate uncertainty, aggregate interaction events and a protected dashboard.
2. Product verification: source and suitability review before product rankings, price comparisons or replacements.
3. Search evidence and experiments: connect Search Console and affiliate reports, establish a baseline, then pre-register one test.
4. AI review and marketing: add a model-backed reviewer only after data and cost controls are configured; human review before publication.

### Findings

- Existing public routes: checklist `/`, readiness `/dashboard`, FAQs `/faqs`, reporting `/reporting`, printable list `/print`. API: `/api/check-stock`. No existing protected growth dashboard.
- Catalog has stable IDs, quantities, notes, classifications, affiliate ASIN/search destinations and local images. No prices, ratings, verified availability timestamps or per-product suitability evidence. Do not invent these.
- Affiliate tag is hard-coded as `otspackinglis-20`. All existing destinations are preserved. Older README instructions implying an environment variable changes this tag are inaccurate.
- Vercel Web Analytics is mounted. There were no product exposure, affiliate-click, search-use or checklist interaction events. Revenue, conversions, search query and ranking data were not supplied.
- Unique metadata/canonicals, OpenGraph images, sitemap, robots, ItemList schema and FAQ schema already exist. Readiness and print pages are noindex. FAQ schema does not imply eligibility for a Google FAQ rich result. No Product ratings or fabricated review schema added.
- Search and category filtering mean not every catalog item is visible at once. Deep links to filtered items and full crawlable catalog coverage need a separate pass. Do not declare indexing healthy without Search Console.
- All referenced local product image files exist. Live product stock, image-product identity, manufacturer specifications and external destination health have not all been verified.
- Existing mobile navigation, saved progress and image/storage error fallbacks work in browser regression tests. No horizontal overflow at 375/390/430 pixels or tested desktop width. This is not a full accessibility conformance audit.
- Footer already disclosed affiliate relationships; placement near the first shopping links needed improvement. FAQ copy mixed official and anecdotal advice. Some unsupported medication, grooming, bedding and disciplinary claims were removed; remaining content still needs line-by-line source review.
- Public site was reachable and inspected. The official OTS search result links the March 2026 guide; direct fetching from the official host returned 403 during this run. An indexed result is not a new per-item verification. Do not stamp all entries “verified today.”
- Vercel connector returned no teams and project listing requires a team ID. Deployment settings, production logs, actual account analytics and production environment variables could not be inspected. No production changes made.
- Field Core Web Vitals, indexing coverage, conversion rate and revenue are unavailable. A successful build is not a speed score or evidence of growth.

## Measurement and setup

`/api/events` is disabled by default. Enable only with all GROWTH variables in `.env.example`. Use a separate Upstash-compatible Redis REST store; set an exact site origin. Use independently generated random secrets and HTTPS. Dashboard login at `/admin/growth`: user `admin`, password `GROWTH_ADMIN_PASSWORD` (at least 24 characters). Middleware and page-level authorization both protect it. Missing configuration fails closed.

Daily counters expire after 90 days. The dashboard reads the last 14 UTC dates including today. It counts page views, product cards at least 50% visible once per route visit, affiliate clicks, checklist interactions and debounced search interactions. Device and referrer categories attach only to page views. No query text, saved checklist contents, class date, visitor cookie or persistent visitor ID is collected. GPC and DNT suppress growth events. A daily HMAC of the request network address is used only for a 60-second rate key. Configure the hosting proxy to supply a trustworthy forwarding header; add platform bot protection if traffic warrants it. The aggregate endpoint cannot prove human identity or prevent all metric poisoning.

Clicks per 100 impressions is an event ratio; repeated clicks can exceed impressions. It is not visitor CTR or sales conversion rate. Search referrers do not distinguish paid and organic. Internal route visits are not session landing pages. Unavailable storage is never displayed as zero traffic. Vercel Analytics remains a separate source.

## Protected recommendations and experiments

The dashboard uses transparent deterministic rules, not an LLM. Suggestions include evidence, mechanism, difficulty and measurement. A 200-impression threshold only gates triage and is not a statistical significance claim. There is no automatic variant allocation, winner declaration, product replacement, paid campaign or content publishing.

Next experiment after measurement is verified: one category's existing card versus a card explaining independently verified product suitability and an alternative. Register hypothesis, eligibility, randomization unit, primary metric, minimum detectable effect, power/sample target, fixed duration and trust/performance guardrails before launch. Do not select a winner from a before/after comparison.

For a future AI reviewer, pass only verified aggregate reports and catalog audit results, require source IDs for every recommendation, save dated output, and prevent publishing or affiliate-ID changes. Schedule only after real credentials and a spending cap exist. This release does not run a scheduled AI agent.

## Content opportunities

Search-result research surfaced questions about 72-hour bags, backpack/hydration separation, waterproof electronics cases and seasonal clothing. These are intent signals, not measured keyword volumes. The dashboard records parent pages, incoming/outgoing links, required sources and refresh triggers. Extend existing pages where possible; do not mass-publish keyword variants.

Sources: https://www.afaccessionscenter.af.mil/Holm-Center/OTS/ and its linked March 2026 guide. Search signals included https://www.reddit.com/r/airforceots/comments/1t0d8bs/packing_for_ots/ and https://www.reddit.com/r/airforceots/comments/1uwlvxi/ots_packing/ . Community questions are not authority for requirements.

## Validation

- `npm test`: progress migrations, exclusions, seasonal boundaries, storage failures, affiliate tag preservation, event privacy/validation, product uncertainty, evidence rules and local image existence.
- `npm run build`: Next.js production compilation and TypeScript checks.
- Existing `scripts/browser-check.cjs`: browser regression flow for progress, filters, navigation, mobile overflow, failed images/storage and fail-closed stock API.
- `scripts/browser-growth.cjs`: build with `GROWTH_MEASUREMENT_ENABLED=true`, then test against an in-memory Redis double and a temporary local production server. Covers enabled events, auth, origins, invalid payloads, GPC and mobile dashboard. No synthetic data is sent to production.
- Manual agent-browser check: page rendered, controls present, no reported browser errors.

## Remaining work

Connect Vercel project access, real Redis configuration, Search Console and affiliate order/revenue reports. Verify official requirements item by item and product suitability, including images and alternatives. Persist dated stock audit results and add verified provider price/history support before flagging price changes or poor value. Finish keyboard/screen-reader and crawlability audits and obtain field performance data. Add randomized experiments, a scheduled model-backed review with cost controls, and approved marketing publication only after these dependencies are ready.

Rollback: revert this branch; retain existing catalog and progress keys. Growth counters are independent and expire automatically. Disable `GROWTH_MEASUREMENT_ENABLED` and redeploy to stop client measurement. Do not rotate or change affiliate IDs.
