---
"@siteimprove/alfa-act": minor
---

**Breaking:** `Diagnostic.empty` is now a function with 0 parameters, instead of a constant.

This matches better the singleton pattern that we use for empty instances in other packages.
