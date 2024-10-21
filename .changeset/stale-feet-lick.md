---
"@siteimprove/alfa-dom": patch
"@siteimprove/alfa-web": patch
---

**Changed:** `Node.from` and `Page.from` are now cached.

This makes multiple de-serialisation inexpensive as long as the JSON object is not discarded, thus simplifying logic for callers.
