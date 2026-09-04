---
"@siteimprove/alfa-selector": patch
---

**Fixed:** `:nth-child()`/`:nth-last-child()` selectors without an `of <selector>` clause (e.g. `:nth-child(3)`) now serialize back to valid CSS via `toString()`. Previously the output included a literal `of None` (e.g. `:nth-child(3 of None)`), leaking the internal `Option` representation.
