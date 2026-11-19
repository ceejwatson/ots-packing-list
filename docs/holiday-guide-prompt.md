# Prompt for Claude Code (Opus 5.5): Black Friday and Christmas Amazon Shopping Guide

Copy everything below the line into Claude Code.

---

You are building a production-ready Black Friday and Christmas gift guide website that earns Amazon Associates commissions, ranks well on Google, and can be marketed easily by a non-technical owner through an admin dashboard. Work autonomously end to end. Make sensible decisions instead of asking questions, and list assumptions in the final summary. Today is late November, so speed to a working, deployable version matters. Ship a solid MVP first, then layer on polish.

## 0. Setup and ground rules

- Check the current repo first. If it already contains a Next.js (App Router) + TypeScript + Tailwind app, build inside it as a new section (`/holiday`) and reuse its layout, components and Vercel config. If it is empty or unrelated, scaffold a new Next.js 14+ App Router project with TypeScript and Tailwind.
- The site domain is `dealsunderthetree.com` (use it for canonical URLs, sitemap, Open Graph and `NEXT_PUBLIC_SITE_URL`). If it has been taken by the time you deploy, use `giftpickdaily.com` or `giftdealdaily.com` instead. Make the domain a single env var so it can be changed in one place.
- Deploy target is Vercel. Keep it compatible with `vercel.json` and env vars (never commit secrets; update `.env.example` for every new variable).
- Develop on the branch you are given, commit in small logical steps, and open a draft PR when done.
- Use a persistent store that works on Vercel: Supabase (Postgres) if available, otherwise Vercel Postgres or a typed JSON/KV fallback behind a repository interface so storage can be swapped. Include SQL migrations and a seed script with realistic sample data (clearly marked as sample).

## 1. Amazon Associates compliance (non negotiable)

Breaking these rules gets the account banned, so build them in:

- Every page with affiliate links shows a clear, conspicuous disclosure near the top: "As an Amazon Associate I earn from qualifying purchases." Also add a full `/affiliate-disclosure` page and link it in the footer.
- Do NOT scrape Amazon. Do NOT hardcode or cache prices, ratings or availability beyond what the terms allow. Either (a) show no prices and use phrases like "Check price on Amazon", or (b) integrate the Amazon Product Advertising API (PA-API 5 / Creators API) behind an adapter with env-based keys, caching under the permitted window, and "Prices and availability accurate as of [time] and subject to change" text. Build (a) as the default and (b) as an optional adapter.
- All outbound links use the owner's tag (`NEXT_PUBLIC_AMAZON_TAG`), `rel="sponsored nofollow noopener"` and `target="_blank"`. Route clicks through an internal `/go/[slug]` redirect so links can be fixed in one place and clicks can be counted.
- Include a "Prices change fast, deals can end anytime" note. Never imply a deal is guaranteed. No fake countdowns or fake scarcity. If a countdown is shown it must be tied to a real, admin-entered end date.
- Do not copy Amazon product images or copy unless allowed. Support admin-uploaded images and PA-API images, and use Amazon's official link or image widgets as a fallback.
- Do not place affiliate links in emails in violation of the terms: email and social posts should link to the guide pages on the site, not directly to Amazon.

## 2. Public site: design and conversion

Goal: it should feel like a trusted, editorial, mobile-first gift guide that people share.

Pages:
1. Home `/holiday`: hero with a countdown to Cyber Monday and Christmas (real dates, auto-rolling), "Today's Top Deals" strip, gift category tiles, price-bracket shortcuts (Under $25, $50, $100), "Gifts for" shortcuts (Him, Her, Kids, Teens, Dad, Mom, Coworkers, Pets, Gamers, Home Cooks, Tech Lovers), email signup block, and a "Last updated" timestamp.
2. Guide pages (the SEO workhorses): `/holiday/guides/[slug]`, for example "Best Black Friday Tech Deals", "Best Gifts Under $25", "Best Gifts for Dad". Each has an intro, a quick picks table at the top (jump links), ranked product cards with a short honest "why we picked it" blurb, pros and cons, who it is for, a primary "Check price on Amazon" button, an FAQ section, and a related guides block.
3. Category and "gifts for" listing pages with filters (price bracket, recipient, category) and sorting.
4. Deal tracker `/holiday/deals`: admin curated deals with badge, expiry, and "ended" auto-state that moves expired deals to an archive instead of deleting them.
5. Gift finder: a short quiz (recipient, budget, interests) that returns 5 to 8 matching picks from the catalog using simple scoring on tags. No AI cost required, but structure it so an AI recommender could be added later.
6. Shareable wishlist: visitors can save items locally (no account), then share a link or copy a text list.
7. Static trust pages: About, How we pick, Affiliate disclosure, Privacy, Contact.

