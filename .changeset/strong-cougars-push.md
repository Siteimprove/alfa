---
"@siteimprove/alfa-performance": patch
---

**Changed:** `Performance.now()` does not try to use `node:perf_hooks` anymore.

This created problem when trying to bundle `Performance` for browsers, where `node:` imports are not available.
