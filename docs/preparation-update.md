# Checklist behavior

Each item has one completion checkbox. Checked cards use a solid pale-green background and green border. Completion persists in local browser storage; the legacy is_packed field represents completion. Previously owned or packed items migrate as complete. Unchecking clears both legacy flags.

Product images fit inside consistent 88px square frames without cropping. Images and Amazon links open the same product. The N/A button has been removed. Show excluded opens a dedicated view of previously excluded items, independent of category, search, and completion filters. Include item restores an excluded item to the checklist. Excluded items do not count toward required progress.

There are no profile, backup, import, export, or reset controls. Storage failures display a warning while retaining changes in memory. Same-browser tabs refresh on storage events; simultaneous writes use last-write-wins.

## Verification

Run node scripts/test-progress.cjs and node node_modules/typescript/bin/tsc --noEmit. The browser script requires a running app on port 3001 (or BASE_URL), Playwright (or PLAYWRIGHT_MODULE), and Chrome. It checks consecutive green cards, reload persistence, excluded-item restoration with conflicting filters, mobile overflow, navigation, storage errors, and image-failure links.

## Deployment notes

The stock diagnostic endpoint requires AUDIT_API_SECRET, Amazon credentials, AUDIT_REDIS_REST_URL, and AUDIT_REDIS_REST_TOKEN. Missing configuration fails closed with 503. Shared Redis enforces the audit cooldown.

Routes omit trailing slashes. SEO includes descriptive metadata and stable item anchors; personal overview is noindex. The current shield remains the site icon pending official emblem commercial-use permission.