UX requirements:
- Mobile first, thumb friendly, sticky bottom bar on mobile with "Top Deals", "Guides", "Search".
- Fast: Lighthouse performance 90+ mobile, CLS near zero, images via `next/image` with dimensions, lazy loading below the fold.
- Accessible: WCAG AA contrast, keyboard navigation, alt text, focus states, `prefers-reduced-motion`.
- Festive but tasteful design system (a palette, type scale and spacing tokens, dark and light), reusable components: `ProductCard`, `DealBadge`, `Countdown`, `ComparisonTable`, `FAQ`, `EmailCapture`, `ShareBar`.
- Social proof that is true only: "Updated daily", number of picks, no fabricated reviews or testimonials.
- Share bar on every guide (Facebook, X, Pinterest, WhatsApp, Reddit, copy link, native share on mobile) with UTM tagging.
- Exit-intent and scroll-based email capture that is non annoying (once per session, dismissible, mobile friendly).

## 3. SEO (optimize aggressively)

- Use the Next.js Metadata API for unique title, description, canonical, Open Graph and Twitter cards on every page. Titles under about 60 characters, descriptions under about 155, with the primary keyword up front and the year (2026) included where it helps.
- JSON-LD structured data: `Article` or `ItemList` for guides, `Product` where compliant (no fake ratings or review markup), `FAQPage`, `BreadcrumbList`, `Organization`, `WebSite` with `SearchAction`.
- Generate `sitemap.xml` (dynamic, includes lastmod) and `robots.txt`. Exclude `/admin`, `/go`, and API routes from indexing. Add `noindex` to admin and thin or expired pages as appropriate.
- Programmatic OG images per guide using `next/og` so every share looks great.
- Clean semantic HTML (one H1, logical H2/H3), descriptive anchor text, internal linking between guides, breadcrumbs, and a "related guides" block.
- Target keyword clusters and write real, useful content for each guide, for example: "Black Friday 2026 deals", "best Cyber Monday deals", "best gifts under $25", "best gifts for dad", "last minute Christmas gifts", "best tech gifts 2026", "stocking stuffer ideas", "white elephant gift ideas". Put a keyword plan in `docs/seo-plan.md` (primary and secondary keywords, search intent, target page, internal link plan).
- Evergreen URLs: keep `/holiday/guides/best-black-friday-deals` rather than adding the year to the slug, and update content each season.
- Core Web Vitals work: font optimization with `next/font`, minimal client JS (prefer server components), no layout shift from ads or embeds.
- Add Google Search Console and Bing verification via env vars, a Google Analytics 4 (or Plausible) integration behind a consent banner, and a documented checklist in `docs/seo-launch-checklist.md` (submit sitemap, request indexing, check rich results, internal link audit).
- Content quality for E-E-A-T: author bio, "how we choose" methodology, honest pros and cons, last-updated dates, and no thin AI filler. If you draft copy, make it specific, helpful and human sounding, and flag anything that needs the owner's real experience.

## 4. Admin dashboard (`/admin`)

Protected with real authentication (Supabase Auth or NextAuth with a single owner login via env-configured email, plus rate limiting). No hardcoded passwords. All admin API routes verify the session server side. Add CSRF protection and input validation (zod).

Admin features, all usable on a phone:
- **Dashboard**: clicks today, week and total by product, guide and source; top products; email subscribers; top referrers; a simple chart; conversion funnel (page view, click out). Store click events in the DB through the `/go/[slug]` redirect with UTM and referrer capture, bot filtering, and privacy conscious hashing of IPs.
- **Products CRUD**: title, ASIN, Amazon URL (auto build the tagged link from ASIN), image upload or URL, short blurb, pros and cons, tags, categories, recipient tags, price bracket, rating of your own, featured toggle, active toggle, bulk import and export via CSV.
- **Deals manager**: attach a deal to a product with badge text, start and end date, sort order, and auto-expire. One click "Mark deal ended".
- **Guides editor**: create and edit guides with a rich or Markdown editor, drag and drop product ordering, SEO fields (title, description, slug, OG image) with a live Google snippet preview and a character counter, FAQ editor, draft, scheduled and published states, and a live preview.
- **Link health check**: a button and a scheduled job that flags dead or out-of-stock Amazon links so they can be swapped fast.
- **Settings**: Associate tag, site name, social handles, countdown target dates, banner message, disclosure text, analytics IDs.

