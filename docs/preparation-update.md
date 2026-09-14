# Personalized preparation and interface update

The checklist now separates owning an item from packing it. Packing also marks an item owned; removing ownership removes its packed mark. Non-applicable items and profile-excluded personal items are omitted from required readiness. Optional items have separate counts.

Class start dates promote the three existing cold-weather items to Required for October–May and calculate the preparation dates already described by the site. The original guide remains authoritative. Print version remains a blank master checklist of all items.

Progress uses `ots-preparation-v5`. Existing v4/v3 checkmarks migrate by name the first time they are read. New progress uses explicit permanent IDs; retain those IDs when renaming list entries. Saved data only contributes status flags: current descriptions, requirements, and shopping links always come from the shipped catalog.

Overview includes JSON backup export and validated import, with confirmation before replacement. A browser save failure keeps changes in memory and displays a warning. Reset clears owned/packed marks while retaining the profile and exclusions. Same-browser tabs refresh on storage events; simultaneous writes still use last-write-wins. No account or cloud sync is introduced.

## Stock audit setup

The diagnostic endpoint requires `AUDIT_API_SECRET` and the existing Amazon credentials. It also requires `AUDIT_REDIS_REST_URL` and `AUDIT_REDIS_REST_TOKEN` for an Upstash-compatible Redis REST service. All are server-only variables; see `.env.example`.

Use a Redis database shared by all production instances. An atomic `SET NX EX` permits one audit every five minutes. Missing configuration or a failed rate-limit service returns 503, an invalid key returns 401, and an active cooldown returns 429 with Retry-After. Requests rejected by the guard never call Amazon. The gate remains leased for five minutes even when an audit fails, preventing rapid retry storms. No infrastructure has been provisioned by this change.

## Verification

- `npm test`: ID uniqueness, legacy migration, renamed-item persistence, seasonal boundaries, readiness/exclusions, date handling, invalid backups, failed storage, authentication and distributed cooldown responses.
- `npm run build`: production compilation and TypeScript validation.
- `node scripts/browser-check.cjs`: requires a running app on port 3000, Playwright available as a Node module (or `PLAYWRIGHT_MODULE` set to its installed path), and Chrome. Uses isolated browser contexts. Checks mobile/desktop navigation, search/filtering, exclusions, persistence, backup/reset/restore, dates, failed-image links, storage errors and the unconfigured audit response. Writes screenshots and a test backup locally.

The design includes navy surfaces, consistent controls, visible shopping links, a responsive desktop header, safe-area-aware mobile bottom navigation, and a resource footer. Mobile content reserves space for the fixed navigation.
