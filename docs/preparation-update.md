# Personalized preparation and interface update

The checklist now separates owning an item from packing it. Packing also marks an item owned; removing ownership removes its packed mark. Non-applicable items are omitted from required readiness. Optional items have separate counts.

The profile setup section has been removed. All personal items are visible by default, with per-item exclusions available. Seasonal requirements remain in item notes and preparation deadlines are relative to class start. Previously saved profile filters are cleared when reading progress so they cannot silently hide items. The original guide remains authoritative. Print version remains a blank master checklist of all items.

Progress uses `ots-preparation-v5`. Existing v4/v3 checkmarks migrate by name the first time they are read. New progress uses explicit permanent IDs; retain those IDs when renaming list entries. Saved data only contributes status flags: current descriptions, requirements, and shopping links always come from the shipped catalog.

Progress saves automatically in the browser; no import or export controls are included. A browser save failure keeps changes in memory and displays a warning. Reset clears owned/packed marks while retaining the exclusions. Same-browser tabs refresh on storage events; simultaneous writes still use last-write-wins. No account or cloud sync is introduced.

## Stock audit setup

The diagnostic endpoint requires `AUDIT_API_SECRET` and the existing Amazon credentials. It also requires `AUDIT_REDIS_REST_URL` and `AUDIT_REDIS_REST_TOKEN` for an Upstash-compatible Redis REST service. All are server-only variables; see `.env.example`.

Use a Redis database shared by all production instances. An atomic `SET NX EX` permits one audit every five minutes. Missing configuration or a failed rate-limit service returns 503, an invalid key returns 401, and an active cooldown returns 429 with Retry-After. Requests rejected by the guard never call Amazon. The gate remains leased for five minutes even when an audit fails, preventing rapid retry storms. No infrastructure has been provisioned by this change.

## Verification

- `npm test`: ID uniqueness, legacy migration, renamed-item persistence, seasonal boundaries, readiness/exclusions, date handling, invalid saved data, failed storage, authentication and distributed cooldown responses.
- `npm run build`: production compilation and TypeScript validation.
- `node scripts/browser-check.cjs`: requires a running app on port 3000, Playwright available as a Node module (or `PLAYWRIGHT_MODULE` set to its installed path), and Chrome. Uses isolated browser contexts. Checks mobile/desktop navigation, search/filtering, exclusions, persistence, reset, dates, failed-image links, storage errors and the unconfigured audit response. Writes screenshots locally.

The design includes navy surfaces, consistent controls, visible shopping links, a responsive desktop header, safe-area-aware mobile bottom navigation, and a resource footer. Mobile content reserves space for the fixed navigation.

## Simplified checklist update

The interface now has one completion checkbox per item, with N/A and an Amazon link under its image. Separate owned/packed controls and reset have been removed. The legacy is_packed storage field is retained only for compatibility and now represents a checkmark; previously owned or packed items migrate as complete. Unchecking clears both legacy flags. N/A items are excluded from required progress and can be restored through Show excluded.

The footer slash was removed and trailingSlash is explicitly false. The search title is more descriptive, structured list entries include stable item anchors, and the sitemap omits the noindex personal overview and artificial last-modified timestamps. Images remain lazy-loaded and now have a 68px optimization size. Apple touch icons use the current shield. Official emblem adoption is pending confirmation of commercial-use permission from its Air Force source: https://www.af.mil/News/Photos/igphoto/2000397249/.

Verified production build, TypeScript, unit checks, and mobile/desktop browser flows. These technical SEO changes do not guarantee rankings or traffic.