## 5. Marketing toolkit inside the admin (the key feature)

The owner wants to promote the site with one click. Build a **Marketing** area and a prominent **"Promote this" button** on every guide, deal and product in the admin, plus a floating "Share a post" button on the public site visible only when logged in as admin.

- **Post generator**: pick a guide, deal or product and a platform (Facebook, Instagram, X, Pinterest, TikTok caption, Reddit, Threads, Email). It generates several ready-to-post variations with a hook, benefit, emoji where natural, hashtags and the tracked guide URL. Provide templates for urgency, gift ideas, and "deal drop" formats. Use the Anthropic API (`ANTHROPIC_API_KEY`, model configurable via env, default to the latest Claude model) for generation, with a non-AI template fallback if the key is missing. Always keep copy honest and never invent prices or discounts.
- **One-click publishing where an API exists, copy and open flows where not**: implement adapters behind a common `SocialPublisher` interface. Facebook Page and X via their APIs when tokens are configured. For Instagram, TikTok, Pinterest and Reddit, give a "Copy caption + Download image + Open composer" flow that works with no API setup. Show clear setup instructions per platform in `docs/marketing-setup.md`. Do not implement anything that violates a platform's terms (no auto-follow bots, no fake accounts, no spam, no mass posting).
- **Auto-generated share images**: 1080x1080, 1080x1350 and 1000x1500 (Pinterest) branded images for each guide and deal via `next/og`, downloadable from the admin.
- **Content calendar**: schedule posts (with a Vercel Cron job that publishes due posts), show status (draft, scheduled, posted, failed), and a suggested posting calendar for Black Friday week, Cyber Monday, Green Monday, Free Shipping Day, and the countdown to Christmas.
- **Email**: a subscriber list with double opt-in, unsubscribe link, and CAN-SPAM compliant footer, plus a simple broadcast composer using Resend (env configured). Templates for "Black Friday is live", "Top 10 deals", "Last day for shipping". Emails link to the site's guide pages, not directly to Amazon.
- **Short links and QR codes**: `/s/[code]` links with campaign tags (`utm_source`, `utm_medium`, `utm_campaign`) and QR code download for flyers or in-person sharing.
- **Campaign analytics**: clicks and subscribers per campaign, so the owner can see which post made money.
- **Widget and embed**: a "Gift Guide" banner snippet the owner can embed on other sites, and a web-push or floating bar option for deal alerts.
- Add a **"Launch checklist"** card on the admin home that tracks: tag set, disclosure live, sitemap submitted, 10+ guides published, email signup working, first posts scheduled.

## 6. Seed content

Seed the database with realistic structure so the owner can see it working immediately: about 8 guides and 40+ example products across categories. Mark all seed products as `sample` and make the admin show a banner "Replace sample products with real ones before launch". Do not fabricate prices, discounts, or reviews, and do not claim a product is on sale unless an admin sets a deal.

## 7. Quality bar

- TypeScript strict, no `any` leaks, eslint and prettier clean, `npm run build` passes.
- Tests: unit tests for the affiliate link builder, deal expiry logic, and slug and SEO helpers; a couple of Playwright smoke tests (home loads, guide loads, `/go/[slug]` redirects with the tag, admin requires login).
- Security: sanitize any rendered Markdown, validate all inputs, rate limit login, email signup and click endpoints, set security headers.
- Privacy: cookie and consent banner for analytics, privacy policy page, and unsubscribe handling.
- Performance budget and a short `docs/performance.md` with measured Lighthouse scores.
- Write `docs/README-holiday.md` covering env vars, setup, how to add a product, how to publish a guide, how to run a campaign, and how to deploy.

## 8. Process and deliverables

1. Output a brief plan with architecture, data model and file layout, then start building without waiting for approval.
2. Build in this order: data model and migrations, public pages, affiliate link and `/go` redirect, SEO layer, admin auth and CRUD, marketing toolkit, analytics, tests, docs.
3. Run the dev server and verify key pages in the browser with Playwright screenshots at mobile and desktop widths. Fix visual issues.
4. Run lint, type check, tests and a production build before finishing.
5. Commit, push to the assigned branch, and open a draft PR with a clear description.
6. Finish with a summary that covers: what was built, env vars needed, the manual steps only the owner can do (Amazon Associates tag, PA-API approval, social API tokens, domain, Search Console verification), assumptions made, and a prioritized "next 7 days to maximize Black Friday and Cyber Monday revenue" action list.

If you hit a choice that is not covered here, pick the option that is most compliant with Amazon's Associates Program Operating Agreement, best for page speed, and easiest for a non-technical owner to run.
