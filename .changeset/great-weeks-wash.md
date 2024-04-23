---
"@siteimprove/alfa-dom": patch
---

**Added:** `Native.fromNode()` now includes an option to enforce `crossorigin: anonymous` on `<link>` element missing a CORS.

This can help solve some problem encountered during scraping, when they are tied to missing CORS policy.
