---
"@siteimprove/alfa-dom": patch
---

**Fixed:** `Native.fromWindow` now behaves better in case when injected in content scripts.

Some browsers make content scripts live in different worlds than the actual page. This causes `.constructor.name` to fail when run from the content script on object created in the page (typically, all DOM objects), in turn crashing the CSS rule type detection.

This introduces a heuristic to catch this case and fall back on other solutions.
