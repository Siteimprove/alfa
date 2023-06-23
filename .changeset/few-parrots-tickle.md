---
"@siteimprove/alfa-css": minor
---

**Breaking:** The `CALC` parameter of `Value` now defaults to `boolean` instead of `false`.

We do not assume anymore that `Value` are not calculated (`CALC=false`), the default is now `boolean` (i.e. we don't know).
